import React from 'react';

interface Country {
  code: string;
  name: string;
}

// Based on Stripe's documentation for direct bank debits
const supportedCountries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
];

interface CountrySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (countryCode: string) => void;
}

export const CountrySelectionModal: React.FC<CountrySelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedCountry, setSelectedCountry] = React.useState<string>('US');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(selectedCountry);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          width: '100%',
          maxWidth: '400px',
          color: 'black',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem' }}>
          Select Your Country
        </h2>
        <p style={{ color: '#555', marginBottom: '2rem' }}>
          Please select the country where your bank account is located.
        </p>
        <div style={{ marginBottom: '2rem' }}>
          <label
            htmlFor="country-select"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Country
          </label>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              border: '1px solid #ccc',
            }}
          >
            {supportedCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ccc',
              background: 'transparent',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: '#b388ff',
              color: 'white',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}; 