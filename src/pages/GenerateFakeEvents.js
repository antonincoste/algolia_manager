// src/pages/GenerateFakeEvents.js
import React, { useState } from 'react';
import { trackGenerateFakeEvents, trackError } from '../services/analyticsService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import PageHeader from '../components/PageHeader';
import { Textarea, Input, Label, FormGroup, Hint } from '../components/FormElements';

const GenerateFakeEvents = () => {
  const [objectIds, setObjectIds] = useState('');
  const [numEvents, setNumEvents] = useState(1000);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');

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

        const randomDaysAgo = Math.random() * 90;
        const eventDate = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
        const timestamp = eventDate.toISOString();
        
        generatedEvents.push([eventName, eventType, timestamp, objectId, userToken]);
      }

      const headers = ["eventName", "eventType", "timestamp", "objectID", "userToken"];
      const csvRows = [
        headers.join(';'),
        ...generatedEvents.map(row => row.join(';'))
      ];
      const csvContent = csvRows.join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'algolia_fake_events.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      trackGenerateFakeEvents(numEvents);
      setLog(`✅ Successfully generated and downloaded algolia_fake_events.csv with ${numEvents} events.`);

    } catch (err) {
      trackError('generate_fake_events', err.message, 'generation_error');
      setError('An error occurred during file generation: ' + err.message);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Fake Events Generator"
        subtitle="Create sample events for testing Algolia Recommend"
      />

      <InfoBlock title="About this feature" icon="⚡">
        This tool helps you create a fake events file for testing purposes, especially for <strong>Algolia Recommend</strong>.
        <br/><br/>
        Algolia's recommendation models learn from user events (views, clicks, conversions). This generator creates a CSV file with random events based on the objectIDs you provide. You can then upload this file to Algolia to train your models.
      </InfoBlock>

      <SectionBlock title="Configuration">
        <FormGroup>
          <Label>ObjectIDs (separated by space, comma, or new line)</Label>
          <Textarea
            placeholder="Paste objectIDs here..."
            value={objectIds}
            onChange={(e) => setObjectIds(e.target.value)}
            rows={10}
          />
        </FormGroup>

        <FormGroup>
          <Label>Number of Events to Generate (1 - 10,000)</Label>
          <Input
            type="number"
            min="1"
            max="10000"
            value={numEvents}
            onChange={(e) => setNumEvents(parseInt(e.target.value, 10))}
            style={{ width: '200px' }}
          />
        </FormGroup>
      </SectionBlock>

      <SectionBlock title="Actions">
        <StyledButton onClick={handleGenerate} label="Generate CSV File" icon="🪄" variant="primary" size="lg" />
      </SectionBlock>

      {error && <Hint className="error" style={{ marginTop: '20px' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px' }}>{log}</Hint>}
    </div>
  );
};

export default GenerateFakeEvents;