import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCards from '../components/SummaryCards';
import MarginBinsChart from '../components/MarginBinsChart';
import AllianceSummary from '../components/AllianceSummary';
import PartyWise from '../components/PartyWise';
import AllianceAnalysis from '../components/AllianceAnalysis';
import './HomePage.css';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const HomePage = ({ results }) => {
  const [allianceSummary, setAllianceSummary] = useState(null);

  useEffect(() => {
    fetchAllianceSummary();
    const interval = setInterval(fetchAllianceSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllianceSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/alliance-wise`);
      setAllianceSummary(response.data);
    } catch (error) {
      console.error('Error fetching alliance summary:', error);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <SummaryCards summary={results.summary} />
        {allianceSummary && (
          <div className="home-chart-section">
            <AllianceSummary allianceData={allianceSummary} />
          </div>
        )}
        <div className="home-chart-section">
          <MarginBinsChart states={results.states} />
        </div>
        <PartyWise />
        <AllianceAnalysis />
      </div>
    </div>
  );
};

export default HomePage;

