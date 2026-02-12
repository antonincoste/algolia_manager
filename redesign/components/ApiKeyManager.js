import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getApiKey, setApiKey, getAppId, setAppId, removeCredentials } from '../services/sessionService';
import ApiKeyPrompt from './ApiKeyPrompt';

const CredentialsContainer = styled.div`
  background-color: var(--gray-50);
  border-radius: var(--radius-lg);
  padding: 16px;
`;

const CredentialsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const CredentialsIcon = styled.span`
  font-size: 14px;
`;

const CredentialsTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
`;

const CredentialsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CredentialRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

const CredentialCheck = styled.span`
  color: var(--success-500);
  font-weight: bold;
`;

const CredentialLabel = styled.span`
  color: var(--gray-500);
`;

const CredentialValue = styled.span`
  color: var(--gray-700);
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
`;

const EmptyState = styled.p`
  font-size: 13px;
  color: var(--gray-500);
  margin: 0 0 12px 0;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  ${props => props.$variant === 'primary' ? `
    background-color: var(--primary-500);
    color: var(--white);
    border: none;
    
    &:hover {
      background-color: var(--primary-600);
    }
  ` : `
    background-color: var(--danger-50);
    color: var(--danger-500);
    border: 1px solid var(--danger-100);
    margin-top: 8px;
    
    &:hover {
      background-color: var(--danger-100);
    }
  `}
`;

const ApiKeyManager = () => {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [appId, setAppIdState] = useState(getAppId());
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
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
    removeCredentials();
    setApiKeyState(null);
    setAppIdState(null);
  };

  const hasCredentials = apiKey && appId;

  return (
    <CredentialsContainer>
      <CredentialsHeader>
        <CredentialsIcon>🔐</CredentialsIcon>
        <CredentialsTitle>Credentials</CredentialsTitle>
      </CredentialsHeader>

      {hasCredentials ? (
        <CredentialsContent>
          <CredentialRow>
            <CredentialCheck>✓</CredentialCheck>
            <CredentialLabel>App ID:</CredentialLabel>
            <CredentialValue>{appId}</CredentialValue>
          </CredentialRow>
          <CredentialRow>
            <CredentialCheck>✓</CredentialCheck>
            <CredentialLabel>API Key:</CredentialLabel>
            <CredentialValue>{apiKey.slice(0, 4)}••••</CredentialValue>
          </CredentialRow>
          <Button onClick={handleDelete}>Remove</Button>
        </CredentialsContent>
      ) : (
        <>
          <EmptyState>No credentials configured</EmptyState>
          <Button $variant="primary" onClick={() => setShowPopup(true)}>
            Add Credentials
          </Button>
        </>
      )}

      {showPopup && <ApiKeyPrompt onSave={handleSave} onCancel={() => setShowPopup(false)} />}
    </CredentialsContainer>
  );
};

export default ApiKeyManager;