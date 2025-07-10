import React, { useState } from 'react';
import { setApiKey } from '../services/sessionService';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
  }
`;

const ApiKeyPrompt = ({ onApiKeySet }) => {
  const [apiKey, setApiKeyInput] = useState('');

  const handleSave = () => {
    setApiKey(apiKey);
    onApiKeySet(apiKey);
  };

  return (
    <Overlay>
      <Modal>
        <Title>Enter your Algolia API Key</Title>
        <Input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Your API Key"
        />
        <Button onClick={handleSave}>Save</Button>
      </Modal>
    </Overlay>
  );
};

export default ApiKeyPrompt;
