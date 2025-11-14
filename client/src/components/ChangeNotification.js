import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import './ChangeNotification.css';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const ChangeNotification = ({ lastUpdate, onDismiss }) => {
  const [latestChange, setLatestChange] = useState(null);
  const [show, setShow] = useState(false);

  const handleDismiss = useCallback(() => {
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  const fetchLatestChange = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/refresh-history`);
      if (response.data.history && response.data.history.length > 0) {
        setLatestChange(response.data.history[0]);
      }
    } catch (error) {
      console.error('Error fetching latest change:', error);
    }
  }, []);

  useEffect(() => {
    if (lastUpdate) {
      fetchLatestChange();
      setShow(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShow(false);
        handleDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate, handleDismiss, fetchLatestChange]);

  if (!show || !latestChange) {
    return null;
  }

  if (latestChange.isFirstUpdate) {
    return null; // Don't show notification for initial load
  }

  return (
    <div className={`change-notification ${show ? 'show' : ''}`}>
      <div className="notification-header">
        <span className="notification-icon">🔄</span>
        <span className="notification-title">Data Updated</span>
        <button className="notification-close" onClick={() => { setShow(false); handleDismiss(); }}>
          ✕
        </button>
      </div>
      <div className="notification-content">
        <div className="notification-time">
          {formatDistanceToNow(new Date(latestChange.timestamp), { addSuffix: true })}
        </div>
        <div className="notification-summary">
          {latestChange.summary}
        </div>
        {latestChange.stats && latestChange.stats.totalChanges > 0 && (
          <div className="notification-stats">
            {latestChange.stats.statusChanges > 0 && (
              <span className="stat-tag status">Status: {latestChange.stats.statusChanges}</span>
            )}
            {latestChange.stats.candidateChanges > 0 && (
              <span className="stat-tag candidate">Candidate: {latestChange.stats.candidateChanges}</span>
            )}
            {latestChange.stats.partyChanges > 0 && (
              <span className="stat-tag party">Party: {latestChange.stats.partyChanges}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeNotification;

