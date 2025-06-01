import React, { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : !domain ? (
        <DomainSelection onSelect={handleDomainSelect} />
      ) : (
        <InterviewPage domain={domain} />
      )}
    </div>
  );
}

export default App;
