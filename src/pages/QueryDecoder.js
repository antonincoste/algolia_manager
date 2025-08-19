// src/pages/QueryDecoder.js
import React, { useState } from 'react';
import styled from 'styled-components';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';

const textareaStyle = { 
  width: '100%', 
  minHeight: '150px',
  padding: '12px', 
  fontSize: '14px', 
  fontFamily: 'monospace',
  borderRadius: '4px', 
  border: '1px solid #ccc', 
  resize: 'vertical',
  boxSizing: 'border-box'
};

const ResultContainer = styled.div`
  position: relative;
  background-color: #2d2d2d;
  color: #f8f8f2;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  max-height: 500px;
  overflow: auto;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #44475a;
  color: #f8f8f2;
  border: 1px solid #6272a4;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: #6272a4;
  }
`;

const smartParseValue = (value) => {
  // 1. Essayer de parser comme du JSON (pour les tableaux, objets)
  try {
    // Si c'est un tableau ou un objet encodé en string, le parser.
    if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
      return JSON.parse(value);
    }
  } catch (e) { /* Ce n'est pas du JSON valide, on continue */ }

  // 2. Vérifier si c'est un booléen
  if (value === 'true') return true;
  if (value === 'false') return false;

  // 3. Vérifier si c'est un nombre
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;

  // 4. Sinon, retourner la chaîne de caractères
  return value;
};


const QueryDecoder = () => {
  const [queryString, setQueryString] = useState('');
  const [jsonObject, setJsonObject] = useState(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDecode = () => {
    setError('');
    setJsonObject(null);
    if (!queryString.trim()) {
      return;
    }
    
    try {
      const params = new URLSearchParams(queryString);
      const decodedObject = {};
      
      for (const [key, value] of params.entries()) {
        decodedObject[key] = smartParseValue(value);
      }
      
      setJsonObject(decodedObject);
    } catch (err) {
      setError("Failed to decode the query string. Please check the format.");
      console.error(err);
    }
  };

  const handleCopy = () => {
    if (jsonObject) {
      navigator.clipboard.writeText(JSON.stringify(jsonObject, null, 2)).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Réinitialise le message après 2s
      });
    }
  };
  
  return (
    <div>
      <h1>Algolia Query Parameter Decoder</h1>
      <InfoBlock title="About this feature">
        Paste a raw Algolia query parameter string from your logs to convert it into a readable, formatted JSON object.
        <br/><br/>
        This tool automatically decodes URL-encoded characters and attempts to convert values like arrays, booleans, and numbers into their proper types.
      </InfoBlock>

      <SectionBlock title="1. Paste Query String">
        <textarea
          style={textareaStyle}
          value={queryString}
          onChange={(e) => setQueryString(e.target.value)}
          placeholder="distinct=1&facets=%5B%22brand%22%2C%22size%22%5D&..."
        />
      </SectionBlock>

      <SectionBlock title="2. Generate JSON">
        <StyledButton onClick={handleDecode} label="Decode" icon="🚀" color="#28a745" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}

      {jsonObject && (
        <SectionBlock title="3. Result">
          <ResultContainer>
            <CopyButton onClick={handleCopy}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              {copySuccess ? 'Copied!' : 'Copy'}
            </CopyButton>
            <pre><code>{JSON.stringify(jsonObject, null, 2)}</code></pre>
          </ResultContainer>
        </SectionBlock>
      )}
    </div>
  );
};

export default QueryDecoder;