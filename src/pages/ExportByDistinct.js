// src/pages/ExportData.js
import React, { useState } from 'react';
import { getApiKey } from '../services/sessionService';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';

const ExportData = () => {
  const [appId, setAppId] = useState('');
  const [indexName, setIndexName] = useState('');
  const [productCodes, setProductCodes] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [distinctAttribute, setDistinctAttribute] = useState('');
  const apiKey = getApiKey();

  const synchronizeDataModel = async () => {
    setLog('Fetching index settings...');
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
    } catch (err) {
      setError('Error during synchronization: ' + err.message);
    }
  };

  const handleGenerateFile = async () => {
    setLog('Generating CSV file...');
    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);

      const codes = productCodes
        .split('\n')
        .map(code => code.trim())
        .filter(code => code);

      const allObjects = [];
      await index.browseObjects({
        query: '',
        batch: (batch) => {
          allObjects.push(...batch);
        },
      });

      let filteredObjects = allObjects.filter(obj => codes.includes(obj[distinctAttribute]));

      const attributes = Object.keys(filteredObjects[0] || {});
      const csvRows = [attributes.join(';')];
      filteredObjects.forEach(obj => {
        const row = attributes.map(attr => JSON.stringify(obj[attr] || ''));
        csvRows.push(row.join(';'));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `algolia_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLog('CSV file successfully generated.');
    } catch (err) {
      setError('Error generating CSV file: ' + err.message);
    }
  };

  return (
    <div style={{ marginLeft: '260px', padding: '20px' }}>
      <h1>Export By Distinct Attribute</h1>

      <InfoBlock title="About this feature">
        This tool allows you to export records from an Algolia index by using the <code>attributeForDistinct</code> setting configured on your index.
        <br /><br />
        👉 After entering your <strong>App ID</strong> and <strong>Index Name</strong>, click on <strong>“Sync Data Model</strong> to automatically detect the distinct attribute used in your index configuration.
        <br /><br />
        ✅ Once the distinct attribute is retrieved, you can paste a list of product codes (one per line) corresponding to this attribute.
        <br /><br />
        📄 The export will include all matching records in CSV format using Algolia’s <code>browseObjects</code> method.
        <ul>
          <li>This method does not count towards your search operations quota</li>
          <li>It retrieves the full objects, so you get all available attributes</li>
        </ul>
      </InfoBlock>

      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>App ID:</label>
            <input type="text" value={appId} onChange={(e) => setAppId(e.target.value)} style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }} />
          </div>
          <div>
            <label>Index Name:</label>
            <input type="text" value={indexName} onChange={(e) => setIndexName(e.target.value)} style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }} />
          </div>
          <div>
            <StyledButton onClick={synchronizeDataModel} label="Sync Data Model" icon="🔄" color="#2c3e50" />
          </div>
        </div>
      </SectionBlock>

      {distinctAttribute && (
        <SectionBlock title="Export Products">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>Paste Product Codes ({distinctAttribute}):</label>
            <textarea
              rows={10}
              value={productCodes}
              onChange={(e) => setProductCodes(e.target.value)}
              placeholder="One code per line"
              style={{ width: '97%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <StyledButton onClick={handleGenerateFile} label="Export CSV" icon="📁" color="#8fbc8f" />
          </div>
        </SectionBlock>
      )}

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default ExportData;
