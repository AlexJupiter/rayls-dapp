import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { ethers } from 'ethers';
import axios from 'axios';

// --- CONFIGURATION ---
const CALDERA_RPC_ENDPOINT = 'https://rayls-test-chain.rpc.caldera.xyz/http';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));


// --- RPC PROXY ENDPOINT ---
app.post('/rpc', async (req, res) => {
    const { id, method, params } = req.body;

    // --- ATTESTATION CHECK FOR TRANSACTIONS ---
    if (method === 'eth_sendRawTransaction') {
        try {
            // 1. Decode the transaction to get the sender's address
            const tx = ethers.Transaction.from(params[0]);
            const userAddress = tx.from;

            // 2. Perform the GraphQL check
            const gqlResponse = await axios.post(EAS_GRAPHQL_ENDPOINT, {
                query: GQL_QUERY,
                variables: {
                    recipient: userAddress,
                    schemaId: SCHEMA_UID,
                }
            });

            const attestations = gqlResponse.data.data.attestations;
            const hasAttestation = attestations && attestations.length > 0;

            // 3. If the user does NOT have the attestation, block them.
            if (!hasAttestation) {
                console.log(`Verification FAILED for address: ${userAddress}`);
                return res.status(403).json({
                    jsonrpc: '2.0',
                    id,
                    error: { code: -32602, message: 'Permission Denied: Address does not have the required attestation.' }
                });
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
        const response = await axios.post(CALDERA_RPC_ENDPOINT, req.body);
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