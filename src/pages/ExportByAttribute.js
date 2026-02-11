// src/pages/ExportByAttribute.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const textareaStyle = { width: '100%', padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical', boxSizing: 'border-box' };
const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };

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
        syncLog += `  ✅ Distinct attribute found: ${settings.attributeForDistinct}\n`;
      } else {
        syncLog += `  ℹ️ No distinct attribute defined in index settings.\n`;
      }
      
      const response = await index.search('', { hitsPerPage: 10 });
      const attributeSet = new Set();
      response.hits.forEach(hit => {
        Object.keys(hit).forEach(key => attributeSet.add(key));
      });
      const sortedAttributes = [...attributeSet].sort((a, b) => a.localeCompare(b));
      setAvailableAttributes(sortedAttributes);
      syncLog += `  ✅ Found ${sortedAttributes.length} available attributes.\n`;
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
      
      // Étape 1 : Convertir les objets/tableaux en JSON string
      if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = String(value);
      }

      // Étape 2 : Remplacer les retours à la ligne et <br> par des espaces
      stringValue = stringValue
        .replace(/<br\s*\/?>/gi, ' ')  // <br>, <br/>, <br />
        .replace(/[\r\n]+/g, ' ')       // \r, \n, \r\n
        .replace(/\s+/g, ' ')           // Nettoyer les espaces multiples
        .trim();

      // Étape 3 : Vérifier si on doit ajouter des guillemets
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
    
    // Si aucun attribut sélectionné, on exporte tout (pas de filtre)
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
      
      // Déterminer les colonnes à exporter
      let finalColumns;
      if (exportAll && hits.length > 0) {
        // Récupérer tous les attributs de tous les hits
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
  
  const toggleContainerStyle = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' };
  const toggleStyle = {
    appearance: 'none', width: '50px', height: '25px', backgroundColor: '#ccc',
    borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s',
  };
  const activeToggleStyle = { ...toggleStyle, backgroundColor: '#28a745' };
  const toggleCircleStyle = {
    content: '', position: 'absolute', top: '2px', width: '21px', height: '21px',
    backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s',
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Export by Attribute</h1>
      <InfoBlock title="How this works">
        Use this module to export records from an Algolia index using either their unique `objectID` or a shared `distinct` attribute value. You can select which columns to include in the export, or leave empty to export all attributes.
      </InfoBlock>

      <SectionBlock title="Export Mode">
        <div style={toggleContainerStyle}>
          <span style={{ fontWeight: exportMode === 'byID' ? 'bold' : 'normal' }}>By objectID</span>
          <div style={exportMode === 'byDistinct' ? activeToggleStyle : toggleStyle} onClick={() => setExportMode(exportMode === 'byID' ? 'byDistinct' : 'byID')}>
            <div style={{ ...toggleCircleStyle, left: exportMode === 'byDistinct' ? '26px' : '2px' }}></div>
          </div>
          <span style={{ fontWeight: exportMode === 'byDistinct' ? 'bold' : 'normal' }}>By Distinct Attribute</span>
        </div>
      </SectionBlock>
      
      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label>Index Name:</label>
              <AutocompleteContainer>
                <input
                  type="text"
                  value={indexName}
                  onChange={(e) => setIndexName(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                  style={inputStyle}
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
            </div>
            <StyledButton onClick={synchronizeIndexData} label="Sync Index Data" icon="🔄" />
            {exportMode === 'byDistinct' && distinctAttribute && (
              <p style={{ fontStyle: 'italic', display: 'inline-block', marginLeft: '15px' }}>
                Detected Distinct Attribute: <strong>{distinctAttribute}</strong>
              </p>
            )}
        </div>
      </SectionBlock>
      
      {availableAttributes.length > 0 && (
        <SectionBlock title="Columns to Export (leave empty to export all)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attributesToExport.map((attr, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={attr} 
                  onChange={(e) => handleAttributeChange(e.target.value, idx)} 
                  style={{ width: '60%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- Select Attribute --</option>
                  {availableAttributes.map((a, i) => (<option key={i} value={a}>{a}</option>))}
                </select>
                {idx === attributesToExport.length - 1 ? (
                  <StyledButton onClick={handleAddAttribute} label="Add column" icon="➕" color="#1abc9c" />
                ) : (
                  <StyledButton onClick={() => handleRemoveAttribute(idx)} label="Remove column" icon="✖" color="#e74c3c" />
                )}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      <SectionBlock title="Values to Export">
        <label>
          {exportMode === 'byID'
            ? "Paste objectIDs (separated by lines, commas, or spaces):"
            : "Paste Distinct Attribute Values:"
          }
        </label>
        <textarea
          placeholder={exportMode === 'byID' ? "e.g., 12345, 67890" : `e.g., GROUP_A, GROUP_B`}
          value={valuesToExport}
          onChange={(e) => setValuesToExport(e.target.value)}
          rows={10}
          style={textareaStyle}
        />
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleGenerateFile} label="Export CSV" icon="📁" color="#28a745" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default ExportByAttribute;