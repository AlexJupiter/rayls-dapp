import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

export const ValidateMicrodeposits: React.FC = () => {
  const navigate = useNavigate();
  const [deposit1, setDeposit1] = useState('');
  const [deposit2, setDeposit2] = useState('');
  const [setupIntentId, setSetupIntentId] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit1 || !deposit2 || !setupIntentId) {
      setError('Please fill in all fields.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const amount1InCents = Math.round(parseFloat(deposit1) * 100);
      const amount2InCents = Math.round(parseFloat(deposit2) * 100);

      await axios.post('/api/verify-microdeposits', {
        setupIntentId,
        amounts: [amount1InCents, amount2InCents],
      });
      navigate('/dashboard?verification_status=success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check the details and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="relative z-50 flex justify-between items-center mb-8">
            <div>
              <img
                src="/Rayls_Logo_Gradient.svg"
                alt="Rayls Logo"
                className="h-10"
              />
            </div>
            <DynamicWidget />
          </div>
          <div className="max-w-3xl mx-auto">
            {/* Main content */}
            <div className="bg-[#f0ebff] text-black relative overflow-hidden rounded-xl p-8">
              <h1 className="text-2xl font-bold mb-4">
                Validate microdeposits
              </h1>
              <p className="text-gray-600 mb-8">
                After requesting the microdeposits, you then need to wait 1-2
                days for the payments to appear in your account. Once they've
                appeared, input the amounts below.
              </p>
              <form onSubmit={handleConfirm} className="space-y-6">
                <div>
                  <label
                    htmlFor="setupIntentId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Setup Intent ID
                  </label>
                  <input
                    type="text"
                    id="setupIntentId"
                    value={setupIntentId}
                    onChange={(e) => setSetupIntentId(e.target.value)}
                    placeholder="seti_..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#b388ff] focus:border-[#b388ff] outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deposit1"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First microdeposit amount ($)
                  </label>
                  <input
                    type="text"
                    id="deposit1"
                    value={deposit1}
                    onChange={(e) => setDeposit1(e.target.value)}
                    placeholder="0.32"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#b388ff] focus:border-[#b388ff] outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deposit2"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Second microdeposit amount ($)
                  </label>
                  <input
                    type="text"
                    id="deposit2"
                    value={deposit2}
                    onChange={(e) => setDeposit2(e.target.value)}
                    placeholder="0.45"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#b388ff] focus:border-[#b388ff] outline-none"
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg flex items-center transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="bg-[#b388ff] hover:bg-[#a070e9] text-white font-medium py-3 px-6 rounded-lg flex items-center transition-colors disabled:bg-gray-400"
                  >
                    {isVerifying ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 