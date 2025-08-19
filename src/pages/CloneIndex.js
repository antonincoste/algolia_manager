// src/pages/CloneIndex.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' };

const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const CloneIndex = () => {
  const [sourceIndex, setSourceIndex] = useState('');
  const [targetIndex, setTargetIndex] = useState('');
  
  const [cloneOptions, setCloneOptions] = useState({
    objects: true,
    settings: true,
    rules: true,
    synonyms: true,
  });

  const [copyToDifferentApp, setCopyToDifferentApp] = useState(false);
  const [destAppId, setDestAppId] = useState('');
  const [destApiKey, setDestApiKey] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [allIndexes, setAllIndexes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const globalAppId = getAppId();
  const globalApiKey = getApiKey();

  useEffect(() => {
    if (globalAppId && globalApiKey) {
      const searchClient = algoliasearch(globalAppId, globalApiKey);
      searchClient.listIndices().then(({ items }) => {
        const primaryIndexes = items.filter(item => !item.primary);
        const cleanedNames = primaryIndexes.map(item => item.name.trim());
        const uniqueNames = [...new Set(cleanedNames)];
        setAllIndexes(uniqueNames.sort());
      }).catch(err => console.error("Failed to fetch index list:", err));
    }
  }, [globalAppId, globalApiKey]);

  useEffect(() => {
    if (sourceIndex && allIndexes.length > 0) {
      const filtered = allIndexes.filter(name =>
        name.toLowerCase().includes(sourceIndex.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [sourceIndex, allIndexes]);

  const handleSuggestionClick = (name) => {
    setSourceIndex(name);
    setSuggestions([]);
    setIsInputFocused(false);
  };
  
  const handleCheckboxChange = (option) => {
    setCloneOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleClone = async () => {
    if (!sourceIndex || !targetIndex) {
      setError('Please provide both a source and a target index.');
      return;
    }
    if (copyToDifferentApp && (!destAppId || !destApiKey)) {
      setError('Please provide the destination App ID and Admin API Key.');
      return;
    }

    if (!window.confirm(`ARE YOU SURE you want to clone '${sourceIndex}' to '${targetIndex}'? This will overwrite all content in the target index if it exists.`)) {
        return;
    }

    setIsLoading(true);
    setError('');
    let fullLog = `Starting clone from '${sourceIndex}' to '${targetIndex}'...\n`;
    setLog(fullLog);

    try {
      const sourceClient = algoliasearch(globalAppId, globalApiKey);
      const sourceIndexClient = sourceClient.initIndex(sourceIndex);

      const destClient = copyToDifferentApp
        ? algoliasearch(destAppId, destApiKey)
        : sourceClient;
      const targetIndexClient = destClient.initIndex(targetIndex);

      if (cloneOptions.settings) {
        fullLog += "\n- Cloning settings...";
        setLog(fullLog);
        const settings = await sourceIndexClient.getSettings();
        
        // CORRECTION CLÉ : On supprime la liste des répliques avant de l'appliquer
        delete settings.replicas; 
        
        await targetIndexClient.setSettings(settings);
        fullLog += " ✅ Done.";
        setLog(fullLog);
      }
      
      if (cloneOptions.rules) {
        fullLog += "\n- Cloning rules...";
        setLog(fullLog);
        const rules = [];
        await sourceIndexClient.browseRules({ batch: batch => rules.push(...batch) });
        if (rules.length > 0) {
            await targetIndexClient.saveRules(rules, { clearExistingRules: true });
            fullLog += ` ✅ ${rules.length} rules copied.`;
        } else {
            fullLog += " ℹ️ No rules to copy.";
        }
        setLog(fullLog);
      }
      
      if (cloneOptions.synonyms) {
        fullLog += "\n- Cloning synonyms...";
        setLog(fullLog);
        const synonyms = [];
        await sourceIndexClient.browseSynonyms({ batch: batch => synonyms.push(...batch) });
        if (synonyms.length > 0) {
            await targetIndexClient.saveSynonyms(synonyms, { clearExistingSynonyms: true });
            fullLog += ` ✅ ${synonyms.length} synonyms copied.`;
        } else {
            fullLog += " ℹ️ No synonyms to copy.";
        }
        setLog(fullLog);
      }

      if (cloneOptions.objects) {
        fullLog += "\n- Cloning objects...";
        setLog(fullLog);
        const objects = [];
        await sourceIndexClient.browseObjects({ batch: batch => objects.push(...batch) });

        if (objects.length > 0) {
            await targetIndexClient.saveObjects(objects, { autoGenerateObjectIDIfNotExist: false });
            fullLog += ` ✅ ${objects.length} objects copied.`;
        } else {
            fullLog += " ℹ️ No objects to copy.";
        }
        setLog(fullLog);
      }
      
      setLog(fullLog + '\n\n🎉 All operations completed successfully!');

    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Clone Index</h1>
      <InfoBlock title="About this feature">
        This tool performs a complete clone of an index, including its objects, settings, rules, and synonyms.
        <br/><br/>
        It can be used to back up an index, create a new environment (e.g., from production to staging), or duplicate an index for testing.
        <br/><br/>
        ⚠️ <b>Warning:</b> This will completely overwrite the target index if it already exists.
      </InfoBlock>

      <SectionBlock title="Configuration">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>Source Index (Primary Only):</label>
            <AutocompleteContainer>
              <input
                type="text"
                value={sourceIndex}
                onChange={(e) => setSourceIndex(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                style={inputStyle}
                placeholder="Search for a primary index to clone from..."
              />
              {isInputFocused && suggestions.length > 0 && (
                <SuggestionsList>
                  {suggestions.slice(0, 10).map(suggestion => (
                    <SuggestionItem key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </AutocompleteContainer>
          </div>
          <div>
            <label>New or Existing Target Index Name:</label>
            <input type="text" value={targetIndex} onChange={(e) => setTargetIndex(e.target.value)} style={inputStyle} />
          </div>

          <div style={checkboxLabelStyle}>
            <input type="checkbox" id="diff-app-checkbox" checked={copyToDifferentApp} onChange={(e) => setCopyToDifferentApp(e.target.checked)} style={{ width: '18px', height: '18px' }}/>
            <label htmlFor="diff-app-checkbox">Clone to a different application?</label>
          </div>
          
          {copyToDifferentApp && (
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <h4>Destination Credentials</h4>
              <div>
                <label>Destination App ID:</label>
                <input type="text" value={destAppId} onChange={(e) => setDestAppId(e.target.value)} style={inputStyle} />
              </div>
              <div style={{marginTop: '15px'}}>
                <label>Destination API Key:</label>
                <input type="password" value={destApiKey} onChange={(e) => setDestApiKey(e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}
        </div>
      </SectionBlock>

      <SectionBlock title="Cloning Options">
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {Object.keys(cloneOptions).map(option => (
                <div key={option} style={checkboxLabelStyle}>
                    <input type="checkbox" id={`checkbox-${option}`} checked={cloneOptions[option]} onChange={() => handleCheckboxChange(option)} style={{ width: '18px', height: '18px' }}/>
                    <label htmlFor={`checkbox-${option}`} style={{ textTransform: 'capitalize' }}>{option}</label>
                </div>
            ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleClone} label="🚀 Start Cloning" color="#e67e22" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

export default CloneIndex;