import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './components/Layout';

export function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: 'd7fb11b9-b0e9-4ded-af8d-bab12a28e40d',
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DynamicContextProvider>
  );
}