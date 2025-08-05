import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { ethers } from 'ethers';
import axios from 'axios';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

// For local development, allow self-signed certificates.
// In production (on Digital Ocean), NODE_ENV will be 'production' and this block will be skipped.
if (process.env.NODE_ENV !== 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// --- CONFIGURATION ---
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const STATIC_IP_PROXY_ENDPOINT = 'http://159.223.246.173/';
const EAS_GRAPHQL_ENDPOINT = 'https://base.easscan.org/graphql';
const SCHEMA_UID = '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9';
const GQL_QUERY = `
    query ConfirmVerifiedAccount($recipient: String!, $schemaId: String!) {
      attestations(
        where: {
          AND: [
            { recipient: { equals: $recipient } }
            { schemaId: { equals: $schemaId } }
            { revoked: { equals: false } }
          ]
        }
        take: 1
      ) {
        id
      }
    }
`;

const BAB_CONTRACT_ADDRESS = "0x2b09d47d550061f995a3b5c6f0fd58005215d7c8";
const BAB_ABI = ["function balanceOf(address owner) view returns (uint256)"];
const BSC_RPC_ENDPOINT = "https://bsc-dataseed.binance.org/";

const GALXE_PASSPORT_CONTRACT_ADDRESS = "0xe84050261cb0a35982ea0f6f3d9dff4b8ed3c012";
const GALXE_PASSPORT_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

// Stripe webhook needs raw body
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'setup_intent.succeeded') {
    const setupIntent = event.data.object;
    const clientReferenceId = setupIntent.metadata.client_reference_id;
    const stripeCustomerId = setupIntent.customer;

    if (clientReferenceId && stripeCustomerId) {
      try {
        await pool.query(
          'INSERT INTO verifications (wallet_address, stripe_customer_id, status) VALUES ($1, $2, $3) ON CONFLICT (wallet_address) DO UPDATE SET stripe_customer_id = $2, status = $3',
          [clientReferenceId, stripeCustomerId, 'verified']
        );
        console.log(`Successfully saved verification for wallet: ${clientReferenceId}`);
      } catch (dbError) {
        console.error('Database error on webhook processing:', dbError);
      }
    }
  }

  res.status(200).send();
});

app.use(express.json());


// --- Helper Functions ---
async function checkBinanceAttestation(address) {
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC_ENDPOINT);
    const contract = new ethers.Contract(BAB_CONTRACT_ADDRESS, BAB_ABI, provider);
    const balance = await contract.balanceOf(address);
    return balance > 0;
  } catch (error) {
    console.error(`BAB token check failed for address ${address}:`, error);
    return false;
  }
}

async function checkGalxePassport(address) {
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC_ENDPOINT);
    const contract = new ethers.Contract(GALXE_PASSPORT_CONTRACT_ADDRESS, GALXE_PASSPORT_ABI, provider);
    const balance = await contract.balanceOf(address);
    return balance > 0;
  } catch (error) {
    console.error(`Galxe Passport check failed for address ${address}:`, error);
    return false;
  }
}

