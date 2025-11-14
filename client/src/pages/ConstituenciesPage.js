import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StateWiseTable from '../components/StateWiseTable';
import LoadingSpinner from '../components/LoadingSpinner';
import './ConstituenciesPage.css';

// In production, use relative URLs (same domain)
// In development, use localhost
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const ConstituenciesPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/results`);
      setResults(response.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
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
    <div className="constituencies-page">
      <div className="constituencies-container">
        {results && <StateWiseTable states={results.states} />}
        {error && (
          <div className="error-banner">
            ⚠️ Connection issue: {error}. Showing last cached data.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstituenciesPage;

