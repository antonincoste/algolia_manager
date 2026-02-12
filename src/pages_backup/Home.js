// src/pages/Home.js
import React from 'react';
import InfoBlock from '../components/InfoBlock';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Algolia Management Tool</h1>

      <InfoBlock title="About this application">
        <p>
          This tool helps you perform advanced exports on your Algolia indexes all from a single interface.
        </p>

        <p>
          Before using any feature, make sure to set your API Key (at the bottom of the sidebar).<br />
          A <strong>Write API Key</strong> is required for update operations
        </p>

        <p style={{ fontWeight: 'bold', fontSize: '16px', color: 'red', marginTop: '20px' }}>
          Your data is never stored or transmitted to any server — all operations are handled locally in your browser.
        </p>

        <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#666', marginTop: '20px' }}>
          Disclaimer: This tool is not affiliated with or endorsed by Algolia.
        </p>
      </InfoBlock>

    </div>
  );
};

export default Home;
