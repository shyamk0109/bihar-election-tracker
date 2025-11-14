import React from 'react';
import './SummaryCards.css';

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      title: 'Total Constituencies',
      value: summary.totalSeats,
      icon: '🏛️',
      color: '#667eea',
      subtitle: 'Bihar Assembly Seats'
    },
    {
      title: 'Declared',
      value: summary.declared,
      icon: '✅',
      color: '#10b981',
      subtitle: `${((summary.declared / summary.totalSeats) * 100).toFixed(1)}% complete`
    },
    {
      title: 'Leading',
      value: summary.leading,
      icon: '📊',
      color: '#f59e0b',
      subtitle: 'In progress'
    },
    {
      title: 'Pending',
      value: summary.pending,
      icon: '⏳',
      color: '#6b7280',
      subtitle: 'Awaiting results'
    }
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <div key={index} className="summary-card" style={{ '--card-color': card.color }}>
          <div className="card-icon">{card.icon}</div>
          <div className="card-content">
            <div className="card-title">{card.title}</div>
            <div className="card-value">{card.value.toLocaleString()}</div>
            <div className="card-subtitle">{card.subtitle}</div>
          </div>
          <div className="card-accent"></div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;

