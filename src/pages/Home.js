// src/pages/Home.js
import React from 'react';
import InfoBlock from '../components/InfoBlock';

const Home = () => {
  return (
    <div style={{ marginLeft: '260px', padding: '20px' }}>
      <h1>Welcome to the Algolia Management Tool</h1>

      <InfoBlock title="About this application">
        <p>
          This tool allows you to perform advanced operations on your Algolia indexes,
          such as exporting objects, modifying attributes, syncing data models, and more.
        </p>
        <p>
          Each section in the sidebar corresponds to a specific feature. You can:
        </p>
        <ul>
          <li>Export product data based on online status, object ID, or distinct attribute values</li>
          <li>Update existing objects using a CSV import</li>
          <li>Manage recommendation rules and offline product status</li>
        </ul>
        <p>
          Make sure your API Key is set from the bottom of the sidebar before using any functionality.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#666', marginTop: '20px' }}>
          Disclaimer: This tool is not affiliated with or endorsed by Algolia.
        </p>
      </InfoBlock>
    </div>
  );
};

export default Home;
