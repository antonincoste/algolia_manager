import { algoliasearch } from 'algoliasearch';

const algoliaClient = (appId, apiKey) => {
  return algoliasearch(appId, apiKey);
};

// Exemple de fonction pour exporter des données
export const exportData = (appId, apiKey, indexName, filters) => {
  const client = algoliaClient(appId, apiKey);
  const index = client.initIndex(indexName);

  return index.search('', { filters })
    .then(({ hits }) => {
      return hits;  // Vous pouvez convertir cela en CSV ou le manipuler selon les besoins
    });
};

// Autres services pour les produits offline et copier les recommandations
