import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
interface LoginProps {
  connectWallet: () => Promise<string | null>;
}
export const Login: React.FC<LoginProps> = ({
  connectWallet
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const handleConnect = async () => {
    if (!isChecked) return;
    const address = await connectWallet();
    if (address) {
      navigate('/dashboard');
    }
  };
  return <div className="flex min-h-screen">
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="mb-10">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Let's start by signing you in.
          </h1>
          <p className="text-gray-600 mb-8">
            Click the button below to connect your wallet.
          </p>
          <div className="mb-8">
            <label className="flex items-start cursor-pointer">
              <div className="flex items-center h-5">
                <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-[#c4b7f0] checked:border-[#c4b7f0] relative" />
                {isChecked && <svg className="absolute w-5 h-5 pointer-events-none" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10L8 13L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>}
              </div>
              <div className="ml-3 text-sm">
                <span className="text-gray-700">
                  By clicking this box I confirm that I agree to the following{' '}
                  <a href="#" className="text-[#c4b7f0]">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#c4b7f0]">
                    Privacy Notice
                  </a>
                  . I also confirm I am over 18 years old.
                </span>
              </div>
            </label>
          </div>
          <button onClick={handleConnect} disabled={!isChecked} className={`w-full bg-black text-white py-3 px-4 rounded-full flex items-center justify-center ${!isChecked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900'}`}>
            Connect wallet <ArrowRight size={18} className="ml-2" />
          </button>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              No wallet?{' '}
              <a href="#" className="text-black">
                Find out about wallets here
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden md:block md:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-[#c4b7f0] rounded-t-full transform translate-y-1/4"></div>
      </div>
    </div>;
};