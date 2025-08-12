import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import ExportDataByFilters from './pages/ExportDataByFilters';
import ExportByAttribute from './pages/ExportByAttribute';
import OfflineProducts from './pages/OfflineProducts';
import CopyRecommendations from './pages/CopyRecommendations';
import GlobalStyle from './styles/GlobalStyle';
import UpdateByAttribute from './pages/UpdateByAttributes';
import CopyData from './pages/CopyData';
import GenerateFakeEvents from './pages/GenerateFakeEvents';
import DeleteObjects from './pages/DeleteObjects';
import CompareIndexesConfig from './pages/CompareIndexesConfig';


// NOUVEAU : Style pour le conteneur du contenu principal
const mainContentStyle = {
  marginLeft: '280px', // Doit correspondre à la largeur de votre Sidebar
  padding: '20px',
  width: 'calc(100% - 250px)' // Optionnel, mais recommandé pour que le contenu occupe le reste de l'espace
};

const App = () => {
  return (
    <Router>
      <GlobalStyle />
      
      {/* MODIFIÉ : La structure globale gère maintenant la Sidebar et le contenu principal côte à côte */}
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        <main style={mainContentStyle}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/export-by-attribute" element={<ExportByAttribute />} />
            <Route path="/exportbyfilters" element={<ExportDataByFilters />} />
            <Route path="/update-by-attribute" element={<UpdateByAttribute />} />
            <Route path="/offline" element={<OfflineProducts />} />
            <Route path="/copy" element={<CopyRecommendations />} />
            <Route path="/copy-data" element={<CopyData />} />
            <Route path="/generate-events" element={<GenerateFakeEvents />} />
            <Route path="/delete-objects" element={<DeleteObjects />} />
            <Route path="/compare-configs" element={<CompareIndexesConfig />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;