// src/pages/CloneIndex.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { Input, Label, FormGroup, Hint } from '../components/FormElements';

const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  position: absolute;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: var(--shadow-lg);
`;

const SuggestionItem = styled.li`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--gray-700);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-50);
    color: var(--primary-600);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--gray-700);
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--primary-500);
    cursor: pointer;
  }
`;

const CredentialsBox = styled.div`
  border: 1px solid var(--gray-200);
  padding: 20px;
  border-radius: var(--radius-lg);
  background-color: var(--gray-50);
  margin-top: 16px;
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
      
      <PageHeader 
        title="Clone Index"
        subtitle="Duplicate an entire index including objects, settings, rules, and synonyms"
      />

      <InfoBlock title="About this feature" icon="🧬">
        This tool performs a complete clone of an index, including its objects, settings, rules, and synonyms.
        It can be used to back up an index, create a new environment (e.g., from production to staging), or duplicate an index for testing.
        <br/><br/>
        ⚠️ <strong>Warning:</strong> This will completely overwrite the target index if it already exists.
      </InfoBlock>

      <SectionBlock title="Configuration">
        <FormGroup>
          <Label>Source Index (Primary Only)</Label>
          <AutocompleteContainer>
            <Input
              type="text"
              value={sourceIndex}
              onChange={(e) => setSourceIndex(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
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
        </FormGroup>

        <FormGroup>
          <Label>Target Index Name</Label>
          <Input 
            type="text" 
            value={targetIndex} 
            onChange={(e) => setTargetIndex(e.target.value)} 
            placeholder="Enter new or existing target index name"
          />
        </FormGroup>

        <CheckboxLabel style={{ marginTop: '16px' }}>
          <input 
            type="checkbox" 
            checked={copyToDifferentApp} 
            onChange={(e) => setCopyToDifferentApp(e.target.checked)} 
          />
          Clone to a different application?
        </CheckboxLabel>
        
        {copyToDifferentApp && (
          <CredentialsBox>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--gray-900)' }}>Destination Credentials</h4>
            <FormGroup>
              <Label>Destination App ID</Label>
              <Input 
                type="text" 
                value={destAppId} 
                onChange={(e) => setDestAppId(e.target.value)} 
                placeholder="Enter destination App ID"
              />
            </FormGroup>
            <FormGroup>
              <Label>Destination API Key</Label>
              <Input 
                type="password" 
                value={destApiKey} 
                onChange={(e) => setDestApiKey(e.target.value)} 
                placeholder="Enter destination Admin API Key"
              />
            </FormGroup>
          </CredentialsBox>
        )}
      </SectionBlock>

      <SectionBlock title="Cloning Options">
        <CheckboxGroup>
          {Object.keys(cloneOptions).map(option => (
            <CheckboxLabel key={option}>
              <input 
                type="checkbox" 
                checked={cloneOptions[option]} 
                onChange={() => handleCheckboxChange(option)} 
              />
              <span style={{ textTransform: 'capitalize' }}>{option}</span>
            </CheckboxLabel>
          ))}
        </CheckboxGroup>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleClone} label="🚀 Start Cloning" variant="primary" size="lg" />
      </SectionBlock>

      {error && <Hint className="error" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</Hint>}
    </div>
  );
};

export default CloneIndex;