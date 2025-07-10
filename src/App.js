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

const App = () => {
  return (
    <Router>
      <GlobalStyle />
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exportbyids" element={<ExportDataByIds />} />
        <Route path="/exportbydistinct" element={<ExportByDistinct />} />
        <Route path="/exportbyfilters" element={<ExportDataByFilters />} />
        <Route path="/update" element={<UpdateAttributes />} />
        <Route path="/updatebydistinct" element={<UpdateByDistinct />} />
        <Route path="/offline" element={<OfflineProducts />} />
        <Route path="/copy" element={<CopyRecommendations />} />
      </Routes>
    </Router>
  );
};

export default App;
