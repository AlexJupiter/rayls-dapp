import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { ExternalLink, Wallet, Droplet, Trophy, BarChart3, CheckCircle, ShieldCheck, ArrowRight, ArrowRight as ArrowRightIcon, FileText, Beaker, Code, Network, Plus } from 'lucide-react';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const { isAuthenticated, user, primaryWallet } = useDynamicContext();
  const navigate = useNavigate();
  const [hasAttestation, setHasAttestation] = useState(false);
  const [isLoadingAttestation, setIsLoadingAttestation] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const checkAttestation = async () => {
      if (primaryWallet) {
        const walletAddress = primaryWallet.address;
        const query = `
          query GetAttestationsBySchemaAndRecipient {
            attestations(
              where: {
                schemaId: { equals: "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9" }
                recipient: { equals: "${walletAddress}"}
                revoked: {equals: false}
              }
            ) {
              id
            }
          }
        `;
        try {
          const response = await axios.post('https://base.easscan.org/graphql', { query });
          if (response.data.data.attestations.length > 0) {
            setHasAttestation(true);
          }
        } catch (error) {
          console.error('Error fetching attestation:', error);
        } finally {
          setIsLoadingAttestation(false);
        }
      } else if (user) {
        // Handle case where user is authenticated but wallet is not yet available
        setIsLoadingAttestation(false);
      }
    };

    checkAttestation();
  }, [user, primaryWallet]);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }
  
  return <div className="min-h-screen bg-[#121212] text-white">
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative z-50 flex justify-between items-center mb-8">
            <div>
              <img src="/Rayls_Logo_Gradient.svg" alt="Rayls Logo" className="h-10" />
            </div>
            <DynamicWidget />
          </div>
          {/* Grid layout for all tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {/* Welcome Banner Tile */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-[#f0ebff] text-black relative overflow-hidden rounded-xl">
              <div className="p-6 relative z-10">
                <h2 className="text-2xl font-bold mb-3 flex items-center">
                  <span className="mr-2">👋</span> Welcome to the Rayls Testnet
                  Dashboard
                </h2>
                <p className="max-w-2xl mb-4">
                  Rayls is a high-performance public & private EVM blockchain
                  system built for RWA, with native compliance and governance
                  controls. To use the Rayls Public Testnet you must have a
                  valid attestation to your connected wallet address.
                </p>
              </div>
              {/* Rayls logo image */}
              <div className="absolute top-1/2 right-12 transform -translate-y-1/2">
                <img src="/665deef73423c9ddcbb1387e_Author.png" alt="Rayls Logo" className="w-16 h-16 rounded-full" />
              </div>
            </div>
            {/* Attestations Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <span className="bg-[#e7fb3c]/30 p-1.5 rounded mr-3">
                  <ShieldCheck size={20} className="text-black" />
                </span>
                Attestations enabling transactions on Rayls Testnet
              </h2>
              <div className="space-y-5">
                {isLoadingAttestation ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600">Checking for attestations...</p>
                  </div>
                ) : hasAttestation ? (
                  <div className="space-y-5">
                    <a href="#" className="group bg-white border border-gray-200 rounded-lg p-5 hover:bg-white/90 transition-colors shadow-sm block hover:shadow-[0_0_15px_rgba(179,136,255,0.3)] transition-all duration-300">
                      <div className="flex items-start">
                        <div className="bg-[#b388ff]/30 p-2 rounded-full mr-4 mt-1 flex items-center justify-center">
                          <div className="font-bold text-[#0052ff]">CB</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg mr-2">
                              Coinbase Verified Account
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            Your Coinbase account has been verified and attested
                            on-chain
                          </p>
                          <div className="mt-4 flex items-center text-black text-sm font-medium">
                            Verify onchain{' '}
                            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-6">
                      You currently have no attestations to your connected
                      wallet address to enable you to transact on Rayls
                    </p>
                    <button className="bg-[#b388ff] hover:bg-[#a070e9] text-white font-medium py-3 px-6 rounded-lg flex items-center mx-auto transition-colors">
                      <Plus size={18} className="mr-2" />
                      Create attestation
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Action Tiles */}
            {/* Tile 1: Block Explorer */}
            <a href="#" className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(179,136,255,0.3)]">
              <div className="flex items-center mb-4">
                <div className="bg-[#b388ff]/30 p-4 rounded-lg mr-3 group-hover:bg-[#b388ff]/40 transition-colors">
                  <ExternalLink size={24} className="text-[#b388ff]" />
                </div>
                <h3 className="font-semibold text-lg">View block explorer</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Explore transactions, blocks, and accounts on the Rayls
                blockchain
              </p>
              <div className="mt-auto flex items-center text-black text-sm font-medium">
                Open explorer{' '}
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            {/* Tile 2: Faucet */}
            <a href="#" className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]">
              <div className="flex items-center mb-4">
                <div className="bg-[#e7fb3c]/30 p-4 rounded-lg mr-3 group-hover:bg-[#e7fb3c]/40 transition-colors">
                  <Droplet size={24} className="text-black" />
                </div>
                <h3 className="font-semibold text-lg">Access faucet</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Get testnet tokens to start experimenting with Rayls
              </p>
              <div className="mt-auto flex items-center text-black font-medium text-sm">
                Get tokens{' '}
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            {/* Tile 3: Add to Wallet */}
            <a href="#" className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(179,136,255,0.3)]">
              <div className="flex items-center mb-4">
                <div className="bg-[#b388ff]/30 p-4 rounded-lg mr-3 group-hover:bg-[#b388ff]/40 transition-colors">
                  <Wallet size={24} className="text-[#b388ff]" />
                </div>
                <h3 className="font-semibold text-lg">
                  Add Rayls Testnet to wallet
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Configure your wallet to connect to the Rayls network
              </p>
              <div className="mt-auto flex items-center text-black text-sm font-medium">
                Add network{' '}
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            {/* Tile 4: Quests */}
            <a href="#" className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]">
              <div className="flex items-center mb-4">
                <div className="bg-[#e7fb3c]/30 p-4 rounded-lg mr-3 group-hover:bg-[#e7fb3c]/40 transition-colors">
                  <Trophy size={24} className="text-black" />
                </div>
                <h3 className="font-semibold text-lg">Access Rayls quests</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Complete challenges to earn rewards and learn about Rayls
              </p>
              <div className="mt-auto flex items-center text-black font-medium text-sm">
                Start quests{' '}
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            {/* Tile 5: Leaderboard */}
            <a href="#" className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]">
              <div className="flex items-center mb-4">
                <div className="bg-[#b388ff]/30 p-4 rounded-lg mr-3 group-hover:bg-[#b388ff]/40 transition-colors">
                  <BarChart3 size={24} className="text-[#b388ff]" />
                </div>
                <h3 className="font-semibold text-lg">
                  View Rayls leaderboard
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                See top users and your ranking in the Rayls community
              </p>
              <div className="mt-auto flex items-center text-black text-sm font-medium">
                View leaderboard{' '}
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            {/* Tile 6: Technical Docs - Updated with yellow background */}
            <a href="#" className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]">
              <div className="flex items-center mb-4">
                <div className="bg-[#e7fb3c]/30 p-4 rounded-lg mr-3 group-hover:bg-[#e7fb3c]/40 transition-colors">
                  <FileText size={24} className="text-black" />
                </div>
                <h3 className="font-semibold text-lg">Read technical docs</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Explore detailed documentation and technical specifications for
                Rayls
              </p>
              <div className="mt-auto flex items-center text-black text-sm font-medium">
                View documentation{' '}
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>;
};