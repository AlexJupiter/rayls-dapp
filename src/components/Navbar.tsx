import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { setShowAuthFlow } = useDynamicContext();
  const isHomePage = location.pathname === '/';
  
  return <>
      <nav className={`py-4 ${isHomePage ? 'bg-[#e7fb3c]' : 'bg-white border-b border-gray-200'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/Rayls_Logo_Black.svg" alt="Rayls" className="h-8" />
          </Link>
          {isHomePage && <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => setShowAuthFlow(true)} className="bg-black hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-full group">
                <span className="flex items-center">
                  Connect wallet{' '}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>}
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black hover:opacity-80">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden mt-4 pb-4 px-6">
            <div className="flex flex-col space-y-4">
              {isHomePage ? <>
                  <button onClick={() => { setShowAuthFlow(true); setIsMenuOpen(false); }} className="text-black hover:opacity-80 font-medium text-left">
                    Connect wallet
                  </button>
                </> : <>
                  <Link to="/" className="text-black hover:opacity-80 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                  <Link to="/dashboard" className="text-black hover:opacity-80 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                </>}
            </div>
          </div>}
      </nav>
    </>;
};