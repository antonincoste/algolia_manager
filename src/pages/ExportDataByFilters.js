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
  const [attributes, setAttributes] = useState(['objectID']);
  const [filters, setFilters] = useState([]);
  const [newFilter, setNewFilter] = useState({ attribute: '', value: '' });
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [useDistinct, setUseDistinct] = useState(false);
  const [distinctAttribute, setDistinctAttribute] = useState('');
  const apiKey = getApiKey();

  const clearStatus = () => {
    setError('');
    setLog('');
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, '']);
  };

  const handleRemoveAttribute = (idxToRemove) => {
    setAttributes(attributes.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAttributeChange = (value, idx) => {
    const newAttributes = [...attributes];
    newAttributes[idx] = value;
    setAttributes(newAttributes);
  };

  const handleAddFilter = () => {
    if (newFilter.attribute && newFilter.value) {
      setFilters([...filters, newFilter]);
      setNewFilter({ attribute: '', value: '' });
    }
  };

  const removeFilter = (idxToRemove) => {
    const newFilters = filters.filter((_, idx) => idx !== idxToRemove);
    setFilters(newFilters);
  };

  const synchronizeDataModel = async () => {
    clearStatus();
    setLog('Synchronizing data model...');
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
      const response = await index.search('', { hitsPerPage: 100 });
      const attributeSet = new Set();
      response.hits.forEach(hit => {
        Object.keys(hit).forEach(key => attributeSet.add(key));
      });
      const sortedAttributes = [...attributeSet].sort((a, b) => a.localeCompare(b));
      setAvailableAttributes(sortedAttributes);
    } catch (err) {
      setError('Error during synchronization: ' + err.message);
    }
  };

  const buildFilterString = () => {
    return filters
      .filter(f => f.attribute && f.value)
      .map(f => `${f.attribute}:${f.value}`)
      .join(' AND ');
  };

  const handleGenerateFile = async () => {
    clearStatus();
    setLog('Generating CSV file...');
    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);

      const filteredAttributes = attributes.filter(attr => attr);
      const allObjects = [];
      await index.browseObjects({
        query: '',
        filters: buildFilterString(),
        attributesToRetrieve: filteredAttributes,
        distinct: useDistinct ? 1 : 0,
        batch: (batch) => {
          allObjects.push(...batch);
        },
      });

      let finalObjects = allObjects;
      if (useDistinct && distinctAttribute) {
        const seen = new Set();
        finalObjects = allObjects.filter(obj => {
          const key = obj[distinctAttribute];
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      const csvRows = [filteredAttributes.join(';')];
      finalObjects.forEach(obj => {
        const row = filteredAttributes.map(attr => JSON.stringify(obj[attr] || ''));
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

  const toggleStyle = {
    appearance: 'none',
    width: '50px',
    height: '25px',
    backgroundColor: useDistinct ? '#1abc9c' : '#ccc',
    borderRadius: '15px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const toggleCircleStyle = {
    content: '',
    position: 'absolute',
    top: '2px',
    left: useDistinct ? '26px' : '2px',
    width: '21px',
    height: '21px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'left 0.2s',
  };

  return (
    <div style={{ marginLeft: '260px', padding: '20px' }}>
      <h1>Export Products by filters</h1>

      <InfoBlock title="About this feature">
        Export data from your Algolia index by selecting attributes and applying optional filters.
        This tool uses the <code>browseObjects</code> endpoint (not counted in your search quota).
        <br /><br />
        👉 Enable "Use Distinct" to only export unique products based on the index’s configured <code>attributeForDistinct</code>.
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label>Use Distinct:</label>
            <div style={toggleStyle} onClick={() => setUseDistinct(!useDistinct)}>
              <div style={toggleCircleStyle}></div>
            </div>
            {distinctAttribute && useDistinct && <span>({distinctAttribute})</span>}
          </div>
          <div>
            <StyledButton onClick={synchronizeDataModel} label="Sync Data Model" icon="🔄" />
          </div>
        </div>
      </SectionBlock>

      {availableAttributes.length > 0 && (
        <>
          <SectionBlock title="Filters">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
              {filters.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: '20px', padding: '6px 12px' }}>
                  <span>{f.attribute}: {f.value}</span>
                  <button onClick={() => removeFilter(idx)} style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>✖</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
              <select onChange={(e) => setNewFilter({ ...newFilter, attribute: e.target.value })} value={newFilter.attribute} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}>
                <option value="">-- Attribute --</option>
                {availableAttributes.map((a, i) => (<option key={i} value={a}>{a}</option>))}
              </select>
              <input type="text" placeholder="Value" value={newFilter.value} onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })} style={{ padding: '10px', width: '160px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <StyledButton onClick={handleAddFilter} label="Add Filter" icon="➕" color="#1abc9c" />
            </div>
          </SectionBlock>

          <SectionBlock title="Columns to Export">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attributes.map((attr, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select value={attr} onChange={(e) => handleAttributeChange(e.target.value, idx)} style={{ width: '60%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">-- Select Attribute --</option>
                    {availableAttributes.map((a, i) => (<option key={i} value={a}>{a}</option>))}
                  </select>
                  {idx === attributes.length - 1 ? (
                    <StyledButton onClick={handleAddAttribute} label="Add column" icon="➕" color="#1abc9c" />
                  ) : (
                    <StyledButton onClick={() => handleRemoveAttribute(idx)} label="Remove column" icon="✖" color="#e74c3c" />
                  )}
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Actions">
            <StyledButton onClick={handleGenerateFile} label="Generate CSV File" icon="📁" color="#8fbc8f" />
          </SectionBlock>
        </>
      )}

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default ExportData;
