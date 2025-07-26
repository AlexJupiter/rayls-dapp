import React, { useState } from 'react';
import { Wallet, X, ArrowRight } from 'lucide-react';
interface WalletConnectProps {
  connectWallet: () => Promise<string | null>;
  connected: boolean;
  walletAddress: string;
}
export const WalletConnect: React.FC<WalletConnectProps> = ({
  connectWallet,
  connected,
  walletAddress
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const handleConnect = async () => {
    setIsConnecting(true);
    await connectWallet();
    setIsConnecting(false);
    setIsModalOpen(false);
  };
  return <>
      <button onClick={() => setIsModalOpen(true)} className={`flex items-center px-4 py-2 rounded-full ${connected ? 'bg-gray-100 text-gray-800' : 'bg-black hover:bg-gray-900 text-white'}`}>
        <Wallet size={18} className="mr-2" />
        {connected ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect wallet'}
      </button>
      {isModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Connect Wallet
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <button onClick={handleConnect} disabled={isConnecting} className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <Wallet size={20} className="text-orange-500" />
                  </div>
                  <span className="font-medium">MetaMask</span>
                </div>
                {isConnecting ? <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div> : <ArrowRight size={18} />}
              </button>
              <button className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Wallet size={20} className="text-blue-500" />
                  </div>
                  <span className="font-medium">Coinbase Wallet</span>
                </div>
                <ArrowRight size={18} />
              </button>
              <button className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Wallet size={20} className="text-purple-500" />
                  </div>
                  <span className="font-medium">WalletConnect</span>
                </div>
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              By connecting your wallet, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>}
    </>;
};