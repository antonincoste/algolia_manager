export const setApiKey = (apiKey) => {
    sessionStorage.setItem('algoliaApiKey', apiKey);
  };
  
  export const getApiKey = () => {
    return sessionStorage.getItem('algoliaApiKey');
  };
  