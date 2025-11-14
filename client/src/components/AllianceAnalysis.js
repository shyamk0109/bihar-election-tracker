import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './AllianceAnalysis.css';

// In production, use relative URLs (same domain)
// In development, use localhost
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const AllianceAnalysis = () => {
  const [allianceData, setAllianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlliance, setSelectedAlliance] = useState(null);

  useEffect(() => {
    fetchAllianceData();
    const interval = setInterval(fetchAllianceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllianceData = async (forceRefresh = false) => {
    try {
      const url = forceRefresh 
        ? `${API_BASE}/api/alliance-wise?force=true`
        : `${API_BASE}/api/alliance-wise`;
      
      const response = await axios.get(url);
      setAllianceData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alliance data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="alliance-loading">Loading alliance analysis...</div>;
  }

  if (!allianceData || !allianceData.alliances) {
    return <div className="alliance-error">No alliance data available</div>;
  }

  const alliances = allianceData.alliances;
  const majorityThreshold = allianceData.summary.majorityThreshold;

  // Prepare chart data
  const seatComparison = alliances.map(a => ({
    name: a.shortName,
    fullName: a.name,
    Leading: a.leading,
    Declared: a.declared,
    Total: a.leading + a.declared,
    Trailing: a.trailing,
    color: a.color
  }));

  const seatDistribution = alliances
    .filter(a => a.leading + a.declared > 0)
    .map(a => ({
      name: a.shortName,
      value: a.leading + a.declared,
      fullName: a.name,
      color: a.color
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.fullName || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="alliance-container">
      <h2 className="alliance-title">🏛️ Alliance-wise Analysis</h2>
      
      <div className="alliance-summary">
        <div className="alliance-summary-card" style={{ borderLeft: `4px solid ${alliances[0]?.color || '#667eea'}` }}>
          <div className="summary-label">Majority Threshold</div>
          <div className="summary-value">{majorityThreshold} seats</div>
          <div className="summary-note">Required for government formation</div>
        </div>
        {alliances.map((alliance, index) => {
          const total = alliance.leading + alliance.declared;
          const percentage = ((total / allianceData.totalSeats) * 100).toFixed(1);
          const isMajority = total > majorityThreshold;
          
          return (
            <div 
              key={index} 
              className="alliance-summary-card"
              style={{ 
                borderLeft: `4px solid ${alliance.color}`,
                background: isMajority ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white'
              }}
            >
              <div className="alliance-header">
                <span className="alliance-name">{alliance.name}</span>
                {isMajority && <span className="majority-badge">Majority</span>}
              </div>
              <div className="alliance-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Seats</span>
                  <span className="stat-value" style={{ color: alliance.color, fontSize: '1.8rem' }}>
                    {total}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Percentage</span>
                  <span className="stat-value">{percentage}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Declared</span>
                  <span className="stat-value declared">{alliance.declared}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Leading</span>
                  <span className="stat-value leading">{alliance.leading}</span>
                </div>
              </div>
              {alliance.projection && (
                <div className="alliance-projection">
                  <div className="projection-label">Projected Seats: {alliance.projection.projectedSeats || total}</div>
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

      <div className="alliance-charts-grid">
        <div className="alliance-chart-card">
          <h3>Seat Comparison by Alliance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seatComparison} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Declared" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Leading" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Trailing" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="alliance-chart-card">
          <h3>Seat Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={seatDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {seatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="alliance-insights">
        <h3>📊 Political Analyst Insights</h3>
        <div className="insights-grid">
          {alliances.map((alliance, index) => {
            const total = alliance.leading + alliance.declared;
            const isMajority = total > majorityThreshold;
            const marginFromMajority = total - majorityThreshold;
            
            return (
              <div key={index} className="insight-card" style={{ borderTop: `4px solid ${alliance.color}` }}>
                <h4>{alliance.name}</h4>
                <div className="insight-content">
                  {isMajority ? (
                    <div className="insight-positive">
                      <strong>✅ Clear Majority:</strong> {alliance.name} is leading with {total} seats, 
                      {marginFromMajority > 0 && ` ${marginFromMajority} seats above the majority threshold.`}
                      <br />
                      <strong>Projection:</strong> Likely to form government if current trends hold.
                    </div>
                  ) : (
                    <div className="insight-neutral">
                      <strong>📈 Current Status:</strong> {alliance.name} has {total} seats leading.
                      <br />
                      <strong>Gap to Majority:</strong> Needs {majorityThreshold - total} more seats.
                      <br />
                      <strong>Projection:</strong> {alliance.projection?.projectedSeats || total} seats if trend continues.
                    </div>
                  )}
                  {alliance.parties && alliance.parties.length > 0 && (
                    <div className="insight-parties">
                      <strong>Key Parties:</strong>
                      <ul>
                        {alliance.parties.slice(0, 3).map((party, pIdx) => (
                          <li key={pIdx}>
                            {party.name}: {party.leading + party.declared} seats
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {alliance.avgMargin > 0 && (
                    <div className="insight-margin">
                      <strong>Average Margin:</strong> {alliance.avgMargin.toLocaleString()} votes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="alliance-details-section">
        <h3>Detailed Alliance Breakdown</h3>
        {alliances.map((alliance, index) => (
          <div 
            key={index}
            className="alliance-details-card"
            style={{ borderLeft: `4px solid ${alliance.color}` }}
          >
            <div 
              className="alliance-details-header"
              onClick={() => setSelectedAlliance(selectedAlliance === index ? null : index)}
            >
              <h4>{alliance.name}</h4>
              <span className="toggle-icon">{selectedAlliance === index ? '−' : '+'}</span>
            </div>
            
            {selectedAlliance === index && (
              <div className="alliance-details-content">
                <div className="alliance-parties">
                  <h5>Parties in Alliance:</h5>
                  <div className="parties-list">
                    {alliance.parties && alliance.parties.length > 0 ? (
                      alliance.parties.map((party, pIdx) => (
                        <div key={pIdx} className="party-item">
                          <span className="party-name">{party.name}</span>
                          <span className="party-seats">
                            {party.declared + party.leading} seats
                            {party.declared > 0 && <span className="declared-badge">{party.declared} declared</span>}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="no-parties">No parties with seats in this alliance yet</div>
                    )}
                  </div>
                </div>
                
                {alliance.constituencies && alliance.constituencies.length > 0 && (
                  <div className="alliance-constituencies">
                    <h5>Leading Constituencies ({alliance.constituencies.length}):</h5>
                    <div className="constituencies-grid">
                      {alliance.constituencies.slice(0, 20).map((constituency, cIdx) => (
                        <div key={cIdx} className="constituency-card">
                          <div className="const-name">{constituency.name}</div>
                          <div className="const-details">
                            <span>{constituency.party}</span>
                            <span>Margin: {constituency.margin.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllianceAnalysis;

