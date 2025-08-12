// src/pages/ExportByAttribute.js
import React, { useState } from 'react';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const textareaStyle = { width: '97%', padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' };

const ExportByAttribute = () => {
  const [indexName, setIndexName] = useState('');
  const [valuesToExport, setValuesToExport] = useState('');
  const [exportMode, setExportMode] = useState('byID'); // 'byID' ou 'byDistinct'
  const [distinctAttribute, setDistinctAttribute] = useState('');
  
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = getApiKey();
  const appId = getAppId();

  const handleSyncDistinctAttribute = async () => {
    if (!indexName) {
      setError("Please provide an index name first.");
      return;
    }
    setIsLoading(true);
    setError('');
    setLog(`Fetching settings for index '${indexName}'...`);
    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);
      const settings = await index.getSettings();
      if (settings.attributeForDistinct) {
        setDistinctAttribute(settings.attributeForDistinct);
        setLog(`✅ Distinct attribute found: ${settings.attributeForDistinct}`);
      } else {
        setDistinctAttribute('');
        setError(`Error: No 'attributeForDistinct' is configured for the index '${indexName}'.`);
      }
    } catch (err) {
      setError('Error during synchronization: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateCsv = (hits) => {
    if (hits.length === 0) {
      throw new Error('No matching records found to export.');
    }
    // Crée une liste de toutes les clés possibles à partir de tous les objets
    const allKeys = [...new Set(hits.flatMap(item => Object.keys(item)))];
    
    const csvRows = [allKeys.join(';')];
    hits.forEach(obj => {
      const row = allKeys.map(attr => {
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

    setLog('Generating CSV file...');
    setError('');
    setIsLoading(true);
    
    try {
      const values = valuesToExport.split(/[\s,;|\n]+/).filter(Boolean);
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);
      let hits = [];

      if (exportMode === 'byID') {
        const { results } = await index.getObjects(values);
        hits = results.filter(record => record !== null);
      } else { // exportMode === 'byDistinct'
        if (!distinctAttribute) {
          throw new Error("Please sync the distinct attribute before exporting.");
        }
        
        // Optimisation : on fait un browse par valeur, c'est plus efficace que de tout charger
        let allFoundObjects = [];
        for (const value of values) {
          const tempHits = [];
          await index.browseObjects({
            filters: `${distinctAttribute}:"${value}"`,
            batch: (batch) => {
              tempHits.push(...batch);
            }
          });
          allFoundObjects.push(...tempHits);
        }
        hits = allFoundObjects;
      }
      
      generateCsv(hits);
      setLog(`${hits.length} records successfully exported.`);
    } catch (err) {
      setError('Error generating CSV file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Styles pour le toggle
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
        Use this module to export records from an Algolia index using either their unique `objectID` or a shared `distinct` attribute value.
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
        <div>
          <label>Index Name:</label>
          <input type="text" value={indexName} onChange={(e) => setIndexName(e.target.value)} style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }} />
        </div>
        {exportMode === 'byDistinct' && (
          <div style={{marginTop: '15px'}}>
            <StyledButton onClick={handleSyncDistinctAttribute} label="Sync Distinct Attribute" icon="🔄" />
            {distinctAttribute && (
              <p style={{ marginLeft: '15px', fontStyle: 'italic', display: 'inline-block' }}>
                Detected Attribute: <strong>{distinctAttribute}</strong>
              </p>
            )}
          </div>
        )}
      </SectionBlock>

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