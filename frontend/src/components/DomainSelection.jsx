import React, { useState } from 'react';

function DomainSelection({ onSelect }) {
  const domains = [
    'JavaScript',
    'Python',
    'Java',
    'Data Science',
    'Machine Learning',
    'Web Development',
  ];
  const [selectedDomain, setSelectedDomain] = useState('');

  const handleSubmit = () => {
    if (selectedDomain) {
      onSelect(selectedDomain);
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-96">
      <h2 className="text-2xl font-bold mb-4">Select Interview Domain</h2>
      <select
        value={selectedDomain}
        onChange={(e) => setSelectedDomain(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select a domain</option>
        {domains.map((domain) => (
          <option key={domain} value={domain}>
            {domain}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Start Interview
      </button>
    </div>
  );
}

export default DomainSelection;
