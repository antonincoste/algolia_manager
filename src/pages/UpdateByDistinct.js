import React, { useRef, useState } from 'react';
// MODIFIÉ : On importe aussi getAppId
import { getApiKey, getAppId } from '../services/sessionService';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const BulkUpdateByDistinct = () => {
  // SUPPRIMÉ : L'état local pour l'appId a été enlevé
  // const [appId, setAppId] = useState('');
  
  const [indexNames, setIndexNames] = useState('');
  const [distinctAttr, setDistinctAttr] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [indexResults, setIndexResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // AJOUTÉ : On récupère l'App ID et la clé API depuis le service
  const apiKey = getApiKey();
  const appId = getAppId();

  const fileInputRef = useRef();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const rows = content.trim().split('\n').map(row => row.split(';'));
      setFileContent(rows);
      setPreviewRows(rows.slice(0, 6));
      setError('');
      setLog('');
      setIndexResults([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    };
    reader.readAsText(file);
  };

  const handleUpdate = async () => {
    // AJOUTÉ : Vérification cruciale au début de l'action
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }

    setError('');
    setLog('');
    setIndexResults([]);

    if (!indexNames.trim() || !distinctAttr || !fileContent || fileContent[0].length < 2) {
      setError('Please provide at least one Index Name, the Distinct Attribute, and a valid CSV file.');
      return;
    }

    setIsLoading(true);
    setLog('Updating objects...');

    try {
      const client = algoliasearch(appId, apiKey); // Utilise l'appId global
      const indexes = indexNames.split('\n').map(name => name.trim()).filter(name => name);
      const results = [];

      for (const indexName of indexes) {
        try {
          const index = client.initIndex(indexName);
          for (let i = 1; i < fileContent.length; i++) {
            const row = fileContent[i];
            const [distinctValue, ...rest] = row;
            const headers = fileContent[0];
            const updateFields = {};
            for (let j = 1; j < headers.length; j++) {
                const valueToParse = rest[j - 1] || 'null';
                try {
                    updateFields[headers[j]] = JSON.parse(valueToParse);
                } catch (e) {
                    updateFields[headers[j]] = valueToParse;
                }
            }

            const matchingObjectIDs = [];
            await index.browseObjects({
              query: '',
              filters: `${distinctAttr}:"${distinctValue}"`,
              attributesToRetrieve: ['objectID'],
              batch: (batch) => {
                matchingObjectIDs.push(...batch.map(obj => obj.objectID));
              }
            });

            if (matchingObjectIDs.length > 0) {
                const updates = matchingObjectIDs.map(objectID => ({ objectID, ...updateFields }));
                await index.partialUpdateObjects(updates);
            }
          }
          results.push({ indexName, status: 'success' });
        } catch (err) {
          results.push({ indexName, status: 'error', message: err.message });
        }
      }

      setIndexResults(results);
      setLog('All updates completed.');
    } catch (err) {
      setError('Unexpected error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadExample = () => {
    const exampleCsv = 'distinctAttribute;productName;productColor;price\n553770WHFBU9042;"Amazing Shoes";"Red";120.50';
    const blob = new Blob([exampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'example_bulk_update.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Bulk Update by Distinct Attribute</h1>

      <InfoBlock title="About this feature">
        This module allows you to update all records that share the same <code>distinct</code> value by importing a CSV file.
        <br /><br />
        📄 The CSV should contain one line per distinct value, with the first column matching your distinct attribute, and the other columns for fields to update. The first row must be the headers.
        <br /><br />
        🗁 The system will fetch all matching <code>objectIDs</code> and update them using <code>partialUpdateObjects</code>.
      </InfoBlock>

      {/* MODIFIÉ : Le bloc de configuration est simplifié */}
      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SUPPRIMÉ : Le champ de saisie pour l'App ID a été retiré */}
          <div>
            <label>Index Name(s):</label>
            <textarea value={indexNames} onChange={(e) => setIndexNames(e.target.value)} rows={4} placeholder="One index name per line" style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px', resize: 'vertical' }} />
          </div>
          <div>
            <label>Distinct Attribute:</label>
            <input type="text" value={distinctAttr} onChange={(e) => setDistinctAttr(e.target.value)} style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }} />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Upload CSV File">
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <StyledButton label="Download Example CSV" onClick={handleDownloadExample} color="#8fbc8f" />
          <StyledButton label="Upload File" color="#488aec" onClick={() => fileInputRef.current?.click()} />
        </div>

        {previewRows.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <strong>Preview of uploaded file:</strong>
            <table style={{ marginTop: '10px', borderCollapse: 'collapse' }}>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionBlock>

      {fileContent && (
        <SectionBlock title="Actions">
          <StyledButton label="✅ Apply Updates" onClick={handleUpdate} color="#28a745" />
        </SectionBlock>
      )}

      {indexResults.length > 0 && (
        <SectionBlock title="Results">
          <ul>
            {indexResults.map((res, idx) => (
              <li key={idx} style={{ color: res.status === 'success' ? 'green' : 'red' }}>
                {res.status === 'success' ? `✅ ${res.indexName} updated successfully` : `❌ ${res.indexName} failed: ${res.message}`}
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default BulkUpdateByDistinct;