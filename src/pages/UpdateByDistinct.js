// src/pages/BulkUpdateByDistinct.js
import React, { useRef, useState } from 'react';
import { getApiKey, getAppId } from '../services/sessionService';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const BulkUpdateByDistinct = () => {
  const [indexNames, setIndexNames] = useState('');
  const [distinctAttr, setDistinctAttr] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [indexResults, setIndexResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = getApiKey();
  const appId = getAppId();

  const fileInputRef = useRef();

  const fetchDistinctAttribute = async () => {
    const firstIndex = indexNames.split(/[\s,;|\n]+/)[0];
    if (!firstIndex) {
      setError("Please enter at least one index name first.");
      return;
    }
    
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLog(`Fetching settings for index '${firstIndex}'...`);

    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(firstIndex);
      const settings = await index.getSettings();
      
      if (settings.attributeForDistinct) {
        setDistinctAttr(settings.attributeForDistinct);
        setLog(`✅ Distinct attribute found: ${settings.attributeForDistinct}`);
      } else {
        setDistinctAttr('');
        setError(`Error: No 'attributeForDistinct' is configured for the index '${firstIndex}'.`);
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }

    if (!distinctAttr || !indexNames.trim() || !fileContent) {
      setError('Please ensure the distinct attribute has been fetched and a file is uploaded.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    let fullLog = 'Starting update process...\n';
    setLog(fullLog);

    try {
      const client = algoliasearch(appId, apiKey);
      const indexes = indexNames.split(/[\s,;|\n]+/).filter(Boolean);
      const results = [];

      for (const indexName of indexes) {
        fullLog += `\nProcessing index: ${indexName}...\n`;
        setLog(fullLog);
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
          fullLog += `  ✅ Success: Index '${indexName}' updated.\n`;
          setLog(fullLog);
        } catch (err) {
          results.push({ indexName, status: 'error', message: err.message });
          fullLog += `  ❌ Error processing index '${indexName}': ${err.message}\n`;
          setLog(fullLog);
        }
      }

      setIndexResults(results);
      setLog(fullLog + '\nAll operations completed.');
    } catch (err) {
      setError('Unexpected error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadExample = () => {
    const exampleCsv = 'distinct_value;productName;price\nGROUP123;"New Shoes";129.99';
    const blob = new Blob([exampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'example_update_by_distinct.csv');
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
        👉 Enter the <strong>Index Name(s)</strong> and click "Fetch Distinct Attribute". The tool will automatically detect the attribute used for distinct grouping from your index configuration.
        <br /><br />
        📄 The CSV should contain one line per distinct value, with the first column matching the detected distinct attribute.
      </InfoBlock>
      
      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>Index Name(s):</label>
            <textarea value={indexNames} onChange={(e) => setIndexNames(e.target.value)} rows={4} placeholder="One index name per line" style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px', resize: 'vertical' }} />
          </div>
          
          <div>
            <StyledButton onClick={fetchDistinctAttribute} label="Fetch Distinct Attribute" icon="🔄" />
            {distinctAttr && (
              <p style={{ marginLeft: '15px', fontStyle: 'italic', display: 'inline-block' }}>
                Detected Attribute: <strong>{distinctAttr}</strong>
              </p>
            )}
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
          <StyledButton 
            label="✅ Apply Updates" 
            onClick={handleUpdate} 
            color="#28a745"
            disabled={!distinctAttr}
            title={!distinctAttr ? "Please fetch the distinct attribute first" : "Apply updates to your indexes"}
          />
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
      {log && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

export default BulkUpdateByDistinct;