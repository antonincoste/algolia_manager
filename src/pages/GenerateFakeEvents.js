// src/pages/GenerateFakeEvents.js
import React, { useState } from 'react';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';

const textareaStyle = { width: '97%', padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' };
const inputStyle = { width: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };

const GenerateFakeEvents = () => {
  const [objectIds, setObjectIds] = useState('');
  const [numEvents, setNumEvents] = useState(1000);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');

  // Traduction de la logique du script Python en JavaScript
  const handleGenerate = () => {
    setError('');
    setLog('');

    const ids = objectIds.split(/[\s,;|\n]+/).filter(Boolean);
    if (ids.length === 0) {
      setError('Please provide at least one objectID.');
      return;
    }

    if (numEvents < 1 || numEvents > 10000) {
      setError('Please enter a number of events between 1 and 10,000.');
      return;
    }

    setLog(`Generating ${numEvents} events...`);

    try {
      const eventTypes = ["click", "view", "conversion"];
      const eventNames = {
        click: "Product Click",
        view: "Product View",
        conversion: "Product Conversion"
      };
      const userTokens = Array.from({ length: 100 }, (_, i) => `user-token-${i + 1}`);
      
      const generatedEvents = [];

      for (let i = 0; i < numEvents; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const eventName = eventNames[eventType];
        const userToken = userTokens[Math.floor(Math.random() * userTokens.length)];
        const objectId = ids[Math.floor(Math.random() * ids.length)];

        // Génère un timestamp aléatoire dans les 90 derniers jours
        const randomDaysAgo = Math.random() * 90;
        const eventDate = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
        const timestamp = eventDate.toISOString();
        
        generatedEvents.push([eventName, eventType, timestamp, objectId, userToken]);
      }

      // Création du contenu CSV
      const headers = ["eventName", "eventType", "timestamp", "objectID", "userToken"];
      const csvRows = [
        headers.join(';'),
        ...generatedEvents.map(row => row.join(';'))
      ];
      const csvContent = csvRows.join('\n');
      
      // Logique de téléchargement du fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'algolia_fake_events.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLog(`Successfully generated and downloaded algolia_fake_events.csv with ${numEvents} events.`);

    } catch (err) {
      setError('An error occurred during file generation: ' + err.message);
    }
  };

  return (
    <div>
      <h1>Fake Events Generator</h1>
      <InfoBlock title="About this feature">
        This tool helps you create a fake events file for testing purposes, especially for <b>Algolia Recommend</b>.
        <br/><br/>
        Algolia's recommendation models learn from user events (views, clicks, conversions). This generator creates a CSV file with random events based on the objectIDs you provide. You can then upload this file to Algolia to train your models.
      </InfoBlock>

      <SectionBlock title="Configuration">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>ObjectIDs (separated by space, comma, or new line):</label>
            <textarea
              placeholder="Paste objectIDs here..."
              value={objectIds}
              onChange={(e) => setObjectIds(e.target.value)}
              rows={10}
              style={textareaStyle}
            />
          </div>
          <div>
            <label>Number of Events to Generate (1 - 10,000):</label><br/>
            <input
              type="number"
              min="1"
              max="10000"
              value={numEvents}
              onChange={(e) => setNumEvents(parseInt(e.target.value, 10))}
              style={inputStyle}
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleGenerate} label="Generate CSV File" icon="🪄" color="#28a745" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px' }}>{log}</div>}
    </div>
  );
};

export default GenerateFakeEvents;