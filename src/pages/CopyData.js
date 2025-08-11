// src/pages/CopyData.js
import React, { useState } from 'react';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const inputStyle = { width: '75%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' };

const CopyData = () => {
  const [sourceIndex, setSourceIndex] = useState('');
  const [targetIndexes, setTargetIndexes] = useState('');
  const [copyToDifferentApp, setCopyToDifferentApp] = useState(false);
  const [destAppId, setDestAppId] = useState('');
  const [destApiKey, setDestApiKey] = useState('');
  
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const globalAppId = getAppId();
  const globalApiKey = getApiKey();

  const handleCopy = async () => {
    if (!sourceIndex || !targetIndexes) {
      setError('Please provide a source index and at least one target index.');
      return;
    }
    if (copyToDifferentApp && (!destAppId || !destApiKey)) {
      setError('Please provide the destination App ID and Admin API Key.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLog('Starting copy process...');

    try {
      // 1. Initialisation des clients
      const sourceClient = algoliasearch(globalAppId, globalApiKey);
      const sourceIndexClient = sourceClient.initIndex(sourceIndex);

      const destClient = copyToDifferentApp
        ? algoliasearch(destAppId, destApiKey)
        : sourceClient;

      // 2. Récupération de tous les objets de la source
      setLog('Fetching all objects from source index...');
      const objectsToCopy = [];
      await sourceIndexClient.browseObjects({
        batch: (batch) => {
          objectsToCopy.push(...batch);
        },
      });
      setLog(`${objectsToCopy.length} objects found. Starting copy to target(s)...`);

      // 3. Copie des objets vers la ou les cibles
      const targets = targetIndexes.split(/[\s,;|\n]+/).filter(Boolean);
      for (const targetName of targets) {
        setLog(`Copying to index: ${targetName}...`);
        const targetIndexClient = destClient.initIndex(targetName);
        
        // saveObjects est plus efficace que saveObject en boucle
        await targetIndexClient.saveObjects(objectsToCopy);
        setLog(`✅ Successfully copied ${objectsToCopy.length} objects to ${targetName}.`);
      }

      setLog(prev => `${prev}\n\nAll operations completed successfully!`);

    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Copy Data Between Indexes</h1>

      <InfoBlock title="About this feature">
        This tool allows you to copy all data from a source index to one or more target indexes.
        <br /><br />
        You can copy data within the same application or to a different one by providing separate credentials.
        <br /><br />
        ⚠️ **Warning:** This will overwrite any existing objects in the target index(es) that have the same `objectID`.
      </InfoBlock>

      <SectionBlock title="Configuration">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Source Index:</label>
            <input type="text" value={sourceIndex} onChange={(e) => setSourceIndex(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Target Index(es) (separated by space, comma, or new line):</label>
            <textarea value={targetIndexes} onChange={(e) => setTargetIndexes(e.target.value)} rows={3} style={{...inputStyle, resize: 'vertical'}} />
          </div>
          
          <div style={checkboxLabelStyle}>
            <input 
              type="checkbox" 
              id="diff-app-checkbox"
              checked={copyToDifferentApp} 
              onChange={(e) => setCopyToDifferentApp(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="diff-app-checkbox">Want to copy to a different application?</label>
          </div>
          
          {copyToDifferentApp && (
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <h4>Destination Credentials</h4>
              <div>
                <label>Destination App ID:</label>
                <input type="text" value={destAppId} onChange={(e) => setDestAppId(e.target.value)} style={inputStyle} />
              </div>
              <div style={{marginTop: '15px'}}>
                <label>Destination Admin API Key:</label>
                <input type="password" value={destApiKey} onChange={(e) => setDestApiKey(e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

        </div>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleCopy} label="Start Copy" icon="🚀" color="#28a745" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

export default CopyData;