import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';
import './RefreshHistoryPage.css';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const RefreshHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/refresh-history`);
      setHistory(response.data.history || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching refresh history:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="history-loading">Loading refresh history...</div>;
  }

  return (
    <div className="refresh-history-page">
      <div className="refresh-history-container">
        <h2 className="history-title">🔄 Refresh History & Change Tracking</h2>
        
        {history.length === 0 ? (
          <div className="no-history">
            <p>No refresh history available yet.</p>
            <p>Click the "🔄 Refresh" button in the header to start tracking changes.</p>
            <p>All refreshes (with or without changes) will be recorded here.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((update, index) => (
              <div 
                key={index} 
                className={`history-item ${(update.changes && update.changes.length > 0) ? 'has-changes' : 'no-changes'}`}
                onClick={() => setSelectedUpdate(selectedUpdate === index ? null : index)}
              >
                <div className="history-header">
                  <div className="history-time">
                    <span className="time-ago">{formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}</span>
                    <span className="time-exact">{format(new Date(update.timestamp), 'PPpp')}</span>
                  </div>
                  <div className="history-summary">
                    {update.isFirstUpdate ? (
                      <span className="summary-badge initial">Initial Load</span>
                    ) : update.changes.length > 0 ? (
                      <span className="summary-badge changes">{update.summary}</span>
                    ) : (
                      <span className="summary-badge no-changes">No Changes</span>
                    )}
                  </div>
                  <div className="history-toggle">
                    {selectedUpdate === index ? '▼' : '▶'}
                  </div>
                </div>

                {selectedUpdate === index && (
                  <div className="history-details">
                    {update.changes && update.changes.length > 0 ? (
                      <>
                        <div className="change-stats">
                          {update.stats && update.stats.statusChanges > 0 && (
                            <span className="stat-badge status">Status: {update.stats.statusChanges}</span>
                          )}
                          {update.stats && update.stats.candidateChanges > 0 && (
                            <span className="stat-badge candidate">Candidate: {update.stats.candidateChanges}</span>
                          )}
                          {update.stats && update.stats.partyChanges > 0 && (
                            <span className="stat-badge party">Party: {update.stats.partyChanges}</span>
                          )}
                          {update.stats && update.stats.newConstituencies > 0 && (
                            <span className="stat-badge new">New: {update.stats.newConstituencies}</span>
                          )}
                        </div>
                        
                        <div className="changes-list">
                          {update.changes.map((change, cIdx) => (
                            <div key={cIdx} className={`change-item change-${change.type}`}>
                              <div className="change-header">
                                <strong>{change.constituency}</strong> (No. {change.constNo})
                              </div>
                              <div className="change-details">
                                {change.type === 'status_change' && (
                                  <span>Status: <strong>{change.oldStatus}</strong> → <strong>{change.newStatus}</strong></span>
                                )}
                                {change.type === 'candidate_change' && (
                                  <span>Candidate: <strong>{change.oldCandidate}</strong> → <strong>{change.newCandidate}</strong></span>
                                )}
                                {change.type === 'party_change' && (
                                  <span>Party: <strong>{change.oldParty}</strong> → <strong>{change.newParty}</strong></span>
                                )}
                                {change.type === 'new' && (
                                  <span>New result: <strong>{change.candidate}</strong> ({change.party}) - {change.status}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="no-changes-message">
                        <p>No changes detected in this refresh.</p>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                          All constituency data remained the same.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RefreshHistoryPage;

