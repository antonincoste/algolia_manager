import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/Sidebar.js';
import Home from './pages/Home.js';
import ExportDataByFilters from './pages/ExportDataByFilters.js';
import ExportByAttribute from './pages/ExportByAttribute.js';
import OfflineProducts from './pages/OfflineProducts.js';
import CopyRecommendations from './pages/CopyRecommendations.js';
import GlobalStyle from './styles/GlobalStyle.js';
import UpdateByAttribute from './pages/UpdateByAttributes.js';
import CopyData from './pages/CopyData.js';
import GenerateFakeEvents from './pages/GenerateFakeEvents.js';
import DeleteObjects from './pages/DeleteObjects.js';
import CompareIndexesConfig from './pages/CompareIndexesConfig.js';
import TopNoResultSearches from './pages/TopNoResultSearches.js';
import QueryDecoder from './pages/QueryDecoder.js';
import CloneIndex from './pages/CloneIndex.js';
import RecommendTester from './pages/RecommendTester.js';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  margin-left: 280px;
  padding: 32px 40px;
  width: calc(100% - 280px);
  min-height: 100vh;
  background-color: var(--gray-100);
`;

const App = () => {
  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <Sidebar />
        <MainContent>
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
            <Route path="/no-result-searches" element={<TopNoResultSearches />} />
            <Route path="/query-decoder" element={<QueryDecoder />} />
            <Route path="/clone-index" element={<CloneIndex />} />
            <Route path="/recommend-tester" element={<RecommendTester />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

export default App;