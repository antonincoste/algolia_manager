// src/components/ApiKeyPrompt.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const promptStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000,
};

const contentStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '8px',
  width: '400px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '20px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '4px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
};

const ApiKeyPrompt = ({ onSave, onCancel }) => {
  const [key, setKey] = useState('');
  const [id, setId] = useState('');

  const handleSaveClick = () => {
    if (key && id) {
      onSave({ newKey: key, newId: id });
    }
  };

  // Utilisation d'un portail pour rendre le modal directement dans le body
  return ReactDOM.createPortal(
    <div style={promptStyle} onClick={onCancel}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Add Credentials</h2>
        
        <div>
          <label>App ID:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={inputStyle}
            placeholder="Your Algolia App ID"
          />
        </div>

        <div>
          <label>Admin API Key:</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            style={inputStyle}
            placeholder="Your Algolia Admin API Key"
          />
        </div>
        
        <button onClick={handleSaveClick} style={buttonStyle}>Save</button>
        <button onClick={onCancel} style={{...buttonStyle, backgroundColor: '#6c757d', marginLeft: '10px'}}>Cancel</button>
      </div>
    </div>,
    document.body  // Le modal sera rendu directement dans le body
  );
};

export default ApiKeyPrompt;