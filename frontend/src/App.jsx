import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './components/LoginPage';
import DomainSelection from './components/DomainSelection';
import InterviewPage from './components/InterviewPage';

function App() {
  const [user, setUser] = useState(null);
  const [domain, setDomain] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleDomainSelect = (selectedDomain) => {
    setDomain(selectedDomain);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : !domain ? (
        <DomainSelection onSelect={handleDomainSelect} />
      ) : (
        <InterviewPage user={user} domain={domain} />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
