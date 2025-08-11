// src/pages/CopyData.js
import React, { useState } from 'react';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const inputStyle = { width: '75%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' };

const CopyData = () => {
  const [sourceIndex, setSourceIndex] = useState('');
  const [targetIndexes, setTargetIndexes] = useState('');
  const [copyToDifferentApp, setCopyToDifferentApp] = useState(false);
  const [destAppId, setDestAppId] = useState('');
  const [destApiKey, setDestApiKey] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useFilters, setUseFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({ attribute: '', value: '' });
  const [availableAttributes, setAvailableAttributes] = useState([]);

  const globalAppId = getAppId();
  const globalApiKey = getApiKey();

  const handleFetchAttributes = async () => {
    if (!sourceIndex) {
      setError('Please provide a source index first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setLog('Fetching attributes from source index...');
    try {
      const client = algoliasearch(globalAppId, globalApiKey);
      const index = client.initIndex(sourceIndex);
      const response = await index.search('', { hitsPerPage: 10 });
      const attributeSet = new Set();
      response.hits.forEach(hit => {
        Object.keys(hit).forEach(key => attributeSet.add(key));
      });
      const sortedAttributes = [...attributeSet].sort((a, b) => a.localeCompare(b));
      setAvailableAttributes(sortedAttributes);
      setLog(`Found ${sortedAttributes.length} attributes. You can now build your filters.`);
    } catch (err) {
      setError('Error fetching attributes: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFilter = () => {
    if (newFilter.attribute && newFilter.value) {
      setFilters([...filters, newFilter]);
      setNewFilter({ attribute: '', value: '' });
    }
  };

  const removeFilter = (idxToRemove) => {
    setFilters(filters.filter((_, idx) => idx !== idxToRemove));
  };

  const buildFilterString = () => {
    if (!useFilters || filters.length === 0) return '';
    return filters
      .map(f => `${f.attribute}:"${f.value.replace(/"/g, '\\"')}"`)
      .join(' AND ');
  };

  const handleCopy = async () => {
    if (!sourceIndex || !targetIndexes) {
      setError('Please provide a source index and at least one target index.');
      return;
    }
    if (copyToDifferentApp && (!destAppId || !destApiKey)) {
      setError('Please provide the destination App ID and Admin API Key.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLog('Starting copy process...');

    try {
      const sourceClient = algoliasearch(globalAppId, globalApiKey);
      const sourceIndexClient = sourceClient.initIndex(sourceIndex);
      const destClient = copyToDifferentApp
        ? algoliasearch(destAppId, destApiKey)
        : sourceClient;
      
      const filterString = buildFilterString();
      setLog(`Fetching objects from source index with filters: ${filterString || 'None'}...`);

      const objectsToCopy = [];
      await sourceIndexClient.browseObjects({
        filters: filterString,
        batch: (batch) => {
          objectsToCopy.push(...batch);
        },
      });

      if (objectsToCopy.length === 0) {
        setLog('Warning: 0 objects found with the specified filters. Nothing to copy.');
        setIsLoading(false);
        return;
      }
      
      setLog(`${objectsToCopy.length} objects found. Starting copy to target(s)...`);

      const targets = targetIndexes.split(/[\s,;|\n]+/).filter(Boolean);
      for (const targetName of targets) {
        setLog(`Copying to index: ${targetName}...`);
        const targetIndexClient = destClient.initIndex(targetName);
        await targetIndexClient.saveObjects(objectsToCopy);
        setLog(`✅ Successfully copied ${objectsToCopy.length} objects to ${targetName}.`);
      }

      setLog(prev => `${prev}\n\nAll operations completed successfully!`);
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Copy Data Between Indexes</h1>

      <InfoBlock title="About this feature">
        This tool allows you to copy data from a source index to one or more target indexes.
        <br /><br />
        You can copy data within the same application or to a different one by providing separate credentials.
        <br /><br />
        ⚠️ <b>Warning:</b> This will overwrite any existing objects in the target index(es) that have the same `objectID`.
      </InfoBlock>

      <SectionBlock title="Configuration">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Source Index:</label>
            <input type="text" value={sourceIndex} onChange={(e) => setSourceIndex(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Target Index(es) (separated by space, comma, or new line):</label>
            <textarea value={targetIndexes} onChange={(e) => setTargetIndexes(e.target.value)} rows={3} style={{...inputStyle, resize: 'vertical'}} />
          </div>

          <div style={checkboxLabelStyle}>
            <input 
              type="checkbox" 
              id="filter-checkbox"
              checked={useFilters} 
              onChange={(e) => setUseFilters(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="filter-checkbox">Want to copy only specific products?</label>
          </div>

          <div style={checkboxLabelStyle}>
            <input 
              type="checkbox" 
              id="diff-app-checkbox"
              checked={copyToDifferentApp} 
              onChange={(e) => setCopyToDifferentApp(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="diff-app-checkbox">Want to copy to a different application?</label>
          </div>
          
          {/* RESTAURÉ : Le bloc complet pour les identifiants de destination */}
          {copyToDifferentApp && (
            <div style={{ border: '1px solid #ddd', padding: '0px 20px 20px 20px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <h4>Destination Credentials</h4>
              <div>
                <label>Destination App ID:</label>
                <input type="text" value={destAppId} onChange={(e) => setDestAppId(e.target.value)} style={inputStyle} />
              </div>
              <div style={{marginTop: '15px'}}>
                <label>Destination API Key:</label>
                <input type="password" value={destApiKey} onChange={(e) => setDestApiKey(e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}
        </div>
      </SectionBlock>

      {useFilters && (
        <SectionBlock title="Filters">
          <StyledButton onClick={handleFetchAttributes} label="Fetch Attributes from Source Index" icon="🔄" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '15px 0' }}>
            {filters.map((f, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: '20px', padding: '6px 12px' }}>
                <span>{f.attribute}: {f.value}</span>
                <button onClick={() => removeFilter(idx)} style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>✖</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
            <select 
              onChange={(e) => setNewFilter({ ...newFilter, attribute: e.target.value })} 
              value={newFilter.attribute} 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
              disabled={availableAttributes.length === 0}
            >
              <option value="">-- Attribute --</option>
              {availableAttributes.map((a, i) => (<option key={i} value={a}>{a}</option>))}
            </select>
            <input 
              type="text" 
              placeholder="Value" 
              value={newFilter.value} 
              onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })} 
              style={{ padding: '10px', width: '160px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
            <StyledButton onClick={handleAddFilter} label="Add Filter" icon="➕" color="#1abc9c" />
          </div>
        </SectionBlock>
      )}

      <SectionBlock title="Actions">
        <StyledButton onClick={handleCopy} label="Start Copy" icon="🚀" color="#28a745" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

export default CopyData;