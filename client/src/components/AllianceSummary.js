import React from 'react';
import './AllianceSummary.css';

const AllianceSummary = ({ allianceData }) => {
  const alliances = allianceData.alliances || [];
  const majorityThreshold = allianceData.majorityThreshold || 122;

  return (
    <div className="alliance-summary-container">
      <h2 className="alliance-summary-title">🤝 Alliance Summary</h2>
      
      <div className="alliance-summary-cards">
        {alliances.map((alliance, index) => {
          const total = alliance.declared + alliance.leading;
          const percentage = ((total / allianceData.totalSeats) * 100).toFixed(1);
          const isMajority = total >= majorityThreshold;

          return (
            <div 
              key={index} 
              className={`alliance-summary-card ${isMajority ? 'majority' : ''}`}
              style={{ borderLeft: `4px solid ${alliance.color}` }}
            >
              <div className="alliance-summary-header">
                <h3 className="alliance-summary-name">{alliance.shortName}</h3>
                {isMajority && <span className="majority-badge">Majority</span>}
              </div>
              <div className="alliance-summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Declared:</span>
                  <span className="stat-value declared">{alliance.declared}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Leading:</span>
                  <span className="stat-value leading">{alliance.leading}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value total">{total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Percentage:</span>
                  <span className="stat-value percentage">{percentage}%</span>
                </div>
              </div>
              {alliance.projection && (
                <div className="alliance-projection">
                  <div className="projection-label">Projected: {alliance.projection.projectedSeats || total} seats</div>
                  <div className="projection-bar">
                    <div
                      className="projection-fill"
                      style={{
                        width: `${alliance.projection.percentage || percentage}%`,
                        backgroundColor: alliance.color
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllianceSummary;

