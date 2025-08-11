// src/pages/ExportByID.js
import React, { useState } from 'react';
import algoliasearch from 'algoliasearch';
// MODIFIÉ : On importe aussi getAppId
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
// AJOUTÉ : Import du loader
import FullPageLoader from '../components/FullPageLoader';

const ExportByID = () => {
  // SUPPRIMÉ : L'état local pour l'appId a été enlevé
  // const [appId, setAppId] = useState('');
  
  const [indexName, setIndexName] = useState('');
  const [objectIds, setObjectIds] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // AJOUTÉ : État pour le loader

  // AJOUTÉ : On récupère l'App ID et la clé API depuis le service
  const apiKey = getApiKey();
  const appId = getAppId();

  const handleGenerateFile = async () => {
    // AJOUTÉ : Vérification des identifiants
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }
    
    setLog('Generating CSV file...');
    setError('');
    setIsLoading(true); // AJOUTÉ : Démarrer le loader

    try {
      const ids = objectIds
        .split(/\s|,|;|\n/) // Gère les retours à la ligne
        .map(id => id.trim())
        .filter(id => id);

      if (ids.length === 0) {
        throw new Error('Please provide at least one objectID.');
      }
      
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);

      // OPTIMISATION : Utilisation de getObjects pour récupérer tous les objets en une seule requête
      const { results } = await index.getObjects(ids);
      const hits = results.filter(record => record !== null); // Filtrer les objectIDs non trouvés

      if (hits.length === 0) {
        throw new Error('None of the provided objectIDs were found in the index.');
      }

      // Logique pour obtenir toutes les colonnes possibles
      const allKeys = Array.from(
        hits.reduce((set, item) => {
          Object.keys(item).forEach(k => set.add(k));
          return set;
        }, new Set())
      );

      const csvRows = [allKeys.join(';')];
      hits.forEach(obj => {
        const row = allKeys.map(attr => {
          const value = obj[attr];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        });
        csvRows.push(row.join(';'));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `algolia_export_by_id_${indexName}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLog(`${hits.length} records successfully exported.`);
    } catch (err) {
      setError('Error generating CSV file: ' + err.message);
    } finally {
      setIsLoading(false); // AJOUTÉ : Arrêter le loader
    }
  };

  return (
    <div style={{ marginLeft: '260px', padding: '20px' }}>
      <FullPageLoader isLoading={isLoading} />
      <h1>Export Products by ID</h1>

      <InfoBlock title="How this works">
        Use this module to export products from an Algolia index using their unique <code>objectID</code>.
        <br /><br />
        📝 Paste your list of <strong>objectIDs</strong> in the text area — one per line or separated by spaces, commas, or semicolons.
        <br /><br />
        🔍 The tool will fetch all matching records from the index and include every attribute available on each object. Non-existent objectIDs will be ignored.
        <br /><br />
        📁 Once ready, click "Generate CSV File" to download your results.
      </InfoBlock>

      {/* MODIFIÉ : Le bloc de configuration est simplifié */}
      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SUPPRIMÉ : Le champ de saisie pour l'App ID a été retiré */}
          <div>
            <label>Index Name:</label>
            <input
              type="text"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }}
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Product Object IDs">
        <textarea
          placeholder="Paste objectIDs here, separated by lines, commas, or spaces..."
          value={objectIds}
          onChange={(e) => setObjectIds(e.target.value)}
          rows={10}
          style={{ width: '97%', padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleGenerateFile} label="Generate CSV File" icon="📁" color="#28a745" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default ExportByID;