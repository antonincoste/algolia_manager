// src/pages/CompareIndexesConfig.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { 
  Input, 
  Hint,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  ToggleThumb
} from '../components/FormElements';

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const IndexSelectorContainer = styled.div`
  position: relative;
  width: 100%;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  min-height: 38px;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--primary-100);
  color: var(--primary-700);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;

  button {
    background: none;
    border: none;
    margin-left: 8px;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    color: var(--primary-600);
    
    &:hover {
      color: var(--danger-500);
    }
  }
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  position: absolute;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: var(--shadow-lg);
`;

const SuggestionItem = styled.li`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--gray-700);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-50);
    color: var(--primary-600);
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const ComparisonTableStyled = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 13px;

  th, td {
    border: 1px solid var(--gray-200);
    padding: 12px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: var(--gray-50);
    font-weight: 600;
    color: var(--gray-900);
  }

  td {
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const DiffCell = styled.td`
  background-color: ${props => {
    if (props.$isAdded) return 'rgba(16, 185, 129, 0.15)';
    if (props.$isRemoved) return 'rgba(239, 68, 68, 0.15)';
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
                    <DiffCell key={indexName} $isAdded={isAdded} $isRemoved={isRemoved}>
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
          const { items } = await client.listIndices();
          const primaryIndexes = items.filter(item => !item.primary);
          const cleanedNames = primaryIndexes.map(item => item.name.trim());
          const uniqueNames = [...new Set(cleanedNames)];
          setAllIndexes(uniqueNames.sort());
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
      const filtered = (allIndexes || []).filter(
        indexName =>
          indexName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(selectedIndexes || []).includes(indexName)
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

  const selectComparison = (type) => {
    setConfigs(null); 
    setShowOnlyDiff(true);
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
    setSelectedIndexes((selectedIndexes || []).filter(index => index !== indexToRemove));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedIndexes = pastedText.split(/\r?\n/).map(name => name.trim()).filter(Boolean);

    if (pastedIndexes.length > 1) {
      const currentSelectedIndexes = new Set(selectedIndexes);
      const validNewIndexes = (pastedIndexes || []).filter(name => 
        (allIndexes || []).includes(name) && !currentSelectedIndexes.has(name)
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

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Compare Index Configurations"
        subtitle="Diff searchable attributes, facets, and rules between indexes"
      />

      <InfoBlock title="About this feature" icon="📊">
        This tool allows you to compare the configuration of multiple indexes side-by-side to easily spot differences.
        <br/><br/>
        You can select indexes one by one, or <strong>paste a list of index names</strong> (separated by new lines) directly into the search box to add them in bulk.
      </InfoBlock>

      <SectionBlock title="1. Choose what to compare">
        <ButtonGroup>
          <StyledButton
            label="Searchable Attributes"
            icon="🔍"
            onClick={() => selectComparison('searchableAttributes')}
            variant={comparisonType === 'searchableAttributes' ? 'primary' : 'secondary'}
          />
          <StyledButton
            label="Facets"
            icon="📊"
            onClick={() => selectComparison('facets')}
            variant={comparisonType === 'facets' ? 'primary' : 'secondary'}
          />
          <StyledButton
            label="Rules"
            icon="📜"
            onClick={() => selectComparison('rules')}
            variant={comparisonType === 'rules' ? 'primary' : 'secondary'}
          />
        </ButtonGroup>
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
              <Input
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
              <ToggleContainer style={{ marginBottom: '20px' }}>
                <ToggleLabel $active={!showOnlyDiff}>Show All</ToggleLabel>
                <ToggleSwitch 
                  $active={showOnlyDiff} 
                  onClick={() => setShowOnlyDiff(!showOnlyDiff)}
                >
                  <ToggleThumb $active={showOnlyDiff} />
                </ToggleSwitch>
                <ToggleLabel $active={showOnlyDiff}>Show Only Differences</ToggleLabel>
              </ToggleContainer>

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

      {error && <Hint className="error" style={{ marginTop: '20px' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px' }}>{log}</Hint>}
    </div>
  );
};

export default CompareIndexesConfig;