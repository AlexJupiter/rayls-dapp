import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ExternalLink,
  Github,
  Users,
  Wallet,
  Activity,
  ShieldCheck,
  Plus,
  Droplet,
  Trophy,
  BarChart3,
  FileText,
  Network,
  CheckCircle,
  Layers,
} from 'lucide-react';
import axios from 'axios';
import { CountrySelectionModal } from '../components/CountrySelectionModal';

export const Dashboard: React.FC = () => {
  const { isAuthenticated, user, primaryWallet } = useDynamicContext();
  const navigate = useNavigate();
  const [coinbaseAttestationId, setCoinbaseAttestationId] = useState<string | null>(null);
  const [hasBinanceAttestation, setHasBinanceAttestation] = useState(false);
  const [hasGalxePassport, setHasGalxePassport] = useState(false);
  const [isLoadingAttestation, setIsLoadingAttestation] = useState(true);
  const [isLoadingBinance, setIsLoadingBinance] = useState(true);
  const [isLoadingGalxe, setIsLoadingGalxe] = useState(true);
  const [stats, setStats] = useState({ totalWallets: '...', totalTransactions: '...' });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const handleCreateAttestation = async (countryCode: string) => {
    if (!primaryWallet) return;

    try {
      const response = await axios.post('/api/create-stripe-session', {
        userWalletAddress: primaryWallet.address,
        countryCode: countryCode,
      });

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create Stripe session:', error);
    } finally {
      setIsCountryModalOpen(false);
    }
  };
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('https://rayls-test-chain.explorer.caldera.xyz/api/v2/stats');
        const data = response.data;
        setStats({
          totalWallets: parseInt(data.total_addresses).toLocaleString(),
          totalTransactions: parseInt(data.total_transactions).toLocaleString()
        });
      } catch (error) {
        console.error('Error fetching testnet stats:', error);
        setStats({ totalWallets: 'N/A', totalTransactions: 'N/A' });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const checkAttestations = async () => {
      if (primaryWallet) {
        const walletAddress = primaryWallet.address;
        
        // Check for Coinbase Attestation
        const coinbaseQuery = `
          query GetCoinbaseAttestation {
            attestations(
              where: {
                schemaId: { equals: "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9" }
                recipient: { equals: "${walletAddress}"}
                revoked: {equals: false}
              }
            ) { id }
          }
        `;
        try {
          const response = await axios.post('https://base.easscan.org/graphql', { query: coinbaseQuery });
          if (response.data.data.attestations.length > 0) {
            const attestationId = response.data.data.attestations[0].id;
            setCoinbaseAttestationId(attestationId);
          }
        } catch (error) {
          console.error('Error fetching attestations:', error);
        } finally {
          setIsLoadingAttestation(false);
        }
      } else {
        setIsLoadingAttestation(false);
        setIsLoadingBinance(false);
      }
    };

    const checkBinanceAttestation = async () => {
      if (primaryWallet) {
        setIsLoadingBinance(true);
        try {
          const babResponse = await axios.get(`/api/check-bab-token/${primaryWallet.address}`);
          if (babResponse.data.hasToken) {
            setHasBinanceAttestation(true);
          }
        } catch (binanceError) {
          console.error('Error checking Binance BAB token via proxy:', binanceError);
        } finally {
          setIsLoadingBinance(false);
        }
      }
    };

    const checkGalxePassport = async () => {
      if (primaryWallet) {
        const walletAddress = primaryWallet.address;
        setIsLoadingGalxe(true);
        try {
          const response = await axios.get(`/api/check-galxe-passport/${walletAddress}`);
          if (response.data.hasPassport) {
            setHasGalxePassport(true);
          }
        } catch (error) {
          console.error('Error checking Galxe Passport:', error);
        } finally {
          setIsLoadingGalxe(false);
        }
      }
    };

    checkAttestations();
    checkBinanceAttestation();
    checkGalxePassport();
  }, [primaryWallet]);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  const noAttestationsFound = !isLoadingAttestation && !isLoadingBinance && !isLoadingGalxe && !coinbaseAttestationId && !hasBinanceAttestation && !hasGalxePassport;
  
  return <div className="min-h-screen bg-[#121212] text-white">
      <CountrySelectionModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onConfirm={handleCreateAttestation}
      />
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
              <div className="flex flex-col md:flex-row justify-between p-6">
                {/* Welcome text section */}
                <div className="md:max-w-[65%] mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-3 flex items-center">
                  <span className="mr-2">👋</span> Welcome to the Rayls Testnet
                  Dashboard
                </h2>
                  <p className="mb-4">
                  Rayls is a high-performance public & private EVM blockchain
                  system built for RWA, with native compliance and governance
                  controls. To use the Rayls Public Testnet you must have a
                  valid attestation to your connected wallet address.
                </p>
              </div>
                {/* Stats section */}
                <div className="md:w-[30%] flex flex-col justify-center bg-white rounded-xl p-5 self-center">
                  <a 
                    href="https://portal.caldera.xyz/rayls-test-chain" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group"
                  >
                    <h3 className="text-gray-600 text-sm font-medium mb-3 flex items-center">
                      Testnet stats
                      <ArrowRight
                        size={14}
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      />
                    </h3>
                  </a>
                  <div className="flex justify-between">
                    {/* Total Wallets */}
                    <div className="flex-1 mr-3">
                      <div className="flex items-center mb-2">
                        <div className="bg-[#e7fb3c]/30 p-2 rounded mr-2">
                          <Wallet size={16} className="text-black" />
                        </div>
                        <span className="text-xs text-gray-500">
                          Total wallets
                        </span>
                      </div>
                      <div className="text-xl font-bold text-black">{isLoadingStats ? '...' : stats.totalWallets}</div>
                    </div>
                    {/* Total Transactions */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="bg-[#b388ff]/30 p-2 rounded mr-2">
                          <Activity size={16} className="text-black" />
                        </div>
                        <span className="text-xs text-gray-500">
                          Total transactions
                        </span>
                      </div>
                      <div className="text-xl font-bold text-black">{isLoadingStats ? '...' : stats.totalTransactions}</div>
                    </div>
                  </div>
                </div>
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
                {isLoadingAttestation || isLoadingBinance || isLoadingGalxe ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600">Checking for attestations...</p>
                  </div>
                ) : (
                  <>
                    {coinbaseAttestationId && (
                       <a 
                        href={`https://base.easscan.org/attestation/view/${coinbaseAttestationId}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group bg-white border border-gray-200 rounded-lg p-5 hover:bg-white/90 transition-colors shadow-sm block hover:shadow-[0_0_15px_rgba(179,136,255,0.3)] transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start">
                          <div className="rounded-full mr-4 mt-1 flex items-center justify-center w-10 h-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" fill="none" viewBox="0 0 512 512" id="coinbase" className="w-10 h-10">
                                <g clipPath="url(#clip0_84_15704)">
                                  <rect width="512" height="512" fill="#0052FF"></rect>
                                  <path fill="#0052FF" d="M255.5 40C375.068 40 472 136.932 472 256.5C472 376.068 375.068 473 255.5 473C135.932 473 39 376.068 39 256.5C39 136.932 135.932 40 255.5 40Z"></path>
                                  <path fill="#fff" d="M255.593 331.733C213.515 331.733 179.513 297.638 179.513 255.653C179.513 213.668 213.608 179.573 255.593 179.573C293.258 179.573 324.535 206.999 330.547 242.973H407.19C400.71 164.826 335.337 103.398 255.5 103.398C171.436 103.398 103.245 171.589 103.245 255.653C103.245 339.717 171.436 407.907 255.5 407.907C335.337 407.907 400.71 346.48 407.19 268.333H330.453C324.441 304.307 293.258 331.733 255.593 331.733Z"></path>
                                </g>
                                <defs>
                                  <clipPath id="clip0_84_15704">
                                    <circle cx="256" cy="256" r="256" fill="#fff"></circle>
                                  </clipPath>
                                </defs>
                              </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg mr-2">
                              Coinbase Verified Account
                            </h3>
                          </div>
                            <p className="text-gray-600 text-sm mb-2">
                            Your Coinbase account has been verified and attested
                              onchain.
                            </p>
                            <p className="text-gray-500 text-xs mb-3">
                              This attestation allows a regulator to contact
                              Coinbase to find out your identity, meaning you can
                              trade nearly all assets on Rayls.
                            </p>
                            <div className="mb-4 md:hidden">
                              <div className="bg-[#f8f5ff] border border-[#e7e3f5] px-4 py-3 rounded-lg inline-flex items-center">
                                <Users size={16} className="text-[#b388ff] mr-2" />
                                <p className="text-xs text-gray-600">
                                  Over 600,000 accounts have this attestation
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center text-black text-sm font-medium">
                                Verify onchain{' '}
                                <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                          <div className="hidden md:flex md:items-center md:ml-4">
                            <div className="bg-[#f8f5ff] border border-[#e7e3f5] px-4 py-3 rounded-lg flex items-center">
                              <Users size={16} className="text-[#b388ff] mr-2" />
                              <p className="text-xs text-gray-600 whitespace-nowrap">
                                Over 600,000 accounts
                                <br />
                                have this attestation
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    )}
                    
                    {hasBinanceAttestation && (
                      <a
                        href={`https://bscscan.com/address/${primaryWallet?.address}#asset-nfts`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group bg-white border border-gray-200 rounded-lg p-5 hover:bg-white/90 transition-colors shadow-sm block hover:shadow-[0_0_15px_rgba(179,136,255,0.3)] transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start">
                          <div className="rounded-full mr-4 mt-1 flex items-center justify-center w-10 h-10">
                            <svg width="534" height="534" viewBox="0 0 534 534" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                              <path d="M266.667 533.333C413.943 533.333 533.333 413.943 533.333 266.667C533.333 119.391 413.943 0 266.667 0C119.391 0 0 119.391 0 266.667C0 413.943 119.391 533.333 266.667 533.333Z" fill="#0B0E11"/>
                              <path d="M191.864 235.931L266.668 161.129L341.51 235.971L385.035 192.443L266.668 74.074L148.338 192.405L191.864 235.931ZM117.602 223.137L161.128 266.663L117.6 310.191L74.0742 266.665L117.602 223.137ZM191.864 297.401L266.668 372.201L341.508 297.363L385.059 340.868L385.035 340.89L266.668 459.259L148.336 340.929L148.275 340.869L191.864 297.401ZM459.264 266.671L415.738 310.196L372.212 266.671L415.738 223.145L459.264 266.671Z" fill="#F0B90B"/>
                              <path d="M310.815 266.644H310.835L266.667 222.476L222.477 266.666L222.537 266.727L266.667 310.857L310.855 266.666L310.815 266.644Z" fill="#F0B90B"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-lg mr-2">
                                Binance Verified Account
                              </h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              Your account has been verified by Binance onchain.
                            </p>
                            <p className="text-gray-500 text-xs mb-3">
                              This attestation allows a regulator to contact Binance
                              to find out your identity, meaning you can trade
                              nearly all assets on Rayls.
                            </p>
                            <div className="mb-4 md:hidden">
                              <div className="bg-[#f8f5ff] border border-[#e7e3f5] px-4 py-3 rounded-lg inline-flex items-center">
                                <Users size={16} className="text-[#b388ff] mr-2" />
                                <p className="text-xs text-gray-600">
                                  Over 1M accounts have this attestation
                                </p>
                              </div>
                            </div>
                          <div className="mt-4 flex items-center text-black text-sm font-medium">
                            Verify onchain{' '}
                                <ArrowRight
                                  size={14}
                                  className="ml-1 group-hover:translate-x-1 transition-transform"
                                />
                            </div>
                          </div>
                          <div className="hidden md:flex md:items-center md:ml-4">
                            <div className="bg-[#f8f5ff] border border-[#e7e3f5] px-4 py-3 rounded-lg flex items-center">
                              <Users size={16} className="text-[#b388ff] mr-2" />
                              <p className="text-xs text-gray-600 whitespace-nowrap">
                                Over 1M accounts
                                <br />
                                have this attestation
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    )}

                    {hasGalxePassport && (
                      <div className="group bg-white border border-gray-200 rounded-lg p-5 shadow-sm block transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-start">
                          <div className="flex items-start mb-2 md:mb-0">
                            <div className="mr-4 flex-shrink-0">
                              <svg width="1096" height="1096" viewBox="0 0 1096 1096" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                <rect width="1096" height="1096" rx="548" fill="url(#paint0_linear_2701_30678)"/>
                                <path d="M691.763 366.29L225.969 634.955L658.722 315.898C673.226 305.21 693.808 309.504 702.802 325.091C711.133 339.524 706.191 357.967 691.744 366.309L691.763 366.29ZM758.319 598.806C752.07 587.987 738.229 584.298 727.398 590.54L419.027 768.389L747.45 630.964C760.023 625.705 765.116 610.61 758.3 598.806H758.319ZM913.905 360.388C900.859 337.821 871.492 330.841 849.679 345.123L176 786L895.027 423.587C918.317 411.84 926.951 382.955 913.905 360.388Z" fill="white"/>
                                <defs>
                                <linearGradient id="paint0_linear_2701_30678" x1="141.904" y1="1096" x2="942.115" y2="-2.13521e-05" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#3B42FF"/>
                                <stop offset="0.595655"/>
                                </linearGradient>
                                </defs>
                              </svg>
                            </div>
                            <div className="flex-1 md:hidden">
                              <h3 className="font-semibold text-lg">
                                Galxe Passport
                              </h3>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1 hidden md:flex">
                              <h3 className="font-semibold text-lg mr-2">
                                Galxe Passport
                              </h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              You've claimed the Galxe Passport NFT as part of an
                              identity verification process with Sumsub.
                            </p>
                            <p className="text-gray-500 text-xs mb-3">
                              This is a proof of personhood attestation with no link
                              between your identity and your wallet, meaning it
                              allows you to only trade some of the assets on Rayls.
                            </p>
                            <div className="mb-4 md:hidden">
                              <div className="bg-[#f8f5ff] border border-[#e7e3f5] px-4 py-3 rounded-lg inline-flex items-center">
                                <Users size={16} className="text-[#b388ff] mr-2" />
                                <p className="text-xs text-gray-600">
                                  Over 1M accounts have this attestation
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center space-x-6">
                              <a
                                href={`https://bscscan.com/token/0xe84050261cb0a35982ea0f6f3d9dff4b8ed3c012?a=${primaryWallet?.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center text-black text-sm font-medium"
                              >
                                Verify onchain{' '}
                                <ArrowRight
                                  size={14}
                                  className="ml-1 group-hover:translate-x-1 transition-transform"
                                />
                              </a>
                            </div>
                          </div>
                          <div className="hidden md:flex md:items-center md:ml-4">
                            <div className="bg-[#f8f5ff] border border-[#e7e3f5] px-4 py-3 rounded-lg flex items-center">
                              <Users size={16} className="text-[#b388ff] mr-2" />
                              <p className="text-xs text-gray-600 whitespace-nowrap">
                                Over 1M accounts
                                <br />
                                have this attestation
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {noAttestationsFound && (
                      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600">
                          You currently have no attestations to your connected
                          wallet address to enable you to transact on Rayls.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => setIsCountryModalOpen(true)}
                  className="bg-[#b388ff] hover:bg-[#a070e9] text-white font-medium py-3 px-6 rounded-lg flex items-center transition-colors"
                >
                      <Plus size={18} className="mr-2" />
                  Create attestation
                </button>
                <button
                  onClick={() => navigate('/validate-microdeposits')}
                  className="border border-[#b388ff] text-[#b388ff] hover:bg-[#b388ff]/10 font-medium py-3 px-6 rounded-lg flex items-center transition-colors"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Validate microdeposits
                    </button>
                <a
                  href="https://dash.readme.com/project/parfin-rayls/v2.3.1/docs/rayls-testnet-attestations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center rounded-lg border border-black py-2 px-4 text-sm font-medium text-black transition-colors hover:border-gray-800 hover:text-gray-800"
                >
                  Learn more about attestations
                  <ArrowRight
                    size={16}
                    className="ml-2 transition-transform group-hover:translate-x-1"
                  />
                </a>
              </div>
            </div>
            {/* Action Tiles */}
            {/* Tile 1: Block Explorer */}
            <a href="https://rayls-test-chain.explorer.caldera.xyz/" target="_blank" className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(179,136,255,0.3)]">
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
            <a
              href="https://rayls-test-chain.hub.caldera.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]"
            >
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
            <a
              href="https://app.galxe.com/quest/degf5vaoivxjsc6t7KimCy?sort=Trending"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]"
            >
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

            {/* View Rayls leaderboard */}
            <a
              href="https://app.fuul.xyz/incentives/rayls-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(179,136,255,0.3)]"
            >
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
            <a
              href="https://docs.rayls.com/docs/a-warm-introduction-to-rayls"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]"
            >
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
            {/* Bridge funds */}
            <a
              href="https://rayls-test-chain.bridge.caldera.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(179,136,255,0.3)]"
            >
              <div className="flex items-center mb-4">
                <div className="bg-[#b388ff]/30 p-4 rounded-lg mr-3 group-hover:bg-[#b388ff]/40 transition-colors">
                  <Network size={24} className="text-[#b388ff]" />
                </div>
                <h3 className="font-semibold text-lg">Bridge funds</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Transfer tokens between Rayls Testnet and other blockchain
                networks
              </p>
              <div className="mt-auto flex items-center text-black text-sm font-medium">
                Bridge assets{' '}
                <ArrowRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </a>
            {/* Check status */}
            <a
              href="https://rayls-test-chain.bridge.caldera.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(231,251,60,0.3)]"
            >
              <div className="flex items-center mb-4">
                <div className="bg-[#e7fb3c]/30 p-4 rounded-lg mr-3 group-hover:bg-[#e7fb3c]/40 transition-colors">
                  <Activity size={24} className="text-black" />
                </div>
                <h3 className="font-semibold text-lg">Check status</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Monitor the status of your pending transactions and bridge
                operations
              </p>
              <div className="mt-auto flex items-center text-black text-sm font-medium">
                View status{' '}
                <ArrowRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </a>
            {/* View our code */}
            <a
              href="https://github.com/AlexJupiter/rayls-dapp"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_rgba(179,136,255,0.3)]"
            >
              <div className="flex items-center mb-4">
                <div className="bg-[#b388ff]/30 p-4 rounded-lg mr-3 group-hover:bg-[#b388ff]/40 transition-colors">
                  <Github size={24} className="text-[#b388ff]" />
                </div>
                <h3 className="font-semibold text-lg">View our code</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Explore our code on GitHub to check our security and collaborate
              </p>
              <div className="mt-auto flex items-center text-black text-sm font-medium">
                View code{' '}
                <ArrowRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>;
};