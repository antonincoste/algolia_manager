// src/pages/TopNoResultSearches.js
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { analyticsClient } from '@algolia/client-analytics';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { Input, Label, FormGroup, Hint } from '../components/FormElements';

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
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

const PeriodButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const PeriodButton = styled.button`
  padding: 10px 20px;
  border: 2px solid ${props => props.$active ? 'var(--primary-500)' : 'var(--gray-200)'};
  border-radius: var(--radius-md);
  cursor: pointer;
  background-color: ${props => props.$active ? 'var(--primary-500)' : 'var(--white)'};
  color: ${props => props.$active ? 'var(--white)' : 'var(--gray-700)'};
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--primary-400);
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid var(--gray-200);
    padding: 12px 16px;
    text-align: left;
  }

  th {
    background-color: var(--gray-50);
    font-weight: 600;
    color: var(--gray-900);
  }

  td {
    color: var(--gray-700);
  }

  tr:hover td {
    background-color: var(--gray-50);
  }
`;

const TopNoResultSearches = () => {
  const [params, setParams] = useState({
    indexName: '',
    region: 'fr',
    days: 7,
  });

  const [allIndexes, setAllIndexes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const paramsRef = useRef(params);
  const appId = getAppId();
  const apiKey = getApiKey();

  useEffect(() => {
    if (appId && apiKey) {
      const searchClient = algoliasearch(appId, apiKey);
      searchClient.listIndices().then(({ items }) => {
        const primaryIndexes = items.filter(item => !item.primary);
        const cleanedNames = primaryIndexes.map(item => item.name.trim());
        const uniqueNames = [...new Set(cleanedNames)];
        setAllIndexes(uniqueNames.sort());
      }).catch(err => {
        console.error("Failed to fetch index list for autocomplete:", err);
      });
    }
  }, [appId, apiKey]);

  useEffect(() => {
    if (params.indexName && allIndexes.length > 0) {
      const filtered = allIndexes.filter(name =>
        name.toLowerCase().includes(params.indexName.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [params.indexName, allIndexes]);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const updateParam = (key, value) => {
    const newParams = { ...paramsRef.current, [key]: value };
    paramsRef.current = newParams;
    setParams(newParams);
  };

  const handleSuggestionClick = (indexName) => {
    updateParam('indexName', indexName);
    setSuggestions([]);
    setIsInputFocused(false);
  };

  const handleFetchTopSearches = async () => {
    const currentApiKey = getApiKey();
    const currentAppId = getAppId();
  
    if (!currentAppId || !currentApiKey) {
      setError('Error: Credentials are missing.');
      return;
    }
  
    const currentParams = paramsRef.current;
  
    if (!currentParams.indexName || !currentParams.region) {
      setError('Please provide an index name and a region.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setLog(`Fetching top searches for '${currentParams.indexName}'...`);
    setTopSearches([]);
  
    try {
      const client = analyticsClient(currentAppId, currentApiKey, currentParams.region);
  
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - currentParams.days);
  
      let response = null;
      let success = false;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await client.getTopSearches({
            index: currentParams.indexName,
            withNoResults: true,
            startDate: formatDate(startDate),
            endDate: formatDate(today),
            limit: 1000,
          });
          success = true;
          break;
        } catch (err) {
          if (attempt === 3) {
            throw err;
          }
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      if (success && response) {
        const filteredSearches = (response.searches || []).filter(item => 
          item.search.trim() !== '' && item.nbHits === 0
        );
        
        setTopSearches(filteredSearches);
        
        if (filteredSearches.length === 0) {
          setLog('No searches with zero results were found for this period.');
        } else {
          setLog(`Found ${filteredSearches.length} searches with no results.`);
        }
      }
  
    } catch (err) {
      setError(`An error occurred after all attempts: ${err.message}`);
      setLog('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Top Searches With No Results"
        subtitle="Identify search queries that returned zero results"
      />

      <InfoBlock title="About this feature" icon="🕵️">
        This tool uses the Algolia Analytics API to retrieve the most frequent search queries that returned zero results over a given period.
        <br/><br/>
        This is extremely useful for identifying:
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Content gaps in your catalog (products people want but you don't have)</li>
          <li>Misspellings or relevance issues that prevent users from finding existing products</li>
          <li>Opportunities for creating synonyms or query rules</li>
        </ul>
      </InfoBlock>

      <SectionBlock title="Configuration">
        <FormGroup>
          <Label>Index Name</Label>
          <AutocompleteContainer>
            <Input
              type="text"
              value={params.indexName}
              onChange={(e) => updateParam('indexName', e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder="Search for a primary index..."
            />
            {isInputFocused && suggestions.length > 0 && (
              <SuggestionsList>
                {suggestions.slice(0, 10).map(suggestion => (
                  <SuggestionItem key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </SuggestionItem>
                ))}
              </SuggestionsList>
            )}
          </AutocompleteContainer>
        </FormGroup>

        <FormGroup>
          <Label>Analytics Region (e.g., 'us-east', 'de', 'fr')</Label>
          <Input
            type="text"
            value={params.region}
            onChange={(e) => updateParam('region', e.target.value)}
            placeholder="Enter the region code"
            style={{ maxWidth: '300px' }}
          />
        </FormGroup>

        <FormGroup>
          <Label>Time Period</Label>
          <PeriodButtonGroup>
            {[7, 30, 90].map(d => (
              <PeriodButton 
                key={d} 
                onClick={() => updateParam('days', d)}
                $active={params.days === d}
              >
                Last {d} Days
              </PeriodButton>
            ))}
          </PeriodButtonGroup>
        </FormGroup>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleFetchTopSearches} label="Fetch Top Searches" icon="🕵️" variant="primary" size="lg" />
      </SectionBlock>

      {topSearches.length > 0 && (
        <SectionBlock title="Results">
          <ResultsTable>
            <thead>
              <tr>
                <th>Search Query</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {topSearches.map((item, index) => (
                <tr key={index}>
                  <td>{item.search}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </ResultsTable>
        </SectionBlock>
      )}

      {error && <Hint className="error" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</Hint>}
      {log && !isLoading && <Hint className="success" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</Hint>}
    </div>
  );
};

export default TopNoResultSearches;