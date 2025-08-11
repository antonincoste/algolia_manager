import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
// MODIFIÉ : On importe aussi getAppId
import { getApiKey, getAppId } from '../services/sessionService';
import styled from 'styled-components';
import FullPageLoader from '../components/FullPageLoader';

const UpdateAttributes = () => {
  // SUPPRIMÉ : L'état local pour l'appId a été enlevé
  // const [appId, setAppId] = useState(''); 
  
  const [indexNames, setIndexNames] = useState('');
  const [parsing, setParsing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState(null);

  // AJOUTÉ : On récupère l'App ID et la clé API depuis le service
  const apiKey = getApiKey();
  const appId = getAppId(); 
  
  const fileInputRef = useRef(null);

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setLog('');
    setParsedData(null);
    setParsing(true);
    setLog('Parsing CSV...');

    const resetInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data;
          if (!data.every(row => row.objectID)) {
            throw new Error('All rows must include an objectID column.');
          }
          const normalizedData = data.map(row => (
            Object.fromEntries(
              Object.entries(row).map(([key, value]) => {
                if (value === null || value === undefined) return [key, null];
                const trimmedValue = String(value).trim();
                if (trimmedValue === '') return [key, null];
                if (trimmedValue.toLowerCase() === 'true') return [key, true];
                if (trimmedValue.toLowerCase() === 'false') return [key, false];
                if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
                  try { return [key, JSON.parse(trimmedValue)]; } catch { /* no-op */ }
                }
                if (!isNaN(Number(trimmedValue)) && trimmedValue !== '') return [key, Number(trimmedValue)];
                return [key, value];
              })
            )
          ));
          setParsedData(normalizedData);
          setLog(`${normalizedData.length} rows ready for preview.`);
        } catch (err) {
          setError(err.message);
        } finally {
          setParsing(false);
          resetInput();
        }
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message);
        setParsing(false);
        resetInput();
      },
    });
  };

  const handleConfirmImport = async () => {
    // AJOUTÉ : Vérification cruciale au début de l'action
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }

    if (!parsedData) return;
    setIsUpdating(true);
    setError('');
    setLog('Sending updates to Algolia...');

    try {
      const client = algoliasearch(appId, apiKey); // Utilise l'appId global
      const indexes = indexNames.split('\n').map(name => name.trim()).filter(Boolean);

      let totalUpdated = 0;
      for (const name of indexes) {
        const index = client.initIndex(name);
        const partialObjects = parsedData.map(row => {
          const { objectID, ...attributes } = row;
          return { objectID, ...attributes };
        });
        await index.partialUpdateObjects(partialObjects, { createIfNotExists: false });
        totalUpdated = partialObjects.length;
        setLog(prev => `${prev}\n✅ Index '${name}' processed.`);
      }
      setLog(`Update complete.\n${totalUpdated} objects processed for ${indexes.length} index(es).`);
      setParsedData(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadExample = () => {
    const example = 'objectID;price;online;tags\n1234;199.99;true;"["promotion","new"]"\n5678;79.5;false;"[]"';
    const blob = new Blob([example], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'example_update.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <FullPageLoader isLoading={isUpdating} />
      <h1>Update Product Attributes</h1>

      <InfoBlock title="How this works">
        Upload a CSV file to update attributes for products in your Algolia index.
        The file must contain an <code>objectID</code> column and one or more columns with values to update.
        Empty cells will be ignored. Updates are done via <code>partialUpdateObjects</code> to avoid overwriting other data.
        Only existing objects will be updated; any non-existent objectID will be ignored.
        <br/><br/>You can also specify multiple indexes: each one will receive the same updates.
      </InfoBlock>

      {/* MODIFIÉ : Le bloc de configuration est simplifié */}
      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SUPPRIMÉ : Le champ de saisie pour l'App ID a été retiré */}
          <div>
            <label>Index Names (one per line):</label>
            <textarea value={indexNames} onChange={(e) => setIndexNames(e.target.value)} rows={5} style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }} />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Upload CSV File">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <StyledWrapper>
            <button className="download-btn" onClick={handleDownloadExample}>
              <svg aria-hidden="true" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path strokeWidth={2} stroke="#ffffff" d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" strokeLinejoin="round" strokeLinecap="round" /><path strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#ffffff" d="M17 15V18M17 21V18M17 18H14M17 18H20" /></svg>
              Download Example
            </button>
            <label>
              <svg aria-hidden="true" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path strokeWidth={2} stroke="#ffffff" d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" strokeLinejoin="round" strokeLinecap="round" /><path strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#ffffff" d="M17 15V18M17 21V18M17 18H14M17 18H20" /></svg>
              Upload File
              <input type="file" onChange={handleCsvUpload} ref={fileInputRef} />
            </label>
          </StyledWrapper>
        </div>
        {parsing && <p style={{ marginTop: '10px' }}>⏳ Parsing file...</p>}
      </SectionBlock>

      {parsedData && (
        <SectionBlock title="Preview & Confirm">
          <p>{parsedData.length} rows ready to update. Below is a preview of the first 3 rows:</p>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(parsedData.slice(0, 3), null, 2)}
          </pre>
          <button onClick={handleConfirmImport} style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '4px', backgroundColor: '#28a745', color: '#fff', border: 'none' }}>✅ Confirm Update</button>
        </SectionBlock>
      )}

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  gap: 1rem;
  button, label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: sans-serif;
    padding: 0.75rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    border: none;
    border-radius: 0.5rem;
    color: white;
    cursor: pointer;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    &:hover {
      opacity: 0.85;
    }
    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
  .download-btn {
    background-color: #8fbc8f;
  }
  label {
    background-color: #488aec;
  }
  label input[type="file"] {
    display: none;
  }
`;

export default UpdateAttributes;