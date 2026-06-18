import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import SearchPage from './pages/SearchPage/SearchPage';
import CollectionPage from './pages/CollectionsPage/CollectionPage';
import CollectionsListPage from './pages/CollectionsListPage/CollectionsListPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import IndexingPage from './pages/IndexingPage/IndexingPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import SearchResults from './pages/SearchResults/SearchResults';
import DocumentCard from './pages/DocumentCard/DocumentCard';
import CollectionDetail from "./pages/CollectionDetail/CollectionDetail";
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import { NotificationsProvider } from './context/NotificationsContext';
import { session } from './utils/session';
import './App.css';

function AppRoutes() {
  const location = useLocation();
  const isLoggedIn = !!session.getUserId();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/archive" element={<CollectionPage />} />
      <Route path="/collections" element={<CollectionsListPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/indexing" element={<IndexingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/search/results" element={<SearchResults key={location.key} />} />
      <Route path="/document/:id" element={<DocumentCard />} />
      <Route path="/collection/:collectionId" element={<CollectionDetail />} />
      <Route path="/notifications" element={<NotificationsPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <NotificationsProvider>
        <AppRoutes />
      </NotificationsProvider>
    </Router>
  );
}

export default App;