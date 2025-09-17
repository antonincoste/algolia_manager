// src/pages/RecommendTester.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { recommendClient } from '@algolia/recommend';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const ProductGrid = styled.div`
  display: grid;
  /* MODIFIÉ : Retour à une grille fixe de 4 colonnes */
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

const ProductTile = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  img {
    max-width: 100%;
    height: 150px;
    object-fit: contain;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    margin: 0;
    color: #333;
    height: 40px;
    overflow: hidden;
  }
`;

const JsonEditor = styled.textarea`
  width: 100%;
  min-height: 250px;
  padding: 15px;
  font-family: monospace;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: vertical;
  box-sizing: border-box;
`;

const configInputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '250px' };

const defaultRequest = JSON.stringify({
  requests: [
    {
      indexName: "VOTRE_INDEX_ICI",
      model: "related-products",
      objectID: "VOTRE_OBJECTID_ICI",
      threshold: 0,
      maxRecommendations: 8,
    }
  ]
}, null, 2);

const RecommendTester = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [requestBody, setRequestBody] = useState(defaultRequest);
  
  const [displayConfig, setDisplayConfig] = useState({
    name: 'name_en',
    image: 'thumbnailUrls',
  });
  
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const appId = getAppId();
  const apiKey = getApiKey();

  const handleDisplayConfigChange = (key, value) => {
    setDisplayConfig(prevConfig => ({
      ...prevConfig,
      [key]: value
    }));
  };

  const handleFetchRecommendations = async () => {
    if (!appId || !apiKey) {
      setError('Error: Credentials are missing.');
      return;
    }

    let parsedRequest;
    try {
      parsedRequest = JSON.parse(requestBody);
      if (!parsedRequest.requests) {
        throw new Error("The JSON must have a 'requests' key containing an array.");
      }
    } catch (err) {
      setError(`Invalid JSON format: ${err.message}`);
      return;
    }

    setIsLoading(true);
    setError('');
    setLog('Fetching recommendations from Algolia...');

    try {
      const recommend = recommendClient(appId, apiKey, 'fr');
      const { results } = await recommend.getRecommendations(parsedRequest.requests);

      const hits = results[0]?.hits || [];
      setRecommendations(hits); 
      setLog(`✅ Successfully fetched ${hits.length} recommendations.`);

    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Algolia Recommend Tester</h1>
      <InfoBlock title="About this feature">
        This page is a sandbox for testing Algolia Recommend.
        <br/><br/>
        The product tiles above will display the results of your API call. Edit the JSON request below (including the `maxRecommendations` value) to test different models and parameters, then click "Fetch Recommendations".
      </InfoBlock>
      
      <SectionBlock title="Display Configuration">
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '10px' }}>Name Attribute:</label>
            <input 
              type="text" 
              value={displayConfig.name}
              onChange={(e) => handleDisplayConfigChange('name', e.target.value)}
              style={configInputStyle}
            />
          </div>
          <div>
            <label style={{ marginRight: '10px' }}>Image Array Attribute:</label>
            <input 
              type="text" 
              value={displayConfig.image}
              onChange={(e) => handleDisplayConfigChange('image', e.target.value)}
              style={configInputStyle}
            />
          </div>
        </div>
      </SectionBlock>
      
      <SectionBlock title="Recommended Products">
        {recommendations.length === 0 && !isLoading ? (
            <p style={{color: '#777', fontStyle: 'italic'}}>No recommendations to display. Fetch recommendations to see results here.</p>
        ) : (
            <ProductGrid>
            {recommendations.map((rec, index) => {
                const name = rec[displayConfig.name] || `Product Name ${index + 1}`;
                const imageArray = rec[displayConfig.image];
                const imageUrl = (imageArray && Array.isArray(imageArray) && imageArray.length > 0)
                ? imageArray[0]
                : 'https://via.placeholder.com/150';

                return (
                <ProductTile key={rec.objectID || `placeholder-${index}`}>
                    <img src={imageUrl} alt={name} />
                    <p>{name}</p>
                </ProductTile>
                );
            })}
            </ProductGrid>
        )}
      </SectionBlock>

      <SectionBlock title="JSON Request Body">
        <JsonEditor 
          value={requestBody}
          onChange={(e) => setRequestBody(e.target.value)}
        />
        <StyledButton 
          onClick={handleFetchRecommendations} 
          label="Fetch Recommendations" 
          icon="🚀" 
          color="#28a745"
          style={{marginTop: '15px'}}
        />
      </SectionBlock>
      
      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default RecommendTester;