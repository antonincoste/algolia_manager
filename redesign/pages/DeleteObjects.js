// src/pages/DeleteObjects.js
import React, { useState } from 'react';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';
import PageHeader from '../components/PageHeader';
import { 
  Textarea, 
  Label, 
  FormGroup, 
  Hint,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  ToggleThumb
} from '../components/FormElements';

const DeleteObjects = () => {
  const [indexNames, setIndexNames] = useState('');
  const [idsToDelete, setIdsToDelete] = useState('');
  const [deleteByDistinct, setDeleteByDistinct] = useState(false);
  
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const globalAppId = getAppId();
  const globalApiKey = getApiKey();

  const handleDelete = async () => {
    if (!indexNames || !idsToDelete) {
      setError('Please provide at least one index and one ID to delete.');
      return;
    }
    
    if (!window.confirm("ARE YOU SURE you want to permanently delete these objects? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError('');
    let fullLog = 'Starting deletion process...\n';
    setLog(fullLog);

    try {
      const client = algoliasearch(globalAppId, globalApiKey);
      const targetIndexes = indexNames.split(/[\s,;|\n]+/).filter(Boolean);
      const values = idsToDelete.split(/[\s,;|\n]+/).filter(Boolean);

      for (const indexName of targetIndexes) {
        fullLog += `\nProcessing index: ${indexName}...\n`;
        setLog(fullLog);

        const index = client.initIndex(indexName);
        let objectIDs_to_delete = [];

        if (deleteByDistinct) {
          const settings = await index.getSettings();
          const distinctAttr = settings.attributeForDistinct;

          if (!distinctAttr) {
            fullLog += `  ❌ Error: Index '${indexName}' has no 'attributeForDistinct' configured. Skipping.\n`;
            setLog(fullLog);
            continue;
          }

          fullLog += `  Found distinct attribute: '${distinctAttr}'. Fetching all objectIDs...\n`;
          setLog(fullLog);
          
          let allFoundObjectIDs = [];
          
          for (const value of values) {
            const tempHits = [];
            await index.browseObjects({ 
              filters: `${distinctAttr}:"${value}"`,
              attributesToRetrieve: ['objectID'],
              batch: (batch) => {
                tempHits.push(...batch);
              }
            });
            allFoundObjectIDs.push(...tempHits.map(hit => hit.objectID));
          }
          
          objectIDs_to_delete = [...new Set(allFoundObjectIDs)];

        } else {
          objectIDs_to_delete = values;
        }

        if (objectIDs_to_delete.length > 0) {
          fullLog += `  Attempting to delete ${objectIDs_to_delete.length} object(s)...\n`;
          setLog(fullLog);
          await index.deleteObjects(objectIDs_to_delete);
          fullLog += `  ✅ Success: Deletion task created for index '${indexName}'.\n`;
          setLog(fullLog);
        } else {
          fullLog += `  ℹ️ No matching objects found to delete in this index.\n`;
          setLog(fullLog);
        }
      }

      setLog(fullLog + '\nAll operations completed.');
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      
      <PageHeader 
        title="Delete Objects"
        subtitle="Permanently remove objects from your Algolia indexes"
      />

      <InfoBlock title="⚠️ Warning: Destructive Action" icon="🗑️">
        This tool permanently deletes objects from your Algolia indexes. This action <strong>cannot be undone</strong>.
        <br/><br/>
        Please double-check your index names and the IDs you want to delete before proceeding.
      </InfoBlock>

      <SectionBlock title="Target Indexes">
        <FormGroup>
          <Label>Index Names</Label>
          <Textarea
            placeholder="Enter index names, separated by lines, commas, or spaces..."
            value={indexNames}
            onChange={(e) => setIndexNames(e.target.value)}
            rows={4}
          />
        </FormGroup>
      </SectionBlock>

      <SectionBlock title="Objects to Delete">
        <ToggleContainer style={{ marginBottom: '20px' }}>
          <ToggleLabel $active={!deleteByDistinct}>By objectID</ToggleLabel>
          <ToggleSwitch 
            $active={deleteByDistinct} 
            onClick={() => setDeleteByDistinct(!deleteByDistinct)}
            style={{ backgroundColor: deleteByDistinct ? 'var(--danger-500)' : 'var(--gray-300)' }}
          >
            <ToggleThumb $active={deleteByDistinct} />
          </ToggleSwitch>
          <ToggleLabel $active={deleteByDistinct}>By Distinct Attribute</ToggleLabel>
        </ToggleContainer>

        <FormGroup>
          <Label>
            {deleteByDistinct
              ? "Distinct Attribute Values to Delete"
              : "ObjectIDs to Delete"
            }
          </Label>
          <Textarea
            placeholder={deleteByDistinct ? "Paste distinct attribute values here..." : "Paste objectIDs here..."}
            value={idsToDelete}
            onChange={(e) => setIdsToDelete(e.target.value)}
            rows={10}
          />
        </FormGroup>
      </SectionBlock>
      
      <SectionBlock title="Actions">
        <StyledButton onClick={handleDelete} label="Permanently Delete Objects" icon="🗑️" variant="danger" size="lg" />
      </SectionBlock>

      {error && <Hint className="error" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</Hint>}
      {log && <Hint className="success" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</Hint>}
    </div>
  );
};

export default DeleteObjects;