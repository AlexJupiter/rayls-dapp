import React, { useState } from 'react';
import { Send, DollarSign, Loader } from 'lucide-react';
interface TransactionPanelProps {
  kycVerified: boolean;
}
export const TransactionPanel: React.FC<TransactionPanelProps> = ({
  kycVerified
}) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycVerified) {
      return;
    }
    setIsProcessing(true);
    // Simulate transaction processing
    setTimeout(() => {
      setTransactionHash('0x' + Math.random().toString(16).slice(2, 50));
      setIsProcessing(false);
      setAmount('');
      setRecipient('');
    }, 2000);
  };
  return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold mb-4">
        Rayls Blockchain Transactions
      </h3>
      {!kycVerified ? <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-2">
            KYC verification required to access transactions
          </p>
          <p className="text-sm text-gray-500">
            Please complete the KYC verification process to enable transactions
            on the Rayls blockchain.
          </p>
        </div> : <>
          <form onSubmit={handleTransaction}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4b7f0] focus:border-[#c4b7f0]" required disabled={isProcessing} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (RAYLS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-gray-500" />
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4b7f0] focus:border-[#c4b7f0]" required disabled={isProcessing} min="0.000001" step="0.000001" />
              </div>
            </div>
            <button type="submit" disabled={isProcessing} className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-full flex items-center justify-center">
              {isProcessing ? <>
                  <Loader size={20} className="animate-spin mr-2" />
                  Processing...
                </> : <>
                  <Send size={18} className="mr-2" />
                  Send Transaction
                </>}
            </button>
          </form>
          {transactionHash && <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm font-medium text-green-800">
                Transaction Successful!
              </p>
              <p className="text-xs text-green-700 break-all mt-1">
                Transaction Hash: {transactionHash}
              </p>
            </div>}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Transaction History
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">No recent transactions</p>
            </div>
          </div>
        </>}
    </div>;
};