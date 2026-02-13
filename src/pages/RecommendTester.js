// src/pages/RecommendTester.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { recommendClient } from '@algolia/recommend';
import { getApiKey, getAppId } from '../services/sessionService';
import { trackRecommendTest, trackError } from '../services/analyticsService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { Input, Label, Hint } from '../components/FormElements';

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

const ProductTile = styled.div`
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
  background-color: var(--white);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  img {
    max-width: 100%;
    height: 150px;
    object-fit: contain;
    margin-bottom: 12px;
  }

  p {
    font-size: 13px;
    margin: 0;
    color: var(--gray-700);
    height: 40px;
    overflow: hidden;
    line-height: 1.4;
  }
`;

const EmptyState = styled.p`
  color: var(--gray-500);
  font-style: italic;
  text-align: center;
  padding: 40px;
`;

const JsonEditor = styled.textarea`
  width: 100%;
  min-height: 250px;
  padding: 16px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 13px;
  border-radius: var(--radius-md);
  border: 2px solid var(--gray-200);
  background-color: var(--gray-900);
  color: #f8f8f2;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: var(--primary-500);
  }
`;

const ConfigRow = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
`;

const ConfigItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const defaultRequest = JSON.stringify({
  requests: [
    {
      indexName: "YOUR_INDEX_HERE",
      model: "related-products",
      objectID: "YOUR_OBJECTID_HERE",
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
      trackRecommendTest(
        parsedRequest.requests[0]?.indexName || 'unknown',
        parsedRequest.requests[0]?.model || 'unknown',
        hits.length
      );
      setLog(`✅ Successfully fetched ${hits.length} recommendations.`);

    } catch (err) {
      trackError('recommend_tester', err.message, 'recommend_error');
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Algolia Recommend Tester"
        subtitle="Test and preview recommendation models"
      />

      <InfoBlock title="About this feature" icon="👍">
        This page is a sandbox for testing Algolia Recommend.
        <br/><br/>
        The product tiles will display the results of your API call. Edit the JSON request below (including the <code>maxRecommendations</code> value) to test different models and parameters, then click "Fetch Recommendations".
      </InfoBlock>
      
      <SectionBlock title="Display Configuration">
        <ConfigRow>
          <ConfigItem>
            <Label style={{ marginBottom: 0 }}>Name Attribute:</Label>
            <Input 
              type="text" 
              value={displayConfig.name}
              onChange={(e) => handleDisplayConfigChange('name', e.target.value)}
              style={{ width: '200px' }}
            />
          </ConfigItem>
          <ConfigItem>
            <Label style={{ marginBottom: 0 }}>Image Array Attribute:</Label>
            <Input 
              type="text" 
              value={displayConfig.image}
              onChange={(e) => handleDisplayConfigChange('image', e.target.value)}
              style={{ width: '200px' }}
            />
          </ConfigItem>
        </ConfigRow>
      </SectionBlock>
      
      <SectionBlock title="Recommended Products">
        {recommendations.length === 0 && !isLoading ? (
          <EmptyState>No recommendations to display. Fetch recommendations to see results here.</EmptyState>
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
        <div style={{ marginTop: '16px' }}>
          <StyledButton 
            onClick={handleFetchRecommendations} 
            label="Fetch Recommendations" 
            icon="🚀" 
            variant="primary"
            size="lg"
          />
        </div>
      </SectionBlock>
      
      {error && <Hint className="error" style={{ marginTop: '20px' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px' }}>{log}</Hint>}
    </div>
  );
};

export default RecommendTester;