async function checkStripeVerification(address) {
  try {
    const result = await pool.query(
      'SELECT id FROM verifications WHERE wallet_address = $1 AND status = $2',
      [address, 'verified']
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error(`Database check failed for address ${address}:`, error);
    return false;
  }
}

// --- API Endpoints ---

// Endpoint for the frontend to check for the Binance BAB token
app.get('/api/check-bab-token/:address', async (req, res) => {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    try {
        const hasToken = await checkBinanceAttestation(address);
        return res.json({ hasToken });
    } catch (error) {
        console.error('Error checking BAB token balance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for the frontend to check for the Galxe Passport NFT
app.get('/api/check-galxe-passport/:address', async (req, res) => {
  const { address } = req.params;
  const hasPassport = await checkGalxePassport(address);
  res.json({ hasPassport });
});

app.get('/api/get-setup-intent', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const setupIntentId = session.setup_intent;
    if (!setupIntentId) {
      return res.status(404).json({ error: 'Setup Intent not found for this session.' });
    }
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    res.json({ setupIntentId: setupIntent.id, status: setupIntent.status });
  } catch (error)    {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session details.' });
  }
});

app.get('/api/get-setup-intent-from-session', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const setupIntentId = session.setup_intent;
    res.json({ setupIntentId });
  } catch (error)    {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session details.' });
  }
});

app.post('/api/create-stripe-session', async (req, res) => {
  const { userWalletAddress } = req.body;

  try {
    // 1. Create a new Customer in Stripe
    const customer = await stripe.customers.create({
      metadata: {
        wallet_address: userWalletAddress,
      },
    });

    // 2. Create a Checkout Session for that new customer
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['us_bank_account'],
      mode: 'setup',
      customer: customer.id,
      success_url: `${FRONTEND_URL}/validate-microdeposits?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/dashboard?stripe_verification=cancel`,
      setup_intent_data: {
        metadata: {
          // We still use this for the webhook as it's easily accessible
          client_reference_id: userWalletAddress,
        },
      },
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
});

app.post('/api/verify-microdeposits', async (req, res) => {
  try {
    const { setupIntentId, amounts } = req.body;

    const retrievedIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (retrievedIntent.status === 'succeeded') {
      console.log(`SetupIntent ${setupIntentId} already succeeded.`);
      return res.status(200).json({ success: true });
    }

    if (retrievedIntent.status !== 'requires_action') {
      console.log(`SetupIntent ${setupIntentId} is in status ${retrievedIntent.status}, not 'requires_action'.`);
      return res.status(400).json({ error: 'SetupIntent is not ready for verification.' });
    }

    const verifiedIntent = await stripe.setupIntents.verifyMicrodeposits(
      setupIntentId,
      { amounts: amounts }
    );

    if (verifiedIntent.status === 'succeeded') {
      console.log(`Successfully verified SetupIntent ${setupIntentId}.`);
      res.status(200).json({ success: true });
    } else {
      console.log(`Verification failed for SetupIntent ${setupIntentId}, status: ${verifiedIntent.status}`);
      res.status(400).json({ error: 'Verification failed.' });
    }
  } catch (error) {
    console.error('Error during microdeposit verification:', error);
    const message = error.raw?.message || 'An unexpected error occurred during verification.';
    res.status(400).json({ error: message });
  }
});


// --- RPC Proxy Logic ---

app.post('/rpc', async (req, res) => {
    const { id, method, params } = req.body;

    // --- ATTESTATION CHECK FOR TRANSACTIONS ---
    if (method === 'eth_sendRawTransaction') {
        try {
            // 1. Decode the transaction to get the sender's address
            const tx = ethers.Transaction.from(params[0]);
            const userAddress = tx.from;

            // 2. Perform the GraphQL check for Coinbase attestation
            let hasCoinbaseAttestation = false;
            try {
                const gqlResponse = await axios.post(EAS_GRAPHQL_ENDPOINT, {
                    query: GQL_QUERY,
                    variables: {
                        recipient: userAddress,
                        schemaId: SCHEMA_UID,
                    }
                });
                const attestations = gqlResponse.data.data.attestations;
                if (attestations && attestations.length > 0) {
                    hasCoinbaseAttestation = true;
                }
            } catch (gqlError) {
                console.error("Coinbase attestation check failed:", gqlError);
            }


            if (!hasCoinbaseAttestation) {
              console.log(`Coinbase attestation not found for ${userAddress}. Checking for Binance attestation...`);
              const hasBinance = await checkBinanceAttestation(userAddress);
              if (!hasBinance) {
                console.log(`Binance attestation not found for ${userAddress}. Checking for Galxe Passport...`);
                const hasGalxe = await checkGalxePassport(userAddress);
                if (!hasGalxe) {
                  console.log(`Galxe passport not found for ${userAddress}. Checking for Stripe verification...`);
                  const hasStripeVerification = await checkStripeVerification(userAddress);
                  if (!hasStripeVerification) {
                    console.log(`Verification FAILED for address: ${userAddress}. No valid attestation or verification found.`);
                    return res.json({
                      jsonrpc: '2.0',
                      id,
                      error: {
                        code: -32602,
                        message: 'Permission Denied: Address does not have the required attestation or verification.'
                      }
                    });
                  }
                }
              }
            }
            
            console.log(`Verification SUCCEEDED for address: ${userAddress}`);
            
          } catch (error) {
            console.error("Attestation check failed:", error);
            return res.status(500).json({
                jsonrpc: '2.0',
                id,
                error: { code: -32603, message: 'Internal error during attestation check.' }
            });
        }
    }

    try {
        const response = await axios.post(STATIC_IP_PROXY_ENDPOINT, req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("RPC Proxy failed:", error);
        return res.status(500).json({ error: 'Internal proxy error' });
    }
});

// --- SERVE REACT APP ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 