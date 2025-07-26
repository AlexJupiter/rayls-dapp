import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './components/Layout';
export function App() {
  const [connected, setConnected] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const connectWallet = async () => {
    try {
      // In a real implementation, this would use actual Web3 libraries
      // to connect to MetaMask or other wallets
      const mockAddress = '0x' + Math.random().toString(16).slice(2, 12);
      setWalletAddress(mockAddress);
      setConnected(true);
      return mockAddress;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  };
  const verifyKYC = async () => {
    try {
      // In a real implementation, this would verify attestations
      // from Coinbase or other providers
      setTimeout(() => {
        setKycVerified(true);
      }, 1500);
      return true;
    } catch (error) {
      console.error('Error verifying KYC:', error);
      return false;
    }
  };
  return <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home connectWallet={connectWallet} />} />
          <Route path="/dashboard" element={<Dashboard connected={connected} kycVerified={kycVerified} verifyKYC={verifyKYC} walletAddress={walletAddress} />} />
        </Routes>
      </Layout>
    </BrowserRouter>;
}