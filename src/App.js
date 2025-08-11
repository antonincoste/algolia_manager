import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import ExportDataByFilters from './pages/ExportDataByFilters';
import ExportDataByIds from './pages/ExportDataByIds';
import ExportByDistinct from './pages/ExportByDistinct';
import OfflineProducts from './pages/OfflineProducts';
import CopyRecommendations from './pages/CopyRecommendations';
import GlobalStyle from './styles/GlobalStyle';
import UpdateAttributes from './pages/UpdateAttributes';
import UpdateByDistinct from './pages/UpdateByDistinct';
import CopyData from './pages/CopyData';


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
            <Route path="/exportbyids" element={<ExportDataByIds />} />
            <Route path="/exportbydistinct" element={<ExportByDistinct />} />
            <Route path="/exportbyfilters" element={<ExportDataByFilters />} />
            <Route path="/update" element={<UpdateAttributes />} />
            <Route path="/updatebydistinct" element={<UpdateByDistinct />} />
            <Route path="/offline" element={<OfflineProducts />} />
            <Route path="/copy" element={<CopyRecommendations />} />
            <Route path="/copy-data" element={<CopyData />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;