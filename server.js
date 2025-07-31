import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { ethers } from 'ethers';
import axios from 'axios';

// --- CONFIGURATION ---
// Using the Droplet's public Reserved IP until the App Platform VPC feature is enabled by Digital Ocean support.
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
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));


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

// --- API Endpoints ---

// Endpoint for the frontend to check for the Binance BAB token
app.get('/api/check-bab-token/:address', async (req, res) => {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    try {
        const provider = new ethers.JsonRpcProvider(BSC_RPC_ENDPOINT);
        const contract = new ethers.Contract(BAB_CONTRACT_ADDRESS, BAB_ABI, provider);
        const balance = await contract.balanceOf(address);
        
        return res.json({ hasToken: balance > 0 });
    } catch (error) {
        console.error('Error checking BAB token balance:', error);
        res.status(500).json({ error: 'Internal server error' });
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
                // Don't block yet, continue to Binance check
            }


            // 3. If Coinbase attestation is missing, check for Binance BAB token
            if (!hasCoinbaseAttestation) {
              console.log(`Coinbase attestation not found for ${userAddress}. Checking for Binance attestation...`);
              const hasBinance = await checkBinanceAttestation(userAddress);
              if (!hasBinance) {
                console.log(`Binance attestation not found for ${userAddress}. Checking for Galxe Passport...`);
                const hasGalxe = await checkGalxePassport(userAddress);
                if (!hasGalxe) {
                  console.log(`Verification FAILED for address: ${userAddress}. No valid attestation found.`);
                  return res.json({
                    jsonrpc: '2.0',
                    id,
                    error: {
                      code: -32602,
                      message: 'Permission Denied: Address does not have the required attestation.'
                    }
                  });
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

    // --- FORWARD THE REQUEST ---
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