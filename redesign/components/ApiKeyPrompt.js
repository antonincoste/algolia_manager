import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background-color: var(--white);
  padding: 32px;
  border-radius: var(--radius-xl);
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const ModalIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 14px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  background-color: var(--gray-50);
  color: var(--gray-900);
  transition: all var(--transition-fast);
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--primary-500);
    background-color: var(--white);
    box-shadow: 0 0 0 4px var(--primary-100);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 28px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%);
    color: var(--white);
    border: none;
    box-shadow: var(--shadow-primary);
    
    &:hover {
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
      transform: translateY(-1px);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background-color: var(--gray-100);
    color: var(--gray-700);
    border: none;
    
    &:hover {
      background-color: var(--gray-200);
    }
  `}
`;

const ApiKeyPrompt = ({ onSave, onCancel }) => {
  const [key, setKey] = useState('');
  const [id, setId] = useState('');

  const handleSaveClick = () => {
    if (key && id) {
      onSave({ newKey: key, newId: id });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && key && id) {
      handleSaveClick();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return ReactDOM.createPortal(
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <ModalHeader>
          <ModalIcon>🔐</ModalIcon>
          <ModalTitle>Add Credentials</ModalTitle>
        </ModalHeader>
        
        <FormGroup>
          <Label>App ID</Label>
          <Input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Your Algolia App ID"
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <Label>Admin API Key</Label>
          <Input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Your Algolia Admin API Key"
          />
        </FormGroup>
        
        <ButtonGroup>
          <Button onClick={onCancel}>Cancel</Button>
          <Button 
            $variant="primary" 
            onClick={handleSaveClick}
            disabled={!key || !id}
          >
            Save Credentials
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>,
    document.body
  );
};

export default ApiKeyPrompt;