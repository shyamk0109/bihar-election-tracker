import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <h2>Loading Election Results...</h2>
      <p>Fetching latest data from ECI</p>
    </div>
  );
};

export default LoadingSpinner;

