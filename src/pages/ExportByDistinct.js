import React, { useState } from 'react';
// MODIFIÉ : On importe aussi getAppId
import { getApiKey, getAppId } from '../services/sessionService';
import algoliasearch from 'algoliasearch';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
// AJOUTÉ : Import du loader pour une meilleure UX
import FullPageLoader from '../components/FullPageLoader';

const ExportData = () => {
  // SUPPRIMÉ : L'état local pour l'appId a été enlevé
  // const [appId, setAppId] = useState('');
  
  const [indexName, setIndexName] = useState('');
  const [productCodes, setProductCodes] = useState('');
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [distinctAttribute, setDistinctAttribute] = useState('');
  const [isLoading, setIsLoading] = useState(false); // AJOUTÉ : État pour le loader

  // AJOUTÉ : On récupère l'App ID et la clé API depuis le service
  const apiKey = getApiKey();
  const appId = getAppId();

  const synchronizeDataModel = async () => {
    // AJOUTÉ : Vérification des identifiants
    if (!appId || !apiKey) {
      setError('Error: App ID and API Key are missing. Please add them in the "Credentials" section.');
      return;
    }
    setLog('Fetching index settings...');
    setError('');

    try {
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);
      const settings = await index.getSettings();
      if (settings.attributeForDistinct) {
        setDistinctAttribute(settings.attributeForDistinct);
        setLog(`Distinct attribute found: ${settings.attributeForDistinct}`);
      } else {
        setDistinctAttribute('');
        setLog('No distinct attribute defined in index settings.');
      }
    } catch (err) {
      setError('Error during synchronization: ' + err.message);
    }
  };

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
      const client = algoliasearch(appId, apiKey);
      const index = client.initIndex(indexName);

      const codes = productCodes
        .split('\n')
        .map(code => code.trim())
        .filter(code => code);

      const allObjects = [];
      await index.browseObjects({
        query: '',
        batch: (batch) => {
          allObjects.push(...batch);
        },
      });
      
      if (allObjects.length === 0) {
        throw new Error("No objects found in the index. The index might be empty or does not exist.");
      }

      let filteredObjects = allObjects;
      // Ne filtrer que si des codes sont fournis et qu'un attribut distinct existe
      if (codes.length > 0 && distinctAttribute) {
        filteredObjects = allObjects.filter(obj => codes.includes(obj[distinctAttribute]));
      }
      
      if (filteredObjects.length === 0) {
        setLog('No objects matched the provided codes. An empty CSV file will be generated.');
      }

      const attributes = Object.keys(allObjects[0]); // Utiliser tous les attributs du premier objet comme référence
      const csvRows = [attributes.join(';')];
      
      filteredObjects.forEach(obj => {
        const row = attributes.map(attr => {
          const value = obj[attr];
          if (value === null || value === undefined) return '';
          // Gérer les objets et les tableaux pour un export CSV propre
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
      link.setAttribute('download', `algolia_export_${indexName}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLog(`${filteredObjects.length} records successfully exported.`);
    } catch (err) {
      setError('Error generating CSV file: ' + err.message);
    } finally {
      setIsLoading(false); // AJOUTÉ : Arrêter le loader
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Export By Distinct Attribute</h1>

      <InfoBlock title="About this feature">
        This tool allows you to export records from an Algolia index.
        <br /><br />
        👉 Enter your <strong>Index Name</strong>, then click <strong>“Sync Data Model”</strong> to automatically detect if a distinct attribute is used.
        <br /><br />
        ✅ If a distinct attribute is found, you can filter the export by pasting a list of codes. If no codes are provided, the entire index will be exported.
        <br /><br />
        📄 The export uses Algolia’s <code>browseObjects</code> method, which does not count towards your search operations quota and retrieves all attributes.
      </InfoBlock>

      {/* MODIFIÉ : Le bloc de configuration est simplifié */}
      <SectionBlock title="Index Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SUPPRIMÉ : Le champ de saisie pour l'App ID a été retiré */}
          <div>
            <label>Index Name:</label>
            <input type="text" value={indexName} onChange={(e) => setIndexName(e.target.value)} style={{ width: '75%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd', marginLeft: '15px' }} />
          </div>
          <div>
            <StyledButton onClick={synchronizeDataModel} label="Sync Data Model" icon="🔄" color="#2c3e50" />
          </div>
        </div>
      </SectionBlock>

      {/* MODIFIÉ : La condition d'affichage est plus flexible */}
      {(log.includes('Distinct attribute') || log.includes('No distinct attribute')) && (
        <SectionBlock title="Export Products">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {distinctAttribute ? (
              <label>Paste Codes to Filter (based on: {distinctAttribute}). Leave empty to export all.</label>
            ) : (
              <label>No distinct attribute. The entire index will be exported.</label>
            )}
            
            {/* Le textarea est toujours affiché pour permettre l'export filtré si l'attribut est connu */}
            <textarea
              rows={10}
              value={productCodes}
              onChange={(e) => setProductCodes(e.target.value)}
              placeholder="One code per line"
              style={{ width: '97%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              disabled={!distinctAttribute} // Désactivé si aucun attribut distinct n'est trouvé
            />
            <StyledButton onClick={handleGenerateFile} label="Export CSV" icon="📁" color="#8fbc8f" />
          </div>
        </SectionBlock>
      )}

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default ExportData;