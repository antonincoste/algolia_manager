// src/pages/CompareIndexesConfig.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const buttonGroupStyle = {
  display: 'flex',
  gap: '15px',
  flexWrap: 'wrap',
};

const IndexSelectorContainer = styled.div`
  position: relative;
  width: 100%;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  min-height: 38px;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  background-color: #e0e0e0;
  border-radius: 16px;
  padding: 5px 12px;
  font-size: 14px;

  button {
    background: none;
    border: none;
    margin-left: 8px;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    line-height: 1;
  }
`;

const AutocompleteInput = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 16px;
  box-sizing: border-box;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const ComparisonTableStyled = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 14px;

  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }

  td {
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const DiffCell = styled.td`
  background-color: ${props => {
    if (props.isAdded) return 'rgba(40, 167, 69, 0.15)'; // Vert
    if (props.isRemoved) return 'rgba(220, 53, 69, 0.15)'; // Rouge
    return 'transparent';
  }};
`;

const formatAttributeName = (attr) => {
  if (typeof attr !== 'string') return attr;
  const match = attr.match(/^unordered\((.*)\)$/);
  if (match && match[1]) {
    return `${match[1]} - Unordered`;
  }
  return attr;
};

const ComparisonTable = ({ selectedIndexes, configs, comparisonType, showOnlyDiff }) => {
  if (!configs || selectedIndexes.length < 2) return null;

  const baseIndexName = selectedIndexes[0];
  const baseConfig = configs[baseIndexName] || [];

  const allValuesSet = new Set();
  selectedIndexes.forEach(indexName => {
    const config = configs[indexName] || [];
    config.forEach(item => {
      const value = comparisonType === 'rules' ? item.objectID : item;
      allValuesSet.add(value);
    });
  });

  const sortedRows = [...allValuesSet].sort((a, b) =>
    formatAttributeName(String(a)).localeCompare(formatAttributeName(String(b)))
  );
  
  const filteredRows = showOnlyDiff
    ? sortedRows.filter(rowValue => {
        const itemInBase = baseConfig.find(item => (comparisonType === 'rules' ? item.objectID : item) === rowValue);
        const hasDiff = selectedIndexes.slice(1).some(indexName => {
          const currentConfig = configs[indexName] || [];
          const itemInCurrent = currentConfig.find(item => (comparisonType === 'rules' ? item.objectID : item) === rowValue);
          return !!itemInBase !== !!itemInCurrent;
        });
        return hasDiff;
      })
    : sortedRows;

  const renderValue = (item) => {
    if (comparisonType === 'rules') {
      const id = `objectID: ${item.objectID}`;
      const enabledStatus = `enabled: ${item.enabled}`;
      const conditionFilters = (item.conditions || [])
        .map(c => c.filters)
        .filter(Boolean)
        .join('\n  ');
      const filtersDisplay = `conditions.filters:\n  ${conditionFilters || '(none)'}`;
      return `${id}\n${enabledStatus}\n${filtersDisplay}`;
    }
    if (comparisonType === 'searchableAttributes') {
      return formatAttributeName(item);
    }
    return item;
  };

  return (
    <TableWrapper>
      <ComparisonTableStyled>
        <thead>
          <tr>
            {selectedIndexes.map(name => <th key={name}>{name}</th>)}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(rowValue => (
            <tr key={rowValue}>
              {selectedIndexes.map((indexName, colIndex) => {
                const currentConfig = configs[indexName] || [];
                const itemInCurrent = currentConfig.find(item => (comparisonType === 'rules' ? item.objectID : item) === rowValue);
                if (colIndex > 0) {
                  const itemInBase = baseConfig.find(item => (comparisonType === 'rules' ? item.objectID : item) === rowValue);
                  const isAdded = itemInCurrent && !itemInBase;
                  const isRemoved = !itemInCurrent && itemInBase;
                  return (
                    <DiffCell key={indexName} isAdded={isAdded} isRemoved={isRemoved}>
                      {itemInCurrent ? renderValue(itemInCurrent) : (isRemoved ? `(missing)` : '')}
                    </DiffCell>
                  );
                }
                return <td key={indexName}>{itemInCurrent ? renderValue(itemInCurrent) : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </ComparisonTableStyled>
    </TableWrapper>
  );
};


const MAX_INDEXES = 100;

const CompareIndexesConfig = () => {
  const [comparisonType, setComparisonType] = useState(null);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allIndexes, setAllIndexes] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [configs, setConfigs] = useState(null);
  const [showOnlyDiff, setShowOnlyDiff] = useState(true);
  
  const apiKey = getApiKey();
  const appId = getAppId();

  useEffect(() => {
    if (comparisonType && appId && apiKey) {
      const fetchIndexes = async () => {
        setLog('Fetching list of all indexes...');
        try {
          const client = algoliasearch(appId, apiKey);
          const indices = await client.listIndices();
          setAllIndexes(indices.items.map(item => item.name).sort());
          setLog('Index list fetched. Please select indexes to compare.');
        } catch (err) {
          setError('Failed to fetch index list: ' + err.message);
        }
      };
      fetchIndexes();
    }
    setSelectedIndexes([]);
    setSearchTerm('');
  }, [comparisonType, appId, apiKey]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allIndexes.filter(
        indexName =>
          indexName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedIndexes.includes(indexName)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, allIndexes, selectedIndexes]);
  
  useEffect(() => {
    if (selectedIndexes.length < 2) {
      setConfigs(null);
      return;
    }
    const fetchConfigs = async () => {
      setIsLoading(true);
      setError('');
      setLog(`Fetching configs for ${comparisonType}...`);
      try {
        const client = algoliasearch(appId, apiKey);
        const fetchedConfigs = {};
        await Promise.all(selectedIndexes.map(async (indexName) => {
          const index = client.initIndex(indexName);
          let data = [];
          if (comparisonType === 'rules') {
            const rules = [];
            await index.browseRules({ batch: batch => rules.push(...batch) });
            data = rules;
          } else {
            const settings = await index.getSettings();
            if (comparisonType === 'searchableAttributes') {
              data = settings.searchableAttributes || [];
            } else if (comparisonType === 'facets') {
              data = settings.attributesForFaceting || [];
            }
          }
          fetchedConfigs[indexName] = data;
        }));
        setConfigs(fetchedConfigs);
        setLog('Configurations fetched successfully. Displaying comparison.');
      } catch (err) {
        setError('Failed to fetch configurations: ' + err.message);
        setConfigs(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfigs();
  }, [selectedIndexes, comparisonType, appId, apiKey]);

  // MODIFIÉ : La fonction de sélection réinitialise maintenant l'état du toggle
  const selectComparison = (type) => {
    setConfigs(null); 
    setShowOnlyDiff(true); // On réinitialise le toggle à son état par défaut
    setComparisonType(prevType => (prevType === type ? null : type));
  };

  const handleSelectIndex = (indexName) => {
    if (selectedIndexes.length < MAX_INDEXES) {
      setSelectedIndexes([...selectedIndexes, indexName]);
      setSearchTerm('');
      setSuggestions([]);
    } else {
      setError(`You can compare a maximum of ${MAX_INDEXES} indexes.`);
    }
  };

  const handleRemoveIndex = (indexToRemove) => {
    setSelectedIndexes(selectedIndexes.filter(index => index !== indexToRemove));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedIndexes = pastedText.split(/\r?\n/).map(name => name.trim()).filter(Boolean);

    if (pastedIndexes.length > 1) {
      const currentSelectedIndexes = new Set(selectedIndexes);
      const validNewIndexes = pastedIndexes.filter(name => 
        allIndexes.includes(name) && !currentSelectedIndexes.has(name)
      );
      
      let combined = [...selectedIndexes, ...validNewIndexes];
      let warning = '';
      if (combined.length > MAX_INDEXES) {
        combined = combined.slice(0, MAX_INDEXES);
        warning = ` Warning: list truncated to the maximum of ${MAX_INDEXES} indexes.`;
      }

      setSelectedIndexes(combined);
      setSearchTerm('');
      setLog(`${validNewIndexes.length} valid index(es) added from your list.${warning}`);
    } else {
      setSearchTerm(pastedText);
    }
  };

  const toggleContainerStyle = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' };
  const toggleStyle = {
    appearance: 'none', width: '50px', height: '25px', backgroundColor: '#ccc',
    borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s',
  };
  const activeToggleStyle = { ...toggleStyle, backgroundColor: '#3498db' };
  const toggleCircleStyle = {
    content: '', position: 'absolute', top: '2px', width: '21px', height: '21px',
    backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s',
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Compare Index Configurations</h1>
      <InfoBlock title="About this feature">
        This tool allows you to compare the configuration of multiple indexes side-by-side to easily spot differences.
        <br/><br/>
        You can select indexes one by one, or **paste a list of index names** (separated by new lines) directly into the search box to add them in bulk.
      </InfoBlock>

      <SectionBlock title="1. Choose what to compare">
        <div style={buttonGroupStyle}>
          <StyledButton
            label="Searchable Attributes"
            icon="🔍"
            onClick={() => selectComparison('searchableAttributes')}
            color={comparisonType === 'searchableAttributes' ? '#2980b9' : '#34495e'}
          />
          <StyledButton
            label="Facets"
            icon="📊"
            onClick={() => selectComparison('facets')}
            color={comparisonType === 'facets' ? '#2980b9' : '#34495e'}
          />
          <StyledButton
            label="Rules"
            icon="📜"
            onClick={() => selectComparison('rules')}
            color={comparisonType === 'rules' ? '#2980b9' : '#34495e'}
          />
        </div>
      </SectionBlock>

      {comparisonType && (
        <>
          <SectionBlock title={`2. Select indexes to compare (up to ${MAX_INDEXES})`}>
            <IndexSelectorContainer>
              <ChipContainer>
                {selectedIndexes.map(index => (
                  <Chip key={index}>
                    {index}
                    <button onClick={() => handleRemoveIndex(index)}>×</button>
                  </Chip>
                ))}
              </ChipContainer>
              <AutocompleteInput
                type="text"
                placeholder="Search for an index or paste a list here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPaste={handlePaste}
                disabled={selectedIndexes.length >= MAX_INDEXES}
              />
              {suggestions.length > 0 && (
                <SuggestionsList>
                  {suggestions.map(suggestion => (
                    <SuggestionItem key={suggestion} onClick={() => handleSelectIndex(suggestion)}>
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </SuggestionsList>
              )}
            </IndexSelectorContainer>
          </SectionBlock>

          {selectedIndexes.length >= 2 && !isLoading && configs && (
            <SectionBlock title="3. Comparison Results">
              <div style={toggleContainerStyle}>
                <span style={{ fontWeight: !showOnlyDiff ? 'bold' : 'normal' }}>Show All</span>
                <div style={showOnlyDiff ? activeToggleStyle : toggleStyle} onClick={() => setShowOnlyDiff(!showOnlyDiff)}>
                  <div style={{ ...toggleCircleStyle, left: showOnlyDiff ? '26px' : '2px' }}></div>
                </div>
                <span style={{ fontWeight: showOnlyDiff ? 'bold' : 'normal' }}>Show Only Differences</span>
              </div>

              <ComparisonTable 
                selectedIndexes={selectedIndexes} 
                configs={configs} 
                comparisonType={comparisonType}
                showOnlyDiff={showOnlyDiff}
              />
            </SectionBlock>
          )}
        </>
      )}

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default CompareIndexesConfig;