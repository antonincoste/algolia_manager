// src/pages/UpdateByAttribute.js
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import { trackBulkUpdate, trackError } from '../services/analyticsService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { 
  Textarea, 
  Label, 
  FormGroup, 
  Hint,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  ToggleThumb
} from '../components/FormElements';

const PreviewTable = styled.table`
  margin-top: 16px;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  display: block;

  td {
    border: 1px solid var(--gray-200);
    padding: 8px 12px;
    font-size: 13px;
    color: var(--gray-700);
    white-space: nowrap;
  }

  tr:first-child td {
    background-color: var(--gray-100);
    font-weight: 600;
    color: var(--gray-900);
  }
`;

const ResultList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 8px 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const UpdateByAttribute = () => {
  const [indexNames, setIndexNames] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [updateMode, setUpdateMode] = useState('byID');
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
      let fetchedDistinctAttr = '';

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

          } else {
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
      const successCount = results.filter(r => r.status === 'success').length;
      if (successCount > 0) {
        trackBulkUpdate(indexes.length, fileContent.length - 1, updateMode);
      }
    } catch (err) {
      trackError('bulk_update', err.message, 'update_error');
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isDistinctMode = updateMode === 'byDistinct';

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Update by Attribute"
        subtitle="Bulk update records using a CSV file"
      />

      <InfoBlock title="How this works" icon="✏️">
        Use this module to update records by uploading a CSV. Switch between updating by unique <code>objectID</code> or by a shared <code>distinct</code> attribute value. In "distinct" mode, the tool automatically detects the correct attribute from your index settings.
      </InfoBlock>
      
      <SectionBlock title="Update Mode">
        <ToggleContainer>
          <ToggleLabel $active={!isDistinctMode}>By objectID</ToggleLabel>
          <ToggleSwitch 
            $active={isDistinctMode} 
            onClick={() => setUpdateMode(isDistinctMode ? 'byID' : 'byDistinct')}
          >
            <ToggleThumb $active={isDistinctMode} />
          </ToggleSwitch>
          <ToggleLabel $active={isDistinctMode}>By Distinct Attribute</ToggleLabel>
        </ToggleContainer>
      </SectionBlock>

      <SectionBlock title="Index Settings">
        <FormGroup>
          <Label>Index Name(s)</Label>
          <Textarea 
            value={indexNames} 
            onChange={(e) => setIndexNames(e.target.value)} 
            rows={4} 
            placeholder="One index name per line"
          />
        </FormGroup>
      </SectionBlock>

      <SectionBlock title="Upload CSV File">
        <ButtonGroup>
          <StyledButton label="Download Example CSV" onClick={handleDownloadExample} variant="secondary" />
          <StyledButton label="Upload File" variant="primary" onClick={() => fileInputRef.current?.click()} />
        </ButtonGroup>
        <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} />
        
        {previewRows.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <Label>Preview of uploaded file:</Label>
            <PreviewTable>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </PreviewTable>
          </div>
        )}
      </SectionBlock>

      {fileContent && (
        <SectionBlock title="Actions">
          <StyledButton 
            label="✅ Apply Updates" 
            onClick={handleUpdate} 
            variant="primary"
            size="lg"
          />
        </SectionBlock>
      )}

      {indexResults.length > 0 && (
        <SectionBlock title="Results">
          <ResultList>
            {indexResults.map((res, idx) => (
              <li key={idx} style={{ color: res.status === 'success' ? 'var(--success-500)' : 'var(--danger-500)' }}>
                {res.status === 'success' ? `✅ ${res.indexName} updated successfully` : `❌ ${res.indexName} failed: ${res.message}`}
              </li>
            ))}
          </ResultList>
        </SectionBlock>
      )}

      {error && <Hint className="error" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</Hint>}
    </div>
  );
};

export default UpdateByAttribute;