import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
interface HeroProps {
  connected: boolean;
  connectWallet: () => Promise<string | null>;
  walletAddress: string;
}
export const Hero: React.FC<HeroProps> = ({
  connected,
  connectWallet,
  walletAddress
}) => {
  const navigate = useNavigate();
  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) {
      navigate('/dashboard');
    }
  };
  return <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-6 md:px-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Secure Transactions on the Rayls Blockchain
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Connect your wallet, verify your identity with Coinbase KYC
              attestation, and start transacting on the Rayls blockchain with
              confidence.
            </p>
            {!connected ? <button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg flex items-center">
                Connect Wallet <ArrowRight size={20} className="ml-2" />
              </button> : <div className="flex flex-col">
                <span className="text-gray-700 mb-2">
                  Connected: {walletAddress.slice(0, 6)}...
                  {walletAddress.slice(-4)}
                </span>
                <button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg flex items-center">
                  Go to Dashboard <ArrowRight size={20} className="ml-2" />
                </button>
              </div>}
          </div>
          <div className="md:w-1/2 md:pl-12">
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 w-32 bg-blue-200 rounded"></div>
                  <div className="h-6 w-6 bg-blue-200 rounded-full"></div>
                </div>
                <div className="h-4 w-48 bg-blue-200 rounded mb-4"></div>
                <div className="h-24 w-full bg-blue-100 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-100 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="h-10 w-32 bg-blue-100 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};