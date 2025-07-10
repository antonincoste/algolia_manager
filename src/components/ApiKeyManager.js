import React, { useState, useEffect } from 'react';
import { getApiKey, setApiKey } from '../services/sessionService';
import ApiKeyPrompt from './ApiKeyPrompt';

const ApiKeyManager = () => {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setApiKeyState(getApiKey());
  }, []);

  const handleSave = (newKey) => {
    setApiKey(newKey);
    setApiKeyState(newKey);
    setShowPopup(false);
  };

  const handleDelete = () => {
    sessionStorage.removeItem('algoliaApiKey');
    setApiKeyState(null);
  };

  return (
    <div style={{ padding: '20px', borderTop: '1px solid #ccc', marginTop: '20px' }}>
      <h3>API Key</h3>

      {apiKey ? (
        <>
          <p>API Key added: {apiKey.slice(0, 4)}******</p>
          <button onClick={handleDelete}>Delete API Key</button>
        </>
      ) : (
        <>
          <p>API Key not provided</p>
          <button
            onClick={() => setShowPopup(true)}
            style={{ padding: '10px 20px', borderRadius: '4px', backgroundColor: '#6699CC', color: '#fff', border: 'none' }}
          >
            Add API Key
          </button>
        </>
      )}

      {showPopup && <ApiKeyPrompt onApiKeySet={handleSave} />}
    </div>
  );
};

export default ApiKeyManager;
