// src/pages/Home.js
import React from 'react';
import InfoBlock from '../components/InfoBlock';

const Home = () => {
  return (
    <div style={{ marginLeft: '260px', padding: '20px' }}>
      <h1>Welcome to the Algolia Management Tool</h1>

      <InfoBlock title="About this application">
        <p>
          This tool helps you perform advanced operations on your Algolia indexes — such as exporting data, updating attributes, and syncing models — all from a single interface.
        </p>

        <p>
          Use the menu on the left to:
        </p>
        <ul>
          <li>Export product data based on filters, object IDs, or distinct attribute values</li>
          <li>Update existing records by importing a CSV file</li>
        </ul>

        <p>
          Before using any feature, make sure to set your API Key (at the bottom of the sidebar).<br />
          A <strong>Write API Key</strong> is required for update operations.
        </p>

        <p style={{ fontWeight: 'bold', fontSize: '16px', color: 'red', marginTop: '20px' }}>
          Your data is never stored or transmitted to any server — all operations are handled locally in your browser.
        </p>

        <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#666', marginTop: '20px' }}>
          Disclaimer: This tool is not affiliated with or endorsed by Algolia.
        </p>
      </InfoBlock>

    <br /><p>The tool is free to use, but if you enjoyed it, you can say thanks here. Thanks</p>
    <a href="https://www.buymeacoffee.com/antonincoste" target='_blank'><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=antonincoste&button_colour=5F7FFF&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00" /></a>

    </div>
  );
};

export default Home;
