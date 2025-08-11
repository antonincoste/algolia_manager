import React, { useState } from 'react';
import { getApiKey } from '../services/sessionService';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';

const OfflineProducts = () => {
  const [appId, setAppId] = useState('');
  const [indexesInput, setIndexesInput] = useState('');
  const [offlineSmcInput, setOfflineSmcInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const apiKey = getApiKey();

  const handleProcessOffline = async () => {
    setErrorMessage('');

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

    try {
      const client = algoliasearch(appId, apiKey);
      const indexes = indexesInput.split('\n').map(line => line.trim()).filter(line => line);
      const styleMaterialColors = offlineSmcInput.split('\n').map(line => line.trim()).filter(line => line);

      let log = `Log started at: ${new Date().toLocaleString()}\n\n`;

      for (const indexName of indexes) {
        const index = client.initIndex(indexName);
        let allUpdatedObjects = [];
        let logEntries = [];

        log += `Start processing for index ${indexName}\n`;

        for (const color of styleMaterialColors) {
          const objects = await getAllObjectsByStyleMaterialColor(index, color);
          const updatedObjects = await updateObjectsOnlineStatus(index, objects);
          allUpdatedObjects = [...allUpdatedObjects, ...updatedObjects];

          updatedObjects.forEach(obj => {
            logEntries.push(`objectID: ${obj.objectID}, styleMaterialColor: ${obj.styleMaterialColor}, online: ${obj.online}`);
          });

          log += `Index: ${indexName}, StyleMaterialColor: ${color}, Objects found: ${objects.length}, Objects updated: ${updatedObjects.length}\n`;
        }

        logEntries.forEach(entry => log += entry + '\n');
        log += `Finish processing index ${indexName}, ${allUpdatedObjects.length} objects updated\n\n`;
      }

      log += `Log finished at: ${new Date().toLocaleString()}\n`;

      console.log("Log output:", log);
    } catch (error) {
      setErrorMessage(`An error occurred: ${error.message}`);
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
      <h1>Passer les Produits en Offline</h1>

      <InfoBlock title="À propos de cette fonctionnalité">
        Cette page vous permet de passer des produits en offline dans vos indexes Algolia. 
        Vous pouvez spécifier les indexes et les objets à mettre hors ligne en utilisant les champs ci-dessous.
      </InfoBlock>
      
      {errorMessage && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {errorMessage}
        </div>
      )}

      <SectionBlock title="Paramètres">
        <label>App ID :</label>
        <input
          type="text"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          style={{ width: 'calc(100% - 20px)', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        />

        <br /><br />

        <label>Liste des Indexes :</label>
        <textarea
          value={indexesInput}
          onChange={(e) => setIndexesInput(e.target.value)}
          rows="6"
          style={{ width: 'calc(100% - 20px)', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        />

        <br /><br />

        <label>Liste des Objets (SMC) :</label>
        <textarea
          value={offlineSmcInput}
          onChange={(e) => setOfflineSmcInput(e.target.value)}
          rows="6"
          style={{ width: 'calc(100% - 20px)', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        />
      </SectionBlock>

      <SectionBlock title="Actions">
        <button
          onClick={handleProcessOffline}
          style={{ padding: '10px 20px', borderRadius: '4px', backgroundColor: '#007BFF', color: '#fff', border: 'none' }}
        >
          Passer en Offline
        </button>
      </SectionBlock>
    </div>
  );
};

export default OfflineProducts;
