// src/pages/CopyRecommendations.js
import React, { useState } from 'react';
import { getApiKey } from '../services/sessionService';
import axios from 'axios';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { Input, Select, Textarea, Label, FormGroup, Hint } from '../components/FormElements';

const CopyRecommendations = () => {
  const [appId, setAppId] = useState('');
  const [sourceIndexName, setSourceIndexName] = useState('');
  const [sourceModelName, setSourceModelName] = useState('related-products');
  const [targetIndexesInput, setTargetIndexesInput] = useState('');
  const [mode, setMode] = useState('merge');
  const [errorMessage, setErrorMessage] = useState('');
  const [logOutput, setLogOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = getApiKey();

  const handleCopyRecommendations = async () => {
    setErrorMessage('');
    setLogOutput('');

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

    setIsLoading(true);

    try {
      const targetIndexes = targetIndexesInput.split('\n').map(line => line.trim()).filter(line => line);

      const rules = await listRecommendRules(sourceIndexName, sourceModelName);
      if (!rules.length) {
        setErrorMessage(`No rules found for the source model: ${sourceModelName}`);
        setIsLoading(false);
        return;
      }

      let log = `Log started at: ${new Date().toLocaleString()}\n\n`;

      for (const targetIndexName of targetIndexes) {
        log += `Processing target index: ${targetIndexName} in ${mode} mode\n`;

        if (mode === 'replace') {
          await clearRecommendRules(targetIndexName);
        }

        await pushRecommendRules(rules, targetIndexName);

        log += `✅ Successfully processed target index: ${targetIndexName}\n\n`;
      }

      log += `Log finished at: ${new Date().toLocaleString()}\n`;
      setLogOutput(log);
    } catch (error) {
      setErrorMessage(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
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
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Copier les Recommandations"
        subtitle="Dupliquer les règles de recommandation entre indexes"
      />

      <InfoBlock title="À propos de cette fonctionnalité" icon="📋">
        Cette page vous permet de copier les règles de recommandations d'un index source vers plusieurs indexes cibles.
        Vous pouvez choisir le modèle source, le mode de copie et spécifier les indexes cibles.
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
          <Label>Index Source</Label>
          <Input
            type="text"
            value={sourceIndexName}
            onChange={(e) => setSourceIndexName(e.target.value)}
            placeholder="Nom de l'index source"
          />
        </FormGroup>

        <FormGroup>
          <Label>Modèle Source</Label>
          <Select
            value={sourceModelName}
            onChange={(e) => setSourceModelName(e.target.value)}
          >
            <option value="related-products">related-products</option>
            <option value="frequently-bought-together">frequently-bought-together</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Mode</Label>
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="merge">merge</option>
            <option value="replace">replace</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Indexes Cibles</Label>
          <Textarea
            value={targetIndexesInput}
            onChange={(e) => setTargetIndexesInput(e.target.value)}
            rows={6}
            placeholder="Entrez chaque index cible sur une nouvelle ligne"
          />
        </FormGroup>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton
          onClick={handleCopyRecommendations}
          label="Copier les Recommandations"
          icon="📋"
          variant="primary"
          size="lg"
        />
      </SectionBlock>

      {logOutput && (
        <SectionBlock title="Résultat du Log">
          <Textarea
            value={logOutput}
            readOnly
            rows={10}
            style={{ backgroundColor: 'var(--gray-900)', color: '#f8f8f2' }}
          />
        </SectionBlock>
      )}

      {errorMessage && <Hint className="error" style={{ marginTop: '20px' }}>{errorMessage}</Hint>}
    </div>
  );
};

export default CopyRecommendations;