import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import './Header.css';

const Header = ({ lastUpdate, onRefresh, refreshing = false }) => {
  const location = useLocation();
  
  const getUpdateText = () => {
    if (!lastUpdate) return 'Never';
    return formatDistanceToNow(lastUpdate, { addSuffix: true });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="header-title-link">
            <h1 className="header-title">🗳️ Bihar Election Tracker</h1>
            <p className="header-subtitle">Real-time Results Dashboard - 243 Constituencies</p>
          </Link>
        </div>
        <div className="header-right">
          <div className="update-info">
            <span className="update-label">Last updated:</span>
            <span className="update-time">{getUpdateText()}</span>
          </div>
          <button 
            onClick={onRefresh} 
            className="refresh-button"
            disabled={refreshing}
            style={{ opacity: refreshing ? 0.6 : 1, cursor: refreshing ? 'wait' : 'pointer' }}
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>
      <nav className="header-nav">
        <Link 
          to="/" 
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/constituencies" 
          className={`nav-link ${isActive('/constituencies') ? 'active' : ''}`}
        >
          🏛️ Constituencies
        </Link>
        <Link 
          to="/party-analysis" 
          className={`nav-link ${isActive('/party-analysis') ? 'active' : ''}`}
        >
          🎯 Party Analysis
        </Link>
        <Link 
          to="/alliance-analysis" 
          className={`nav-link ${isActive('/alliance-analysis') ? 'active' : ''}`}
        >
          🤝 Alliance Analysis
        </Link>
        <Link 
          to="/refresh-history" 
          className={`nav-link ${isActive('/refresh-history') ? 'active' : ''}`}
        >
          🔄 Refresh History
        </Link>
      </nav>
      <div className="live-indicator">
        <span className="live-dot"></span>
        <span>LIVE</span>
      </div>
    </header>
  );
};

export default Header;

