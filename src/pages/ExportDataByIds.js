// src/pages/ExportByID.js
import React, { useState } from 'react';
import { algoliasearch } from 'algoliasearch';
import { getApiKey } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';

const ExportByID = () => {
  const [appId, setAppId] = useState('');
  const [indexName, setIndexName] = useState('');
  const [objectIds, setObjectIds] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const apiKey = getApiKey();

  const handleGenerateFile = async () => {
    setLog('Generating CSV file...');
    try {
      const ids = objectIds
        .split(/\s|,|;/)
        .map(id => id.trim())
        .filter(id => id);

      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);

      const hits = [];
      for (const objectID of ids) {
        try {
          const record = await index.getObject(objectID);
          hits.push(record);
        } catch (err) {
          console.warn(`ObjectID ${objectID} not found.`);
        }
      }

      const allKeys = Array.from(
        hits.reduce((set, item) => {
          Object.keys(item).forEach(k => set.add(k));
          return set;
        }, new Set())
      );

      const csvRows = [allKeys.join(';')];
      hits.forEach(obj => {
        const row = allKeys.map(attr => JSON.stringify(obj[attr] || ''));
        csvRows.push(row.join(';'));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `algolia_export_by_id_${Date.now()}.csv`);
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
      <h1>Export Products by ID</h1>

      <InfoBlock title="How this works">
      Use this module to export products from an Algolia index using their unique <code>objectID</code>.
      <br /><br />
      📝 Paste your list of <strong>objectIDs</strong> in the text area — one per line or separated by commas.
      <br /><br />
      🔍 The tool will fetch all matching records from the index and include every attribute available on each object.
      <br /><br />
      📁 Once ready, click "Export CSV" to download your results.
    </InfoBlock>

      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>App ID:</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }}
            />
          </div>
          <div>
            <label>Index Name:</label>
            <input
              type="text"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }}
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Product IDs">
        <textarea
          placeholder="Paste objectIDs here..."
          value={objectIds}
          onChange={(e) => setObjectIds(e.target.value)}
          rows={10}
          style={{ width: '97%', padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleGenerateFile} label="Generate CSV File" icon="📁" color="#8fbc8f" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default ExportByID;
