import React, { useState } from 'react';

function DomainSelection({ onSelect }) {
  const [domain, setDomain] = useState('');

  const domains = ['JavaScript', 'Python', 'Java', 'SQL', 'React'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (domain) {
      onSelect(domain);
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-96">
      <h2 className="text-2xl font-bold mb-4">Select Domain</h2>
      <div className="mb-4">
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>Select a domain</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={!domain}
      >
        Start Interview
      </button>
    </div>
  );
}

export default DomainSelection;
