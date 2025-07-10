import React, { useState } from 'react';
import { getApiKey } from '../services/sessionService';
import axios from 'axios';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';

const CopyRecommendations = () => {
  const [appId, setAppId] = useState('');
  const [sourceIndexName, setSourceIndexName] = useState(''); // Nouveau champ pour l'index source
  const [sourceModelName, setSourceModelName] = useState('related-products'); // Modèle source
  const [targetIndexesInput, setTargetIndexesInput] = useState(''); // Liste des indexes cibles
  const [mode, setMode] = useState('merge'); // Mode 'merge' ou 'replace'
  const [errorMessage, setErrorMessage] = useState('');
  const [logOutput, setLogOutput] = useState(''); // Pour afficher le résultat du log
  const apiKey = getApiKey();

  const handleCopyRecommendations = async () => {
    setErrorMessage('');

    if (!appId) {
      setErrorMessage('App ID is required.');
      return;
    }
    if (!apiKey) {
      setErrorMessage('API Key is required.');
      return;
    }
    if (!sourceIndexName) {
      setErrorMessage('Source index is required.');
      return;
    }
    if (!targetIndexesInput) {
      setErrorMessage('Target indexes input is required.');
      return;
    }

    try {
      const targetIndexes = targetIndexesInput.split('\n').map(line => line.trim()).filter(line => line);

      const rules = await listRecommendRules(sourceIndexName, sourceModelName); // Utilisation du champ pour l'index source
      if (!rules.length) {
        setErrorMessage(`No rules found for the source model: ${sourceModelName}`);
        return;
      }

      let log = `Log started at: ${new Date().toLocaleString()}\n\n`;

      for (const targetIndexName of targetIndexes) {
        log += `Processing target index: ${targetIndexName} in ${mode} mode\n`;

        if (mode === 'replace') {
          await clearRecommendRules(targetIndexName);
        }

        await pushRecommendRules(rules, targetIndexName);

        log += `Successfully processed target index: ${targetIndexName}\n\n`;
      }

      log += `Log finished at: ${new Date().toLocaleString()}\n`;
      setLogOutput(log);
      console.log("Log output:", log);
    } catch (error) {
      setErrorMessage(`An error occurred: ${error.message}`);
    }
  };

  const listRecommendRules = async (indexName, modelName) => {
    try {
      const url = `https://${appId}.algolia.net/1/indexes/${indexName}/recommend/rules/search`;
      const headers = {
        'X-Algolia-API-Key': apiKey,
        'X-Algolia-Application-Id': appId,
        'Content-Type': 'application/json'
      };
      const rules = [];
      let page = 0;

      while (true) {
        const response = await axios.post(url, {
          query: "",
          page: page,
          hitsPerPage: 100
        }, { headers });

        if (response.status !== 200) {
          console.error(`Error retrieving rules: ${response.status} ${response.data}`);
          break;
        }

        const data = response.data;
        rules.push(...data.hits);

        if (page >= data.nbPages - 1) break;
        page += 1;
      }

      return rules;
    } catch (error) {
      console.error("Error listing recommend rules:", error);
      return [];
    }
  };

  const clearRecommendRules = async (targetIndexName) => {
    try {
      const rules = await listRecommendRules(targetIndexName, sourceModelName);
      for (const rule of rules) {
        const url = `https://${appId}.algolia.net/1/indexes/${targetIndexName}/recommend/rules/${rule.objectID}`;
        const headers = {
          'X-Algolia-API-Key': apiKey,
          'X-Algolia-Application-Id': appId,
          'Content-Type': 'application/json'
        };
        await axios.delete(url, { headers });
      }
    } catch (error) {
      console.error("Error clearing recommend rules:", error);
    }
  };

  const pushRecommendRules = async (rules, targetIndexName) => {
    try {
      const url = `https://${appId}.algolia.net/1/indexes/${targetIndexName}/recommend/rules/batch`;
      const headers = {
        'X-Algolia-API-Key': apiKey,
        'X-Algolia-Application-Id': appId,
        'Content-Type': 'application/json'
      };

      const cleanRules = rules.map(rule => {
        const { _metadata, _highlightResult, ...rest } = rule;
        return rest;
      });

      const response = await axios.post(url, cleanRules, { headers });

      if (response.status !== 200) {
        console.error(`Error pushing rules to ${targetIndexName}: ${response.status} ${response.data}`);
      }
    } catch (error) {
      console.error("Error pushing recommend rules:", error);
    }
  };

  return (
    <div style={{ marginLeft: '260px', padding: '20px' }}>
      <h1>Copier les Recommandations</h1>
      
      <InfoBlock title="À propos de cette fonctionnalité">
        Cette page vous permet de copier les règles de recommandations d'un index source vers plusieurs indexes cibles.
        Vous pouvez choisir le modèle source, le mode de copie et spécifier les indexes cibles.
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

        <label>Index Source :</label> {/* Nouveau champ pour l'index source */}
        <input
          type="text"
          value={sourceIndexName}
          onChange={(e) => setSourceIndexName(e.target.value)}
          style={{ width: 'calc(100% - 20px)', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        />

        <br /><br />

        <label>Modèle Source :</label>
        <select
          value={sourceModelName}
          onChange={(e) => setSourceModelName(e.target.value)}
          style={{ width: 'calc(100% - 20px)', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        >
          <option value="related-products">related-products</option>
          <option value="frequently-bought-together">frequently-bought-together</option>
        </select>

        <br /><br />

        <label>Mode :</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ width: 'calc(100% - 20px)', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        >
          <option value="merge">merge</option>
          <option value="replace">replace</option>
        </select>

        <br /><br />

        <label>Indexes Cibles :</label>
        <textarea
          value={targetIndexesInput}
          onChange={(e) => setTargetIndexesInput(e.target.value)}
          rows="6"
          style={{ width: 'calc(100% - 20px)', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
          placeholder="Entrez chaque index cible sur une nouvelle ligne"
        />
      </SectionBlock>

      <SectionBlock title="Actions">
        <button
          onClick={handleCopyRecommendations}
          style={{ padding: '10px 20px', borderRadius: '4px', backgroundColor: '#007BFF', color: '#fff', border: 'none' }}
        >
          Copier les Recommandations
        </button>
      </SectionBlock>

      <SectionBlock title="Résultat du Log">
        <textarea
          value={logOutput}
          readOnly
          rows="10"
          style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '10px' }}
        />
      </SectionBlock>
    </div>
  );
};

export default CopyRecommendations;
