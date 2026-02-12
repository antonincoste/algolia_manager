// src/pages/QueryDecoder.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { trackQueryDecoder } from '../services/analyticsService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import PageHeader from '../components/PageHeader';
import { Textarea, Hint } from '../components/FormElements';

const ResultContainer = styled.div`
  position: relative;
  background-color: var(--gray-900);
  color: #f8f8f2;
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-top: 16px;
  max-height: 500px;
  overflow: auto;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 13px;
  line-height: 1.6;

  pre {
    margin: 0;
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--gray-700);
  color: var(--white);
  border: 1px solid var(--gray-600);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--gray-600);
  }
`;

const CodeTextarea = styled(Textarea)`
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 13px;
`;

const smartParseValue = (value) => {
  try {
    if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
      return JSON.parse(value);
    }
  } catch (e) { /* Not valid JSON */ }

  if (value === 'true') return true;
  if (value === 'false') return false;

  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;

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
      trackQueryDecoder();
    } catch (err) {
      setError("Failed to decode the query string. Please check the format.");
      console.error(err);
    }
  };

  const handleCopy = () => {
    if (jsonObject) {
      navigator.clipboard.writeText(JSON.stringify(jsonObject, null, 2)).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="Query Parameter Decoder"
        subtitle="Convert raw Algolia query strings into readable JSON"
      />

      <InfoBlock title="About this feature" icon="{ }">
        Paste a raw Algolia query parameter string from your logs to convert it into a readable, formatted JSON object.
        <br/><br/>
        This tool automatically decodes URL-encoded characters and attempts to convert values like arrays, booleans, and numbers into their proper types.
      </InfoBlock>

      <SectionBlock title="1. Paste Query String">
        <CodeTextarea
          value={queryString}
          onChange={(e) => setQueryString(e.target.value)}
          placeholder="distinct=1&facets=%5B%22brand%22%2C%22size%22%5D&..."
          rows={6}
        />
      </SectionBlock>

      <SectionBlock title="2. Generate JSON">
        <StyledButton onClick={handleDecode} label="Decode" icon="🚀" variant="primary" />
      </SectionBlock>

      {error && <Hint className="error" style={{ marginTop: '20px' }}>{error}</Hint>}

      {jsonObject && (
        <SectionBlock title="3. Result">
          <ResultContainer>
            <CopyButton onClick={handleCopy}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
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