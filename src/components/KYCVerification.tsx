import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
interface KYCVerificationProps {
  kycVerified: boolean;
  verifyKYC: () => Promise<boolean>;
}
export const KYCVerification: React.FC<KYCVerificationProps> = ({
  kycVerified,
  verifyKYC
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const handleVerify = async () => {
    setIsVerifying(true);
    await verifyKYC();
    setIsVerifying(false);
  };
  return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold mb-4">KYC Verification Status</h3>
      <div className="mb-6">
        {kycVerified ? <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle size={24} className="text-green-500 mr-3" />
            <div>
              <p className="font-medium text-green-800">
                Verification Complete
              </p>
              <p className="text-sm text-green-700">
                Your Coinbase KYC attestation has been verified
              </p>
            </div>
          </div> : <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <AlertCircle size={24} className="text-yellow-500 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">
                Verification Required
              </p>
              <p className="text-sm text-yellow-700">
                Please verify your Coinbase KYC attestation to enable
                transactions
              </p>
            </div>
          </div>}
      </div>
      {!kycVerified && <button onClick={handleVerify} disabled={isVerifying} className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-full flex items-center justify-center">
          {isVerifying ? <>
              <Loader size={20} className="animate-spin mr-2" />
              Verifying...
            </> : 'Verify KYC Attestation'}
        </button>}
      <div className="mt-4 text-sm text-gray-500">
        <p>
          Rayls uses Coinbase KYC attestations to verify your identity while
          preserving your privacy.
        </p>
      </div>
    </div>;
};