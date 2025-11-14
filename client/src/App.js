import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ChangeNotification from './components/ChangeNotification';
import HomePage from './pages/HomePage';
import ConstituenciesPage from './pages/ConstituenciesPage';
import PartyAnalysisPage from './pages/PartyAnalysisPage';
import AllianceAnalysisPage from './pages/AllianceAnalysisPage';
import RefreshHistoryPage from './pages/RefreshHistoryPage';
import './App.css';

// In production, use relative URLs (same domain)
// In development, use localhost
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const fetchResults = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      }
      
      const url = forceRefresh 
        ? `${API_BASE}/api/results?force=true`
        : `${API_BASE}/api/results`;
      
      const response = await axios.get(url);
      setResults(response.data);
      setLastUpdate(new Date());
      setError(null);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.message);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchResults();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !results) {
    return <LoadingSpinner />;
  }

  if (error && !results) {
    return (
      <div className="error-container">
        <h2>⚠️ Error Loading Results</h2>
        <p>{error}</p>
        <button onClick={fetchResults} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header lastUpdate={lastUpdate} onRefresh={() => fetchResults(true)} refreshing={refreshing} />
        {showNotification && lastUpdate && (
          <ChangeNotification 
            lastUpdate={lastUpdate} 
            onDismiss={() => setShowNotification(false)}
          />
        )}
        {error && (
          <div className="error-banner">
            ⚠️ Connection issue: {error}. Showing last cached data.
          </div>
        )}
        <Routes>
          <Route path="/" element={results ? <HomePage results={results} /> : <LoadingSpinner />} />
          <Route path="/constituencies" element={<ConstituenciesPage />} />
          <Route path="/party-analysis" element={<PartyAnalysisPage />} />
          <Route path="/alliance-analysis" element={<AllianceAnalysisPage />} />
          <Route path="/refresh-history" element={<RefreshHistoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

