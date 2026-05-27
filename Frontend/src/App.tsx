import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import SearchPage from './pages/SearchPage/SearchPage';
import CollectionPage from './pages/CollectionsPage/CollectionPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import IndexingPage from './pages/IndexingPage/IndexingPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import SearchResults from './pages/SearchResults/SearchResults';
import DocumentCard from './pages/DocumentCard/DocumentCard';
import CollectionDetail from "./pages/CollectionDetail/CollectionDetail";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/collections" element={<CollectionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/indexing" element={<IndexingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search/results" element={<SearchResults />} />
        <Route path="/document/:id" element={<DocumentCard />} />
        <Route path="/collection/:collectionName" element={<CollectionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;