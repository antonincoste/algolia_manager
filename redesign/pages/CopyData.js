// src/pages/CopyData.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { Input, Select, Textarea, Label, FormGroup, Hint } from '../components/FormElements';

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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--gray-700);
  margin: 16px 0;
  
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

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--primary-100);
  color: var(--primary-700);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;

  button {
    margin-left: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--primary-600);
    font-size: 14px;
    padding: 0;
    
    &:hover {
      color: var(--danger-500);
    }
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
`;

const CopyData = () => {
  const [sourceIndex, setSourceIndex] = useState('');
  const [targetIndexes, setTargetIndexes] = useState('');
  const [copyToDifferentApp, setCopyToDifferentApp] = useState(false);
  const [destAppId, setDestAppId] = useState('');
  const [destApiKey, setDestApiKey] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useFilters, setUseFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({ attribute: '', value: '' });
  const [availableAttributes, setAvailableAttributes] = useState([]);

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
      }).catch(err => {
        console.error("Failed to fetch index list for autocomplete:", err);
      });
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

  const handleFetchAttributes = async () => {
    if (!sourceIndex) {
      setError('Please provide a source index first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setLog('Fetching attributes from source index...');
    try {
      const client = algoliasearch(globalAppId, globalApiKey);
      const index = client.initIndex(sourceIndex);
      const response = await index.search('', { hitsPerPage: 10 });
      const attributeSet = new Set();
      response.hits.forEach(hit => {
        Object.keys(hit).forEach(key => attributeSet.add(key));
      });
      const sortedAttributes = [...attributeSet].sort((a, b) => a.localeCompare(b));
      setAvailableAttributes(sortedAttributes);
      setLog(`Found ${sortedAttributes.length} attributes. You can now build your filters.`);
    } catch (err) {
      setError('Error fetching attributes: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFilter = () => {
    if (newFilter.attribute && newFilter.value) {
      setFilters([...filters, newFilter]);
      setNewFilter({ attribute: '', value: '' });
    }
  };

  const removeFilter = (idxToRemove) => {
    setFilters(filters.filter((_, idx) => idx !== idxToRemove));
  };

  const buildFilterString = () => {
    if (!useFilters || filters.length === 0) return '';
    return filters
      .map(f => `${f.attribute}:"${f.value.replace(/"/g, '\\"')}"`)
      .join(' AND ');
  };

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
      const sourceClient = algoliasearch(globalAppId, globalApiKey);
      const sourceIndexClient = sourceClient.initIndex(sourceIndex);
      const destClient = copyToDifferentApp
        ? algoliasearch(destAppId, destApiKey)
        : sourceClient;
      
      const filterString = buildFilterString();
      setLog(`Fetching objects from source index with filters: ${filterString || 'None'}...`);

      const objectsToCopy = [];
      await sourceIndexClient.browseObjects({
        filters: filterString,
        batch: (batch) => {
          objectsToCopy.push(...batch);
        },
      });

      if (objectsToCopy.length === 0) {
        setLog('Warning: 0 objects found with the specified filters. Nothing to copy.');
        setIsLoading(false);
        return;
      }
      
      setLog(`${objectsToCopy.length} objects found. Starting copy to target(s)...`);

      const targets = targetIndexes.split(/[\s,;|\n]+/).filter(Boolean);
      for (const targetName of targets) {
        setLog(`Copying to index: ${targetName}...`);
        const targetIndexClient = destClient.initIndex(targetName);
        await targetIndexClient.saveObjects(objectsToCopy);
        setLog(`✅ Successfully copied ${objectsToCopy.length} objects to ${targetName}.`);
      }

      setLog(prev => `${prev}\n\n🎉 All operations completed successfully!`);
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
        title="Copy Data Between Indexes"
        subtitle="Duplicate records from one index to another"
      />

      <InfoBlock title="About this feature" icon="📋">
        This tool allows you to copy data from a source index to one or more target indexes.
        You can copy data within the same application or to a different one by providing separate credentials.
        <br/><br/>
        ⚠️ <strong>Warning:</strong> This will overwrite any existing objects in the target index(es) that have the same <code>objectID</code>.
      </InfoBlock>

      <SectionBlock title="Configuration">
        <FormGroup>
          <Label>Source Index</Label>
          <AutocompleteContainer>
            <Input
              type="text"
              value={sourceIndex}
              onChange={(e) => setSourceIndex(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder="Search for a primary index..."
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
          <Label>Target Index(es) (separated by space, comma, or new line)</Label>
          <Textarea 
            value={targetIndexes} 
            onChange={(e) => setTargetIndexes(e.target.value)} 
            rows={3} 
            placeholder="Enter target index names..."
          />
        </FormGroup>

        <CheckboxLabel>
          <input 
            type="checkbox"
            checked={useFilters} 
            onChange={(e) => setUseFilters(e.target.checked)}
          />
          Want to copy only specific products?
        </CheckboxLabel>

        <CheckboxLabel>
          <input 
            type="checkbox"
            checked={copyToDifferentApp} 
            onChange={(e) => setCopyToDifferentApp(e.target.checked)}
          />
          Want to copy to a different application?
        </CheckboxLabel>
        
        {copyToDifferentApp && (
          <CredentialsBox>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--gray-900)' }}>Destination Credentials</h4>
            <FormGroup>
              <Label>Destination App ID</Label>
              <Input type="text" value={destAppId} onChange={(e) => setDestAppId(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Destination API Key</Label>
              <Input type="password" value={destApiKey} onChange={(e) => setDestApiKey(e.target.value)} />
            </FormGroup>
          </CredentialsBox>
        )}
      </SectionBlock>

      {useFilters && (
        <SectionBlock title="Filters">
          <StyledButton onClick={handleFetchAttributes} label="Fetch Attributes from Source Index" icon="🔄" variant="secondary" />
          
          {filters.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '16px 0' }}>
              {filters.map((f, idx) => (
                <FilterChip key={idx}>
                  <span>{f.attribute}: {f.value}</span>
                  <button onClick={() => removeFilter(idx)}>✖</button>
                </FilterChip>
              ))}
            </div>
          )}

          <FilterRow>
            <Select 
              onChange={(e) => setNewFilter({ ...newFilter, attribute: e.target.value })} 
              value={newFilter.attribute} 
              style={{ width: '200px' }}
              disabled={availableAttributes.length === 0}
            >
              <option value="">-- Attribute --</option>
              {availableAttributes.map((a, i) => (<option key={i} value={a}>{a}</option>))}
            </Select>
            <Input 
              type="text" 
              placeholder="Value" 
              value={newFilter.value} 
              onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })} 
              style={{ width: '160px' }} 
            />
            <StyledButton onClick={handleAddFilter} label="Add Filter" icon="➕" variant="success" size="sm" />
          </FilterRow>
        </SectionBlock>
      )}

      <SectionBlock title="Actions">
        <StyledButton onClick={handleCopy} label="Start Copy" icon="🚀" variant="primary" size="lg" />
      </SectionBlock>

      {error && <Hint className="error" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</Hint>}
    </div>
  );
};

export default CopyData;