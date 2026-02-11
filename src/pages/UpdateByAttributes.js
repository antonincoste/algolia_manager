// src/pages/UpdateByAttribute.js
import React, { useRef, useState } from 'react';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const textareaStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' };

const UpdateByAttribute = () => {
  const [indexNames, setIndexNames] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [updateMode, setUpdateMode] = useState('byID'); // 'byID' ou 'byDistinct'
  const [distinctAttr] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [indexResults, setIndexResults] = useState([]);

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
      setError(''); setLog(''); setIndexResults([]);
      if (fileInputRef.current) fileInputRef.current.value = null;
    };
    reader.readAsText(file);
  };

  const handleDownloadExample = () => {
    const isByIdMode = updateMode === 'byID';
    const header = isByIdMode ? 'objectID;price;in_stock' : 'distinct_value;price;in_stock';
    const row = isByIdMode ? '12345;99.99;true' : 'GROUP_XYZ;129.99;false';
    const exampleCsv = `${header}\n${row}`;
    const filename = isByIdMode ? 'example_update_by_id.csv' : 'example_update_by_distinct.csv';
    
    const blob = new Blob([exampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdate = async () => {
    if (!appId || !apiKey) {
      setError('Error: Credentials are missing.');
      return;
    }
    if (!indexNames.trim() || !fileContent) {
      setError('Please provide index names and upload a file.');
      return;
    }

    setIsLoading(true);
    setError('');
    let fullLog = 'Starting update process...\n';
    setLog(fullLog);
    setIndexResults([]);

    const results = [];

    try {
      const client = algoliasearch(appId, apiKey);
      const indexes = indexNames.split(/[\s,;|\n]+/).filter(Boolean);
      const headers = fileContent[0];
      let fetchedDistinctAttr = distinctAttr;

      if (updateMode === 'byDistinct') {
        const firstIndexName = indexes[0];
        fullLog += `Mode "By Distinct" activated. Fetching settings for index '${firstIndexName}'...\n`;
        setLog(fullLog);
        
        const indexForSettings = client.initIndex(firstIndexName);
        const settings = await indexForSettings.getSettings();
        
        if (settings.attributeForDistinct) {
          fetchedDistinctAttr = settings.attributeForDistinct;
          fullLog += `  ✅ Distinct attribute found: ${fetchedDistinctAttr}\n`;
          setLog(fullLog);
        } else {
          throw new Error(`No 'attributeForDistinct' is configured for the index '${firstIndexName}'.`);
        }
      }

      for (const indexName of indexes) {
        fullLog += `\nProcessing index: ${indexName}...\n`;
        setLog(fullLog);
        const index = client.initIndex(indexName);
        
        try {
          if (updateMode === 'byID') {
            const updates = fileContent.slice(1).map(row => {
                const object = { objectID: row[0] };
                headers.slice(1).forEach((header, i) => {
                    const value = row[i + 1];
                    try { object[header] = JSON.parse(value); }
                    catch { object[header] = value; }
                });
                return object;
            });
            await index.partialUpdateObjects(updates, { createIfNotExists: false });

          } else { // updateMode === 'byDistinct'
            for (let i = 1; i < fileContent.length; i++) {
              const row = fileContent[i];
              const [distinctValue, ...rest] = row;
              const updateFields = {};
              headers.slice(1).forEach((header, j) => {
                const value = rest[j];
                try { updateFields[header] = JSON.parse(value); }
                catch { updateFields[header] = value; }
              });

              const matchingObjectIDs = [];
              await index.browseObjects({
                filters: `${fetchedDistinctAttr}:"${distinctValue}"`,
                attributesToRetrieve: ['objectID'],
                batch: batch => matchingObjectIDs.push(...batch.map(obj => obj.objectID)),
              });

              if (matchingObjectIDs.length > 0) {
                const updates = matchingObjectIDs.map(objectID => ({ objectID, ...updateFields }));
                await index.partialUpdateObjects(updates);
              }
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
    } catch (err) {
      setError(`An unexpected error occurred: ${err.message}`);
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
      <h1>Update by Attribute</h1>
      <InfoBlock title="How this works">
        Use this module to update records by uploading a CSV. Switch between updating by unique `objectID` or by a shared `distinct` attribute value. In "distinct" mode, the tool automatically detects the correct attribute from your index settings.
      </InfoBlock>
      
      <SectionBlock title="Update Mode">
        <div style={toggleContainerStyle}>
          <span style={{ fontWeight: updateMode === 'byID' ? 'bold' : 'normal' }}>By objectID</span>
          <div style={updateMode === 'byDistinct' ? activeToggleStyle : toggleStyle} onClick={() => setUpdateMode(updateMode === 'byID' ? 'byDistinct' : 'byID')}>
            <div style={{ ...toggleCircleStyle, left: updateMode === 'byDistinct' ? '26px' : '2px' }}></div>
          </div>
          <span style={{ fontWeight: updateMode === 'byDistinct' ? 'bold' : 'normal' }}>By Distinct Attribute</span>
        </div>
      </SectionBlock>

      <SectionBlock title="Index Settings">
        <div>
          <label>Index Name(s):</label>
          <textarea 
            value={indexNames} 
            onChange={(e) => setIndexNames(e.target.value)} 
            rows={4} 
            placeholder="One index name per line" 
            style={textareaStyle} 
          />
        </div>
      </SectionBlock>

      <SectionBlock title="Upload CSV File">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <StyledButton label="Download Example CSV" onClick={handleDownloadExample} color="#8fbc8f" />
          <StyledButton label="Upload File" color="#488aec" onClick={() => fileInputRef.current?.click()} />
        </div>
        <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} />
        
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

      {error && <div style={{ color: 'red', marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

export default UpdateByAttribute;