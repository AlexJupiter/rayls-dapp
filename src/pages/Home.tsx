import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { ArrowRight, Menu, X } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setShowAuthFlow } = useDynamicContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return <div className="w-full h-screen bg-[#e7fb3c]">
      <div className="relative overflow-hidden h-full">
      <header className="absolute top-0 left-0 right-0 z-20 py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/Rayls_Logo_Black.svg"
              alt="Rayls"
              className="h-8"
            />
          </Link>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowAuthFlow(true)}
                className="bg-black hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-full group"
              >
                <span className="flex items-center">
                  Connect wallet{' '}
                  <ArrowRight
                    size={18}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>
            </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black hover:opacity-80"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white/20 backdrop-blur-md rounded-lg mx-6 p-4">
            <button
              onClick={() => setShowAuthFlow(true)}
              className="bg-black hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-full group w-full flex items-center justify-center"
            >
              <span className="flex items-center">
                Connect wallet{' '}
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </span>
            </button>
          </div>
        )}
      </header>
        {/* Purple arc elements with flowing bands */}
        <div className="absolute inset-0 z-0">
          {/* Main purple arc at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 w-full h-[70vh] bg-[#c4b7f0] rounded-t-full"></div>
          {/* Additional flowing bands */}
          <div className="absolute bottom-[-5vh] left-0 right-0 w-full h-[60vh] bg-[#b9aceb] opacity-90 rounded-t-full"></div>
          <div className="absolute bottom-[-15vh] left-0 right-0 w-full h-[50vh] bg-[#ae9fe5] opacity-80 rounded-t-full"></div>
          <div className="absolute bottom-[-25vh] left-0 right-0 w-full h-[40vh] bg-[#a393e0] opacity-70 rounded-t-full"></div>
          <div className="absolute bottom-[-35vh] left-0 right-0 w-full h-[30vh] bg-[#9887da] opacity-60 rounded-t-full"></div>
        </div>
        {/* Main content */}
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
                Testnet now live!
              </h1>
              <p className="text-lg text-black mb-8 max-w-md">
                Connect your wallet to start experimenting with the Rayls
                Testnet.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={() => setShowAuthFlow(true)} className="bg-black hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-full flex items-center justify-center group">
                  Connect wallet{' '}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="mt-4 text-center sm:text-left">
                <p className="text-sm text-black">
                  No wallet? <span>Find out about wallets </span>
                  <button onClick={() => setShowAuthFlow(true)} className="text-black underline hover:opacity-80">
                    here
                  </button>
                </p>
              </div>
            </div>
            {/* Testnet Graphic - with purple border */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="rounded-3xl overflow-hidden bg-[#e7fb3c] p-6 border-4 border-[#c4b7f0] shadow-lg shadow-[#c4b7f0]/30">
                  <div className="bg-[#e7fb3c] rounded-3xl p-6 pb-12 relative">
                    {/* Top bar with dots and Rayls logo */}
                    <div className="bg-[#c4b7f0]/80 rounded-full py-2 px-4 mb-6 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                      </div>
                      <div className="flex items-center font-semibold">
                        <span className="mr-1">➔</span> Rayls
                      </div>
                    </div>
                    {/* Testnet text */}
                    <div className="text-center mb-6">
                      <h2 className="text-4xl font-bold">Testnet</h2>
                    </div>
                    {/* Code brackets and plus button */}
                    <div className="flex justify-between items-center">
                      <div className="bg-[#e7fb3c] shadow-md rounded-xl p-4 font-mono text-2xl font-bold">
                        &lt;/&gt;
                      </div>
                      <div className="bg-[#c4b7f0]/80 rounded-full py-2 px-16">
                        <span className="text-2xl">+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};