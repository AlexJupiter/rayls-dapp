import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ValidateMicrodeposits: React.FC = () => {
  const navigate = useNavigate();
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [setupIntentId, setSetupIntentId] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount1 || !amount2 || !setupIntentId) {
      setError('Please enter both amounts and the Setup Intent ID.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await axios.post('/api/verify-microdeposits', {
        setupIntentId,
        amounts: [parseInt(amount1), parseInt(amount2)],
      });
      navigate('/dashboard?verification_status=success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check the details and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <img src="/Rayls_Logo_Gradient.svg" alt="Rayls Logo" className="h-12 mx-auto mb-8" />
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-2">Validate Micro-deposits</h1>
          <p className="text-gray-600 text-center mb-6">
            Enter the two micro-deposit amounts (in cents) and the Setup Intent ID you received from Stripe to complete verification.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Setup Intent ID (e.g., seti_...)"
              value={setupIntentId}
              onChange={(e) => setSetupIntentId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b388ff] focus:border-transparent transition"
              required
            />
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="First amount (e.g., 32)"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b388ff] focus:border-transparent transition"
                required
              />
              <input
                type="number"
                placeholder="Second amount (e.g., 45)"
                value={amount2}
                onChange={(e) => setAmount2(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b388ff] focus:border-transparent transition"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#b388ff] hover:bg-[#a070e9] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {isVerifying ? 'Verifying...' : 'Validate & Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 