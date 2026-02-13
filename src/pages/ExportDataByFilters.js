// src/pages/ExportDataByFilters.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getApiKey, getAppId } from '../services/sessionService';
import { trackExportCSV, trackError } from '../services/analyticsService';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { 
  Input, 
  Select, 
  Label, 
  FormGroup, 
  Hint,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  ToggleThumb
} from '../components/FormElements';

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

const ColumnRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ExportDataByFilters = () => {
  const [indexName, setIndexName] = useState('');
  const [attributes, setAttributes] = useState(['objectID']);
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({ attribute: '', value: '' });
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [useDistinct, setUseDistinct] = useState(false);
  const [distinctAttribute, setDistinctAttribute] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allIndexes, setAllIndexes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const apiKey = getApiKey();
  const appId = getAppId();

  useEffect(() => {
    if (appId && apiKey) {
      const searchClient = algoliasearch(appId, apiKey);
      searchClient.listIndices().then(({ items }) => {
        const primaryIndexes = items.filter(item => !item.primary);
        const cleanedNames = primaryIndexes.map(item => item.name.trim());
        const uniqueNames = [...new Set(cleanedNames)];
        setAllIndexes(uniqueNames.sort());
      }).catch(err => {
        console.error("Failed to fetch index list for autocomplete:", err);
      });
    }
  }, [appId, apiKey]);

  useEffect(() => {
    if (indexName && allIndexes.length > 0) {
      const filtered = allIndexes.filter(name =>
        name.toLowerCase().includes(indexName.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [indexName, allIndexes]);

  const handleSuggestionClick = (name) => {
    setIndexName(name);
    setSuggestions([]);
    setIsInputFocused(false);
  };

  const clearStatus = () => {
    setError('');
    setLog('');
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, '']);
  };

  const handleRemoveAttribute = (idxToRemove) => {
    setAttributes(attributes.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAttributeChange = (value, idx) => {
    const newAttributes = [...attributes];
    newAttributes[idx] = value;
    setAttributes(newAttributes);
  };

  const handleAddFilter = () => {
    if (newFilter.attribute && newFilter.value) {
      setFilters([...filters, newFilter]);
      setNewFilter({ attribute: '', value: '' });
    }
  };

  const removeFilter = (idxToRemove) => {
    const newFilters = filters.filter((_, idx) => idx !== idxToRemove);
    setFilters(newFilters);
  };

  const synchronizeDataModel = async () => {
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }
    clearStatus();
    setLog('Synchronizing data model...');
    setIsLoading(true);

    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);
      const settings = await index.getSettings();
      if (settings.attributeForDistinct) {
        setDistinctAttribute(settings.attributeForDistinct);
        setLog(`Distinct attribute found: ${settings.attributeForDistinct}`);
      } else {
        setDistinctAttribute('');
        setLog('No distinct attribute defined in index settings.');
      }
      const response = await index.search('', { hitsPerPage: 100 });
      const attributeSet = new Set();
      response.hits.forEach(hit => {
        Object.keys(hit).forEach(key => attributeSet.add(key));
      });
      const sortedAttributes = [...attributeSet].sort((a, b) => a.localeCompare(b));
      setAvailableAttributes(sortedAttributes);
    } catch (err) {
      setError('Error during synchronization: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFilterString = () => {
    return filters
      .filter(f => f.attribute && f.value)
      .map(f => `${f.attribute}:"${f.value.replace(/"/g, '\\"')}"`)
      .join(' AND ');
  };

  const handleGenerateFile = async () => {
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }
    clearStatus();
    setLog('Generating CSV file...');
    setIsLoading(true);

    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);
      const filteredAttributes = attributes.filter(attr => attr);
      if (filteredAttributes.length === 0) {
        throw new Error("Please select at least one column to export.");
      }
      const allObjects = [];
      await index.browseObjects({
        query: '',
        filters: buildFilterString(),
        attributesToRetrieve: filteredAttributes,
        batch: (batch) => {
          allObjects.push(...batch);
        },
      });

      let finalObjects = allObjects;
      if (useDistinct && distinctAttribute) {
        const seen = new Set();
        finalObjects = allObjects.filter(obj => {
          const key = obj[distinctAttribute];
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      const csvRows = [filteredAttributes.join(';')];
      finalObjects.forEach(obj => {
        const row = filteredAttributes.map(attr => {
          const value = obj[attr];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        });
        csvRows.push(row.join(';'));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `algolia_export_${indexName}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      trackExportCSV(indexName, finalObjects.length, 'byFilters');
      setLog(`${finalObjects.length} records successfully exported.`);
    } catch (err) {
      trackError('export_by_filters', err.message, 'export_error');
      setError('Error generating CSV file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Export Products by Filters"
        subtitle="Export data from your Algolia index with optional filters"
      />

      <InfoBlock title="About this feature" icon="📤">
        Export data from your Algolia index by selecting attributes and applying optional filters.
        This tool uses the <code>browseObjects</code> endpoint (not counted in your search quota).
        <br /><br />
        👉 Enable "Use Distinct" to only export unique products based on the index's configured <code>attributeForDistinct</code>.
      </InfoBlock>

      <SectionBlock title="Index Settings">
        <FormGroup>
          <Label>Index Name</Label>
          <AutocompleteContainer>
            <Input
              type="text"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder="Search for an index..."
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

        <ToggleContainer style={{ margin: '16px 0' }}>
          <ToggleLabel $active={!useDistinct}>All Records</ToggleLabel>
          <ToggleSwitch 
            $active={useDistinct} 
            onClick={() => setUseDistinct(!useDistinct)}
          >
            <ToggleThumb $active={useDistinct} />
          </ToggleSwitch>
          <ToggleLabel $active={useDistinct}>Use Distinct</ToggleLabel>
          {distinctAttribute && useDistinct && (
            <span style={{ marginLeft: '8px', fontSize: '13px', color: 'var(--gray-500)' }}>
              (on: {distinctAttribute})
            </span>
          )}
        </ToggleContainer>

        <StyledButton onClick={synchronizeDataModel} label="Sync Data Model" icon="🔄" variant="secondary" />
      </SectionBlock>

      {availableAttributes.length > 0 && (
        <>
          <SectionBlock title="Filters">
            {filters.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
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

          <SectionBlock title="Columns to Export">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attributes.map((attr, idx) => (
                <ColumnRow key={idx}>
                  <Select 
                    value={attr} 
                    onChange={(e) => handleAttributeChange(e.target.value, idx)}
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Select Attribute --</option>
                    {availableAttributes.map((a, i) => (<option key={i} value={a}>{a}</option>))}
                  </Select>
                  {idx === attributes.length - 1 ? (
                    <StyledButton onClick={handleAddAttribute} label="Add" icon="➕" variant="success" size="sm" />
                  ) : (
                    <StyledButton onClick={() => handleRemoveAttribute(idx)} label="Remove" icon="✖" variant="danger" size="sm" />
                  )}
                </ColumnRow>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Actions">
            <StyledButton onClick={handleGenerateFile} label="Generate CSV File" icon="📁" variant="primary" size="lg" />
          </SectionBlock>
        </>
      )}

      {error && <Hint className="error" style={{ marginTop: '20px' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px' }}>{log}</Hint>}
    </div>
  );
};

export default ExportDataByFilters;