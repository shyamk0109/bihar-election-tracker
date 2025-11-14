// Dashboard component is now replaced by HomePage
// Keeping this file for backward compatibility if needed
import React from 'react';
import HomePage from '../pages/HomePage';

const Dashboard = ({ results }) => {
  return <HomePage results={results} />;
};

export default Dashboard;

