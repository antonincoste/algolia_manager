// src/pages/DeleteObjects.js
import React, { useState } from 'react';
import algoliasearch from 'algoliasearch';
import { getApiKey, getAppId } from '../services/sessionService';
import SectionBlock from '../components/SectionBlock';
import InfoBlock from '../components/InfoBlock';
import StyledButton from '../components/StyledButton';
import FullPageLoader from '../components/FullPageLoader';

const textareaStyle = { width: '97%', padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' };

const DeleteObjects = () => {
  const [indexNames, setIndexNames] = useState('');
  const [idsToDelete, setIdsToDelete] = useState('');
  const [deleteByDistinct, setDeleteByDistinct] = useState(false);
  
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const globalAppId = getAppId();
  const globalApiKey = getApiKey();

  // Remplacez votre fonction handleDelete par celle-ci

  // Remplacez votre fonction handleDelete par celle-ci

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
          // Mode : Suppression par attribut distinct
          const settings = await index.getSettings();
          const distinctAttr = settings.attributeForDistinct;

          if (!distinctAttr) {
            fullLog += `  ❌ Error: Index '${indexName}' has no 'attributeForDistinct' configured. Skipping.\n`;
            setLog(fullLog);
            continue;
          }

          fullLog += `  Found distinct attribute: '${distinctAttr}'. Fetching all objectIDs for provided values using browseObjects...\n`;
          setLog(fullLog);
          
          let allFoundObjectIDs = [];
          
          // MODIFIÉ : Remplacement de search par browseObjects
          for (const value of values) {
            const tempHits = [];
            await index.browseObjects({ 
              filters: `${distinctAttr}:"${value}"`,
              attributesToRetrieve: ['objectID'],
              batch: (batch) => {
                tempHits.push(...batch);
              }
            });
            // On ajoute les objectIDs trouvés pour cette valeur à la liste globale
            allFoundObjectIDs.push(...tempHits.map(hit => hit.objectID));
          }
          
          objectIDs_to_delete = [...new Set(allFoundObjectIDs)]; // Dédoublonnage final

        } else {
          // Mode : Suppression par objectID (inchangé)
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

  // Styles pour le toggle
  const toggleStyle = {
    appearance: 'none',
    width: '50px',
    height: '25px',
    backgroundColor: deleteByDistinct ? '#e74c3c' : '#ccc',
    borderRadius: '15px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const toggleCircleStyle = {
    content: '',
    position: 'absolute',
    top: '2px',
    left: deleteByDistinct ? '26px' : '2px',
    width: '21px',
    height: '21px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'left 0.2s',
  };

  return (
    <div>
      <FullPageLoader isLoading={isLoading} />
      <h1>Delete Objects</h1>
      <InfoBlock title="⚠️ Warning: Destructive Action">
        This tool permanently deletes objects from your Algolia indexes. This action **cannot be undone**.
        <br/><br/>
        Please double-check your index names and the IDs you want to delete before proceeding.
      </InfoBlock>

      <SectionBlock title="Target Indexes">
        <textarea
          placeholder="Enter index names, separated by lines, commas, or spaces..."
          value={indexNames}
          onChange={(e) => setIndexNames(e.target.value)}
          rows={4}
          style={textareaStyle}
        />
      </SectionBlock>

      <SectionBlock title="Objects to Delete">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <label htmlFor="delete-by-distinct-toggle">Delete by Distinct Attribute:</label>
          <div id="delete-by-distinct-toggle" style={toggleStyle} onClick={() => setDeleteByDistinct(!deleteByDistinct)}>
            <div style={toggleCircleStyle}></div>
          </div>
        </div>
        <label>
          {deleteByDistinct
            ? "Distinct Attribute Values to Delete:"
            : "ObjectIDs to Delete:"
          }
        </label>
        <textarea
          placeholder={deleteByDistinct ? "Paste distinct attribute values here..." : "Paste objectIDs here..."}
          value={idsToDelete}
          onChange={(e) => setIdsToDelete(e.target.value)}
          rows={10}
          style={textareaStyle}
        />
      </SectionBlock>
      
      <SectionBlock title="Actions">
        <StyledButton onClick={handleDelete} label="Permanently Delete Objects" icon="🗑️" color="#c0392b" />
      </SectionBlock>

      {error && <div style={{ color: 'red', marginTop: '20px', whiteSpace: 'pre-line' }}>{error}</div>}
      {log && <div style={{ color: 'green', marginTop: '20px', whiteSpace: 'pre-line' }}>{log}</div>}
    </div>
  );
};

export default DeleteObjects;