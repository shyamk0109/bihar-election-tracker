import React, { useState, useEffect, useMemo } from 'react';
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
import FilterBar from './FilterBar';
import './PartyWise.css';

// In production, use relative URLs (same domain)
// In development, use localhost
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const PartyWise = () => {
  const [partyData, setPartyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partyFilter, setPartyFilter] = useState('all');
  const [marginFilter, setMarginFilter] = useState('all');

  useEffect(() => {
    fetchPartyData();
    const interval = setInterval(fetchPartyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPartyData = async (forceRefresh = false) => {
    try {
      const url = forceRefresh 
        ? `${API_BASE}/api/party-wise?force=true`
        : `${API_BASE}/api/party-wise`;
      
      const response = await axios.get(url);
      setPartyData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching party data:', error);
      setLoading(false);
    }
  };

  // Get parties - must be before early returns
  const parties = partyData?.parties || [];

  // Filter parties based on filters - must be before early returns
  const filteredParties = useMemo(() => {
    if (!parties || parties.length === 0) return [];
    
    let filtered = [...parties];

    // Apply party filter
    if (partyFilter !== 'all') {
      filtered = filtered.filter(p => p.name === partyFilter);
    }

    // Apply margin filter to constituencies within each party
    if (marginFilter !== 'all') {
      filtered = filtered.map(party => {
        const filteredConstituencies = (party.constituencies || []).filter(constituency => {
          const margin = constituency.margin || 0;
          const marginNum = typeof margin === 'number' ? margin : parseInt(margin.toString().replace(/,/g, '')) || 0;
          
          switch (marginFilter) {
            case '0-1000':
              return marginNum >= 0 && marginNum <= 1000;
            case '1000-2500':
              return marginNum > 1000 && marginNum <= 2500;
            case '2500-5000':
              return marginNum > 2500 && marginNum <= 5000;
            case '5000-10000':
              return marginNum > 5000 && marginNum <= 10000;
            case '10000+':
              return marginNum > 10000;
            default:
              return true;
          }
        });

        // Recalculate party stats based on filtered constituencies
        const declared = filteredConstituencies.filter(c => c.status === 'Declared').length;
        const leading = filteredConstituencies.filter(c => c.status === 'Leading').length;
        
        return {
          ...party,
          constituencies: filteredConstituencies,
          declared: declared,
          leading: leading,
          totalSeats: declared + leading
        };
      }).filter(p => p.constituencies.length > 0);
    }

    return filtered;
  }, [parties, partyFilter, marginFilter]);

  // Get unique parties for filter dropdown - must be before early returns
  const uniqueParties = useMemo(() => {
    if (!parties || parties.length === 0) return [];
    return parties.map(p => p.name).filter(Boolean);
  }, [parties]);

  // Early returns after all hooks
  if (loading) {
    return <div className="party-loading">Loading party data...</div>;
  }

  if (!partyData || !partyData.parties) {
    return <div className="party-error">No party data available</div>;
  }

  // Prepare chart data from filtered parties
  const leadingChartData = filteredParties
    .filter(p => p && (p.leading > 0 || p.declared > 0))
    .slice(0, 10)
    .map(p => ({
      name: p.name && p.name.length > 20 ? p.name.substring(0, 20) + '...' : (p.name || 'Unknown'),
      fullName: p.name || 'Unknown',
      Leading: p.leading || 0,
      Declared: p.declared || 0,
      Total: (p.leading || 0) + (p.declared || 0)
    }));

  const seatDistribution = filteredParties
    .filter(p => p && (p.leading > 0 || p.declared > 0))
    .slice(0, 8)
    .map(p => ({
      name: p.name && p.name.length > 15 ? p.name.substring(0, 15) + '...' : (p.name || 'Unknown'),
      value: (p.leading || 0) + (p.declared || 0),
      fullName: p.name || 'Unknown'
    }));

  // Debug logging
  console.log('PartyWise - Parties count:', parties.length);
  console.log('PartyWise - Leading chart data:', leadingChartData.length);
  console.log('PartyWise - Seat distribution:', seatDistribution.length);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

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
    <div className="party-wise-container">
      <h2 className="party-title">📊 Party-wise Performance</h2>
      
      <FilterBar
        statusFilter="all"
        onStatusChange={() => {}}
        partyFilter={partyFilter}
        onPartyChange={setPartyFilter}
        marginFilter={marginFilter}
        onMarginChange={setMarginFilter}
        parties={uniqueParties}
        showStatus={false}
        showParty={true}
        showMargin={true}
      />
      
      <div className="party-summary-cards">
        <div className="party-summary-card">
          <div className="card-label">Total Parties</div>
          <div className="card-value">{partyData.summary.totalParties}</div>
        </div>
        <div className="party-summary-card">
          <div className="card-label">Parties Leading</div>
          <div className="card-value">{partyData.summary.partiesLeading}</div>
        </div>
        <div className="party-summary-card">
          <div className="card-label">Total Seats Contested</div>
          <div className="card-value">{partyData.totalSeats}</div>
        </div>
      </div>

      {leadingChartData.length > 0 && seatDistribution.length > 0 ? (
        <div className="party-charts-grid">
          <div className="party-chart-card">
            <h3>Top Parties - Seats Leading/Declared</h3>
            <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadingChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Declared" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Leading" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="party-chart-card">
            <h3>Seat Distribution</h3>
            <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3>Charts Loading...</h3>
          <p>Preparing party-wise visualization data...</p>
        </div>
      )}

      <div className="party-table-section">
        <h3>Detailed Party Statistics</h3>
        <div className="party-table-wrapper">
          <table className="party-table">
            <thead>
              <tr>
                <th>Party</th>
                <th>Declared</th>
                <th>Leading</th>
                <th>Trailing</th>
                <th>Total Seats</th>
                <th>Avg Margin</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredParties.map((party, index) => {
                const originalIndex = parties.findIndex(p => p.name === party.name);
                return (
                  <tr 
                    key={index}
                    className={selectedParty === originalIndex ? 'selected' : ''}
                    onClick={() => setSelectedParty(selectedParty === originalIndex ? null : originalIndex)}
                  >
                    <td className="party-name">{party.name}</td>
                    <td className="party-value declared">{party.declared}</td>
                    <td className="party-value leading">{party.leading}</td>
                    <td className="party-value trailing">{party.trailing}</td>
                    <td className="party-value total">{party.totalSeats || (party.declared + party.leading + party.trailing)}</td>
                    <td className="party-value">{party.avgMargin.toLocaleString()}</td>
                    <td>
                      <button className="details-btn">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedParty !== null && parties[selectedParty] && (() => {
          const selectedPartyData = filteredParties.find(p => p.name === parties[selectedParty].name) || parties[selectedParty];
          return (
            <div className="party-details">
              <h4>{selectedPartyData.name} - Constituencies {marginFilter !== 'all' ? `(Filtered by margin: ${marginFilter})` : ''}</h4>
              <div className="constituencies-list">
                {selectedPartyData.constituencies && selectedPartyData.constituencies.length > 0 ? (
                  selectedPartyData.constituencies.map((constituency, idx) => (
                    <div key={idx} className="constituency-item">
                      <span className="const-name">{constituency.name} (No. {constituency.constNo})</span>
                      <span className="const-candidate">{constituency.candidate}</span>
                      <span className="const-margin">Margin: {constituency.margin.toLocaleString()}</span>
                      <span className={`const-status ${constituency.status.toLowerCase()}`}>{constituency.status}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-constituencies">No constituencies match the current filters.</div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PartyWise;

