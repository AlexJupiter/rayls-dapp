import React, { useState, useMemo } from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface AttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyWithBank: (countryCode: string) => void;
  onVerifyWithId: () => void;
}

interface Country {
  code: string;
  name: string;
}

const bankSupportedCountries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  // SEPA Countries
  { code: 'AT', name: 'Austria' }, { code: 'BE', name: 'Belgium' }, { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' }, { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' }, { code: 'EE', name: 'Estonia' }, { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' }, { code: 'GI', name: 'Gibraltar' },
  { code: 'GR', name: 'Greece' }, { code: 'HU', name: 'Hungary' }, { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' }, { code: 'LV', name: 'Latvia' }, { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' }, { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NO', name: 'Norway' }, { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' }, { code: 'RO', name: 'Romania' }, { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' }, { code: 'ES', name: 'Spain' }, { code: 'SE', name: 'Sweden' },
];

// Based on Stripe's documentation for Identity
const idSupportedCountries: Country[] = [
    { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' }, { code: 'AD', name: 'Andorra' }, 
    { code: 'AO', name: 'Angola' }, { code: 'AI', name: 'Anguilla' }, { code: 'AG', name: 'Antigua & Barbuda' }, 
    { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' }, 
    { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' }, 
    { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' }, 
    { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' }, { code: 'BJ', name: 'Benin' }, 
    { code: 'BM', name: 'Bermuda' }, { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' }, 
    { code: 'BA', name: 'Bosnia & Herzegovina' }, { code: 'BW', name: 'Botswana' }, { code: 'BR', name: 'Brazil' }, 
    { code: 'VG', name: 'British Virgin Islands' }, { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, 
    { code: 'CV', name: 'Cape Verde' }, { code: 'KH', name: 'Cambodia' }, { code: 'CM', name: 'Cameroon' }, 
    { code: 'CA', name: 'Canada' }, { code: 'KY', name: 'Cayman Islands' }, { code: 'CL', name: 'Chile' }, 
    { code: 'CO', name: 'Colombia' }, { code: 'KM', name: 'Comoros' }, { code: 'CR', name: 'Costa Rica' }, 
    { code: 'CI', name: 'Côte d’Ivoire' }, { code: 'HR', name: 'Croatia' }, { code: 'CY', name: 'Cyprus' }, 
    { code: 'CZ', name: 'Czech Republic' }, { code: 'DK', name: 'Denmark' }, { code: 'DJ', name: 'Djibouti' }, 
    { code: 'DM', name: 'Dominica' }, { code: 'DO', name: 'Dominican Republic' }, { code: 'EC', name: 'Ecuador' }, 
    { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' }, { code: 'GQ', name: 'Equatorial Guinea' }, 
    { code: 'EE', name: 'Estonia' }, { code: 'SZ', name: 'Eswatini' }, { code: 'ET', name: 'Ethiopia' }, 
    { code: 'FM', name: 'Micronesia' }, { code: 'FJ', name: 'Fiji' }, { code: 'FI', name: 'Finland' }, 
    { code: 'FR', name: 'France' }, { code: 'GA', name: 'Gabon' }, { code: 'GM', name: 'Gambia' }, 
    { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' }, { code: 'GI', name: 'Gibraltar' }, 
    { code: 'GR', name: 'Greece' }, { code: 'GD', name: 'Grenada' }, { code: 'GT', name: 'Guatemala' }, 
    { code: 'GG', name: 'Guernsey' }, { code: 'GN', name: 'Guinea' }, { code: 'GW', name: 'Guinea-Bissau' }, 
    { code: 'GY', name: 'Guyana' }, { code: 'HN', name: 'Honduras' }, { code: 'HK', name: 'Hong Kong' }, 
    { code: 'HU', name: 'Hungary' }, { code: 'IN', name: 'India' }, { code: 'IS', name: 'Iceland' }, 
    { code: 'ID', name: 'Indonesia' }, { code: 'IE', name: 'Ireland' }, { code: 'IM', name: 'Isle of Man' }, 
    { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' }, { code: 'JP', name: 'Japan' }, 
    { code: 'JM', name: 'Jamaica' }, { code: 'JO', name: 'Jordan' }, { code: 'KZ', name: 'Kazakhstan' }, 
    { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' }, { code: 'KW', name: 'Kuwait' }, 
    { code: 'KG', name: 'Kyrgyzstan' }, { code: 'LA', name: 'Laos' }, { code: 'LV', name: 'Latvia' }, 
    { code: 'LS', name: 'Lesotho' }, { code: 'LR', name: 'Liberia' }, { code: 'LI', name: 'Liechtenstein' }, 
    { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' }, { code: 'MO', name: 'Macao SAR China' }, 
    { code: 'MG', name: 'Madagascar' }, { code: 'MW', name: 'Malawi' }, { code: 'MY', name: 'Malaysia' }, 
    { code: 'MV', name: 'Maldives' }, { code: 'MT', name: 'Malta' }, { code: 'MH', name: 'Marshall Islands' }, 
    { code: 'MR', name: 'Mauritania' }, { code: 'MU', name: 'Mauritius' }, { code: 'MX', name: 'Mexico' }, 
    { code: 'MD', name: 'Moldova' }, { code: 'MC', name: 'Monaco' }, { code: 'MN', name: 'Mongolia' }, 
    { code: 'ME', name: 'Montenegro' }, { code: 'MS', name: 'Montserrat' }, { code: 'MA', name: 'Morocco' }, 
    { code: 'MZ', name: 'Mozambique' }, { code: 'NA', name: 'Namibia' }, { code: 'NR', name: 'Nauru' }, 
    { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' }, { code: 'NL', name: 'Netherlands' }, 
    { code: 'NZ', name: 'New Zealand' }, { code: 'MK', name: 'North Macedonia' }, { code: 'NO', name: 'Norway' }, 
    { code: 'OM', name: 'Oman' }, { code: 'PK', name: 'Pakistan' }, { code: 'PW', name: 'Palau' }, 
    { code: 'PA', name: 'Panama' }, { code: 'PG', name: 'Papua New Guinea' }, { code: 'PY', name: 'Paraguay' }, 
    { code: 'PE', name: 'Peru' }, { code: 'PH', name: 'Philippines' }, { code: 'PL', name: 'Poland' }, 
    { code: 'PT', name: 'Portugal' }, { code: 'QA', name: 'Qatar' }, { code: 'RO', name: 'Romania' }, 
    { code: 'RW', name: 'Rwanda' }, { code: 'KN', name: 'St. Kitts & Nevis' }, { code: 'LC', name: 'St. Lucia' }, 
    { code: 'VC', name: 'St. Vincent & Grenadines' }, { code: 'WS', name: 'Samoa' }, { code: 'SM', name: 'San Marino' }, 
    { code: 'ST', name: 'São Tomé & Príncipe' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' }, 
    { code: 'RS', name: 'Serbia' }, { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' }, 
    { code: 'SG', name: 'Singapore' }, { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' }, 
    { code: 'SB', name: 'Solomon Islands' }, { code: 'ZA', name: 'South Africa' }, { code: 'KR', name: 'South Korea' }, 
    { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' }, { code: 'SR', name: 'Suriname' }, 
    { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' }, { code: 'TW', name: 'Taiwan' }, 
    { code: 'TJ', name: 'Tajikistan' }, { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' }, 
    { code: 'TL', name: 'Timor-Leste' }, { code: 'TG', name: 'Togo' }, { code: 'TO', name: 'Tonga' }, 
    { code: 'TT', name: 'Trinidad & Tobago' }, { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' }, 
    { code: 'TM', name: 'Turkmenistan' }, { code: 'TC', name: 'Turks & Caicos Islands' }, { code: 'TV', name: 'Tuvalu' }, 
    { code: 'UG', name: 'Uganda' }, { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' }, 
    { code: 'US', name: 'United States' }, { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' }, 
    { code: 'VU', name: 'Vanuatu' }, { code: 'VA', name: 'Vatican City' }, { code: 'VN', name: 'Vietnam' }, { code: 'ZM', name: 'Zambia' }
];


export const AttestationModal: React.FC<AttestationModalProps> = ({
  isOpen,
  onClose,
  onVerifyWithBank,
  onVerifyWithId,
}) => {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');

  const allCountries = useMemo(() => {
    const countryMap = new Map<string, string>();
    bankSupportedCountries.forEach(c => countryMap.set(c.code, c.name));
    idSupportedCountries.forEach(c => countryMap.set(c.code, c.name));
    return Array.from(countryMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleCountrySelection = () => {
    setStep(2);
  };

  const reset = () => {
    setStep(1);
    setSelectedCountry('US');
  };

  const handleClose = () => {
    reset();
    onClose();
  };
  
  const handleBack = () => {
    setStep(step - 1);
  };

  if (!isOpen) return null;

  const isBankSupported = bankSupportedCountries.some(c => c.code === selectedCountry);
  const isIdSupported = idSupportedCountries.some(c => c.code === selectedCountry);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 relative text-black">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        {step > 1 && (
            <button onClick={handleBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
                <ArrowLeft size={24} />
            </button>
        )}
        
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">Select Your Country</h2>
            <p className="text-gray-600 mb-6 text-center">
              Please select the country where your documents are issued.
            </p>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#b388ff] focus:border-[#b388ff] outline-none"
            >
              {allCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCountrySelection}
                className="bg-[#b388ff] hover:bg-[#a070e9] text-white font-medium py-2 px-5 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">Choose Verification Method</h2>
            <p className="text-gray-600 mb-6 text-center">
              Select one of the following options available for {allCountries.find(c => c.code === selectedCountry)?.name}.
            </p>
            <div className="space-y-4">
              {isBankSupported && (
                <button
                  onClick={() => onVerifyWithBank(selectedCountry)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-semibold">Verify with Bank</h3>
                  <p className="text-sm text-gray-500">Use your bank account for verification.</p>
                </button>
              )}
              {isIdSupported && (
                 <button
                  onClick={onVerifyWithId}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-semibold">Verify with ID</h3>
                  <p className="text-sm text-gray-500">Use your government-issued ID.</p>
                </button>
              )}
              <button
                onClick={() => console.log("Verify with crypto exchange clicked")}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="font-semibold">Verify with Crypto Exchange</h3>
                <p className="text-sm text-gray-500">Use an existing exchange account (e.g., Coinbase).</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 