// src/pages/OfflineProducts.js
import React, { useState } from 'react';
import { getApiKey } from '../services/sessionService';
import { trackFeatureUsed, trackError } from '../services/analyticsService';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { Input, Textarea, Label, FormGroup, Hint } from '../components/FormElements';

const OfflineProducts = () => {
  const [appId, setAppId] = useState('');
  const [indexesInput, setIndexesInput] = useState('');
  const [offlineSmcInput, setOfflineSmcInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [log, setLog] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = getApiKey();

  const handleProcessOffline = async () => {
    setErrorMessage('');
    setLog('');

    if (!appId) {
      setErrorMessage('App ID is required.');
      return;
    }
    if (!apiKey) {
      setErrorMessage('API Key is required.');
      return;
    }
    if (!indexesInput) {
      setErrorMessage('Indexes input is required.');
      return;
    }
    if (!offlineSmcInput) {
      setErrorMessage('SMC input is required.');
      return;
    }

    setIsLoading(true);

    try {
      const client = algoliasearch(appId, apiKey);
      const indexes = indexesInput.split('\n').map(line => line.trim()).filter(line => line);
      const styleMaterialColors = offlineSmcInput.split('\n').map(line => line.trim()).filter(line => line);

      let fullLog = `Log started at: ${new Date().toLocaleString()}\n\n`;

      for (const indexName of indexes) {
        const index = client.initIndex(indexName);
        let allUpdatedObjects = [];
        let logEntries = [];

        fullLog += `Start processing for index ${indexName}\n`;

        for (const color of styleMaterialColors) {
          const objects = await getAllObjectsByStyleMaterialColor(index, color);
          const updatedObjects = await updateObjectsOnlineStatus(index, objects);
          allUpdatedObjects = [...allUpdatedObjects, ...updatedObjects];

          updatedObjects.forEach(obj => {
            logEntries.push(`objectID: ${obj.objectID}, styleMaterialColor: ${obj.styleMaterialColor}, online: ${obj.online}`);
          });

          fullLog += `Index: ${indexName}, StyleMaterialColor: ${color}, Objects found: ${objects.length}, Objects updated: ${updatedObjects.length}\n`;
        }

        fullLog += logEntries.join('\n') + '\n';
        fullLog += `Finish processing index ${indexName}, ${allUpdatedObjects.length} objects updated\n\n`;
      }

      fullLog += `Log finished at: ${new Date().toLocaleString()}\n`;
      setLog(fullLog);
      trackFeatureUsed('offline_products', { indexes_count: indexes.length });

    } catch (error) {
      trackError('offline_products', error.message, 'offline_error');
      setErrorMessage(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllObjectsByStyleMaterialColor = async (index, styleMaterialColor) => {
    const objects = [];
    let page = 0;
    while (true) {
      const searchResults = await index.search('', {
        filters: `styleMaterialColor:"${styleMaterialColor}"`,
        distinct: false,
        hitsPerPage: 1000,
        page: page
      });
      const hits = searchResults.hits;
      if (!hits.length) break;
      objects.push(...hits);
      page += 1;
    }
    return objects;
  };

  const updateObjectsOnlineStatus = async (index, objects) => {
    const updatedObjects = objects.map(obj => {
      if (obj.online === true) {
        return { ...obj, online: false };
      }
      return null;
    }).filter(obj => obj !== null);

    if (updatedObjects.length > 0) {
      await index.saveObjects(updatedObjects, { autoGenerateObjectIDIfNotExist: true });
    }

    return updatedObjects;
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Passer les Produits en Offline"
        subtitle="Mettre des produits hors ligne dans vos indexes Algolia"
      />

      <InfoBlock title="À propos de cette fonctionnalité" icon="📴">
        Cette page vous permet de passer des produits en offline dans vos indexes Algolia. 
        Vous pouvez spécifier les indexes et les objets à mettre hors ligne en utilisant les champs ci-dessous.
      </InfoBlock>

      <SectionBlock title="Paramètres">
        <FormGroup>
          <Label>App ID</Label>
          <Input
            type="text"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="Votre App ID Algolia"
          />
        </FormGroup>

        <FormGroup>
          <Label>Liste des Indexes</Label>
          <Textarea
            value={indexesInput}
            onChange={(e) => setIndexesInput(e.target.value)}
            rows={6}
            placeholder="Un index par ligne..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Liste des Objets (SMC)</Label>
          <Textarea
            value={offlineSmcInput}
            onChange={(e) => setOfflineSmcInput(e.target.value)}
            rows={6}
            placeholder="Un SMC par ligne..."
          />
        </FormGroup>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton
          onClick={handleProcessOffline}
          label="Passer en Offline"
          icon="📴"
          variant="primary"
          size="lg"
        />
      </SectionBlock>

      {errorMessage && <Hint className="error" style={{ marginTop: '20px' }}>{errorMessage}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</Hint>}
    </div>
  );
};

export default OfflineProducts;