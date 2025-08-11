// src/services/sessionService.js

// --- Fonctions pour la Clé API ---
export const getApiKey = () => sessionStorage.getItem('algoliaApiKey');
export const setApiKey = (key) => sessionStorage.setItem('algoliaApiKey', key);

// --- NOUVELLES fonctions pour l'App ID ---
export const getAppId = () => sessionStorage.getItem('algoliaAppId');
export const setAppId = (id) => sessionStorage.setItem('algoliaAppId', id);

// --- NOUVELLE fonction pour tout supprimer d'un coup ---
export const removeCredentials = () => {
  sessionStorage.removeItem('algoliaApiKey');
  sessionStorage.removeItem('algoliaAppId');
};