// src/pages/ExportByAttribute.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { 
  Input, 
  Select, 
  Textarea, 
  Label, 
  FormGroup,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  ToggleThumb,
  Hint,
  StatusBadge,
  StatusDot
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

const ColumnRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ExportByAttribute = () => {
  const [indexName, setIndexName] = useState('');
  const [valuesToExport, setValuesToExport] = useState('');
  const [exportMode, setExportMode] = useState('byID');
  const [distinctAttribute, setDistinctAttribute] = useState('');
  const [attributesToExport, setAttributesToExport] = useState(['']);
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
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

  const handleAddAttribute = () => {
    setAttributesToExport([...attributesToExport, '']);
  };

  const handleRemoveAttribute = (idxToRemove) => {
    setAttributesToExport(attributesToExport.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAttributeChange = (value, idx) => {
    const newAttributes = [...attributesToExport];
    newAttributes[idx] = value;
    setAttributesToExport(newAttributes);
  };

  const synchronizeIndexData = async () => {
    if (!indexName) {
      setError("Please provide an index name first.");
      return;
    }
    setIsLoading(true);
    setError('');
    let syncLog = `Syncing data for index '${indexName}'...\n`;
    setLog(syncLog);
    setDistinctAttribute('');
    setAvailableAttributes([]);

    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);
      
      const settings = await index.getSettings();
      if (settings.attributeForDistinct) {
        setDistinctAttribute(settings.attributeForDistinct);
        syncLog += `✅ Distinct attribute found: ${settings.attributeForDistinct}\n`;
      } else {
        syncLog += `ℹ️ No distinct attribute defined in index settings.\n`;
      }
      
      const response = await index.search('', { hitsPerPage: 10 });
      const attributeSet = new Set();
      response.hits.forEach(hit => {
        Object.keys(hit).forEach(key => attributeSet.add(key));
      });
      const sortedAttributes = [...attributeSet].sort((a, b) => a.localeCompare(b));
      setAvailableAttributes(sortedAttributes);
      syncLog += `✅ Found ${sortedAttributes.length} available attributes.\n`;
      setLog(syncLog);

    } catch (err) {
      setError('Error during synchronization: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateCsv = (hits, selectedAttributes) => {
    if (hits.length === 0) {
      throw new Error('No matching records found to export.');
    }

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) {
        return '';
      }

      let stringValue;
      
      if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = String(value);
      }

      stringValue = stringValue
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const needsQuotes = stringValue.includes(';') || stringValue.includes('"');

      if (needsQuotes) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    };

    const csvRows = [selectedAttributes.join(';')]; 
    
    hits.forEach(obj => {
      const row = selectedAttributes.map(attr => {
        return escapeCsvValue(obj[attr]);
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
  };

  const handleGenerateFile = async () => {
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }
    if (!indexName || !valuesToExport) {
      setError('Please provide an index name and a list of values to export.');
      return;
    }
    
    const selectedAttributes = attributesToExport.filter(attr => attr);
    const exportAll = selectedAttributes.length === 0;

    setLog('Generating CSV file...');
    setError('');
    setIsLoading(true);
    
    try {
      const values = valuesToExport.split(/[\s,;|\n]+/).filter(Boolean);
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);
      let hits = [];

      if (exportMode === 'byID') {
        const options = exportAll ? {} : { attributesToRetrieve: selectedAttributes };
        const { results } = await index.getObjects(values, options);
        hits = results.filter(record => record !== null);
      } else { 
        if (!distinctAttribute) {
          throw new Error("Please sync the index data before exporting in distinct mode.");
        }
        
        let allFoundObjects = [];
        for (const value of values) {
          const tempHits = [];
          const browseOptions = {
            filters: `${distinctAttribute}:"${value}"`,
            batch: (batch) => {
              tempHits.push(...batch);
            }
          };
          if (!exportAll) {
            browseOptions.attributesToRetrieve = selectedAttributes;
          }
          await index.browseObjects(browseOptions);
          allFoundObjects.push(...tempHits);
        }
        hits = allFoundObjects;
      }
      
      let finalColumns;
      if (exportAll && hits.length > 0) {
        const allKeys = new Set();
        hits.forEach(hit => Object.keys(hit).forEach(key => allKeys.add(key)));
        finalColumns = [...allKeys].sort();
      } else {
        finalColumns = selectedAttributes;
      }
      
      generateCsv(hits, finalColumns); 
      setLog(`${hits.length} records successfully exported with ${finalColumns.length} columns.`);
    } catch (err) {
      setError('Error generating CSV file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isDistinctMode = exportMode === 'byDistinct';

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Export by Attribute"
        subtitle="Export records using objectID or distinct attribute values"
      >
        {appId && apiKey && (
          <StatusBadge className="success">
            <StatusDot />
            Connected
          </StatusBadge>
        )}
      </PageHeader>

      <InfoBlock title="How this works">
        Use this module to export records from an Algolia index using either their unique <code>objectID</code> or a shared <code>distinct</code> attribute value. You can select which columns to include in the export, or leave empty to export all attributes.
      </InfoBlock>

      <SectionBlock title="Export Mode">
        <ToggleContainer>
          <ToggleLabel $active={!isDistinctMode}>By objectID</ToggleLabel>
          <ToggleSwitch 
            $active={isDistinctMode} 
            onClick={() => setExportMode(isDistinctMode ? 'byID' : 'byDistinct')}
          >
            <ToggleThumb $active={isDistinctMode} />
          </ToggleSwitch>
          <ToggleLabel $active={isDistinctMode}>By Distinct Attribute</ToggleLabel>
        </ToggleContainer>
      </SectionBlock>
      
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
        
        <div style={{ marginTop: '16px' }}>
          <StyledButton onClick={synchronizeIndexData} label="Sync Index Data" icon="🔄" variant="secondary" />
        </div>
        
        {isDistinctMode && distinctAttribute && (
          <Hint className="success" style={{ marginTop: '12px' }}>
            ✓ Distinct Attribute detected: <strong>{distinctAttribute}</strong>
          </Hint>
        )}
      </SectionBlock>
      
      {availableAttributes.length > 0 && (
        <SectionBlock title="Columns to Export (leave empty to export all)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attributesToExport.map((attr, idx) => (
              <ColumnRow key={idx}>
                <Select 
                  value={attr} 
                  onChange={(e) => handleAttributeChange(e.target.value, idx)}
                  style={{ flex: 1 }}
                >
                  <option value="">-- Select Attribute --</option>
                  {availableAttributes.map((a, i) => (
                    <option key={i} value={a}>{a}</option>
                  ))}
                </Select>
                {idx === attributesToExport.length - 1 ? (
                  <StyledButton onClick={handleAddAttribute} label="Add" icon="➕" variant="success" size="sm" />
                ) : (
                  <StyledButton onClick={() => handleRemoveAttribute(idx)} label="Remove" icon="✖" variant="danger" size="sm" />
                )}
              </ColumnRow>
            ))}
          </div>
        </SectionBlock>
      )}

      <SectionBlock title="Values to Export">
        <FormGroup>
          <Label>
            {exportMode === 'byID'
              ? "Paste objectIDs (separated by lines, commas, or spaces)"
              : "Paste Distinct Attribute Values"
            }
          </Label>
          <Textarea
            placeholder={exportMode === 'byID' ? "e.g., 12345, 67890" : "e.g., GROUP_A, GROUP_B"}
            value={valuesToExport}
            onChange={(e) => setValuesToExport(e.target.value)}
            rows={10}
          />
        </FormGroup>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleGenerateFile} label="Export CSV" icon="📁" variant="primary" size="lg" />
      </SectionBlock>

      {error && <Hint className="error" style={{ marginTop: '20px' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px' }}>{log}</Hint>}
    </div>
  );
};

export default ExportByAttribute;