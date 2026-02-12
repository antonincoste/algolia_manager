import React from 'react';
import './FullPageLoader.css'; // Nous allons créer ce fichier CSS juste après

const FullPageLoader = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
      <p style={{ color: 'white', marginTop: '20px', fontSize: '1.2em' }}>Processing, do not close or refresh the page...</p>
    </div>
  );
};

export default FullPageLoader;