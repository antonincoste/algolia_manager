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

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const inputStyle = { 
  width: '100%', 
  padding: '10px', 
  marginTop: '5px', 
  borderRadius: '4px', 
  border: '1px solid #ddd', 
  boxSizing: 'border-box' 
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
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
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

        // AJOUT : Nettoyage et dédoublonnage des noms d'index
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
      <h1>Top Searches With No Results</h1>
      <InfoBlock title="About this feature">
        This tool uses the Algolia Analytics API to retrieve the most frequent search queries that returned zero results over a given period.
        <br/><br/>
        This is extremely useful for identifying:
        <ul>
          <li>Content gaps in your catalog (products people want but you don't have).</li>
          <li>Misspellings or relevance issues that prevent users from finding existing products.</li>
          <li>Opportunities for creating synonyms or query rules.</li>
        </ul>
      </InfoBlock>

      <SectionBlock title="Configuration">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>Index Name:</label>
            <AutocompleteContainer>
              <input
                type="text"
                value={params.indexName}
                onChange={(e) => updateParam('indexName', e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                style={inputStyle}
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
          </div>
          <div>
            <label>Analytics Region (e.g., 'us-east', 'de', 'fr'):</label>
            <input
              type="text"
              value={params.region}
              onChange={(e) => updateParam('region', e.target.value)}
              placeholder="Enter the region code"
              style={inputStyle}
            />
          </div>
          <div>
            <label>Time Period:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              {[7, 30, 90].map(d => (
                <button 
                  key={d} 
                  onClick={() => updateParam('days', d)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: params.days === d ? '#3498db' : 'white',
                    color: params.days === d ? 'white' : 'black',
                  }}
                >
                  Last {d} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleFetchTopSearches} label="Fetch Top Searches" icon="🕵️‍♀️" color="#28a745" />
      </SectionBlock>

      {topSearches.length > 0 && (
        <SectionBlock title="Results">
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#f8f9fa'}}>
                <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Search Query</th>
                <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Count</th>
              </tr>
            </thead>
            <tbody>
              {topSearches.map((item, index) => (
                <tr key={index}>
                  <td style={{border: '1px solid #ddd', padding: '12px'}}>{item.search}</td>
                  <td style={{border: '1px solid #ddd', padding: '12px'}}>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionBlock>
      )}

      {error && <div style={{ color: 'red', marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</div>}
      {log && !isLoading && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

export default TopNoResultSearches;