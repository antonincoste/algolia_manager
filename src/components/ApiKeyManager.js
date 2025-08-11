// src/components/ApiKeyManager.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// MODIFIÉ : Importation de toutes les fonctions nécessaires
import { getApiKey, setApiKey, getAppId, setAppId, removeCredentials } from '../services/sessionService';
import ApiKeyPrompt from './ApiKeyPrompt';

// NOUVEAU : Utilisation de styled-components pour les boutons
const StyledButton = styled.button`
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Style conditionnel basé sur les props */
  background-color: ${props => props.variant === 'delete' ? '#dc3545' : '#007bff'};
  color: white;

  &:hover {
    opacity: 0.85;
  }
`;

const ApiKeyManager = () => {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [appId, setAppIdState] = useState(getAppId()); // NOUVEAU : état pour l'App ID
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Ce useEffect s'assure que l'état est synchronisé si le sessionStorage change dans un autre onglet
    const syncState = () => {
      setApiKeyState(getApiKey());
      setAppIdState(getAppId());
    };
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, []);

  const handleSave = ({ newKey, newId }) => {
    setApiKey(newKey);
    setAppId(newId);
    setApiKeyState(newKey);
    setAppIdState(newId);
    setShowPopup(false);
  };

  const handleDelete = () => {
    removeCredentials(); // Utilise la nouvelle fonction pour tout supprimer
    setApiKeyState(null);
    setAppIdState(null);
  };

  const hasCredentials = apiKey && appId;

  return (
    <div style={{ padding: '20px', borderTop: '1px solid #ccc', marginTop: 'auto', backgroundColor: '#f8f9fa' }}>
      <h3>Credentials</h3>

      {hasCredentials ? (
        <>
          <p style={{margin: '8px 0'}}>✅ App ID: <strong>{appId}</strong></p>
          <p style={{margin: '8px 0'}}>✅ API Key: <strong>{apiKey.slice(0, 4)}...</strong></p>
          <StyledButton onClick={handleDelete} variant="delete">Delete Credentials</StyledButton>
        </>
      ) : (
        <>
          <p>Credentials not provided.</p>
          <StyledButton onClick={() => setShowPopup(true)}>Add Credentials</StyledButton>
        </>
      )}

      {showPopup && <ApiKeyPrompt onSave={handleSave} onCancel={() => setShowPopup(false)} />}
    </div>
  );
};

export default ApiKeyManager;