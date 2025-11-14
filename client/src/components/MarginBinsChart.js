import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import FilterBar from './FilterBar';
import './MarginBinsChart.css';

const MarginBinsChart = ({ states }) => {
  const [partyFilter, setPartyFilter] = useState('all');

  // Get unique parties for filter
  const uniqueParties = useMemo(() => {
    const parties = new Set();
    states.forEach(state => {
      if (state.leadingParty && state.leadingParty !== 'Unknown') {
        parties.add(state.leadingParty);
      }
    });
    return Array.from(parties).sort();
  }, [states]);

  // Calculate margin bins data
  const marginBinsData = useMemo(() => {
    // Filter by party if selected
    let filteredStates = states;
    if (partyFilter !== 'all') {
      filteredStates = states.filter(state => state.leadingParty === partyFilter);
    }

    // Initialize bins
    const bins = {
      '0-1,000': { label: '0 - 1,000', count: 0, color: '#ef4444' },
      '1,000-2,500': { label: '1,000 - 2,500', count: 0, color: '#f59e0b' },
      '2,500-5,000': { label: '2,500 - 5,000', count: 0, color: '#eab308' },
      '5,000-10,000': { label: '5,000 - 10,000', count: 0, color: '#84cc16' },
      '10,000+': { label: '10,000+', count: 0, color: '#10b981' }
    };

    // Count constituencies in each bin
    filteredStates.forEach(state => {
      const margin = state.margin || 0;
      const marginNum = typeof margin === 'number' ? margin : parseInt(margin.toString().replace(/,/g, '')) || 0;

      if (marginNum >= 0 && marginNum <= 1000) {
        bins['0-1,000'].count++;
      } else if (marginNum > 1000 && marginNum <= 2500) {
        bins['1,000-2,500'].count++;
      } else if (marginNum > 2500 && marginNum <= 5000) {
        bins['2,500-5,000'].count++;
      } else if (marginNum > 5000 && marginNum <= 10000) {
        bins['5,000-10,000'].count++;
      } else if (marginNum > 10000) {
        bins['10,000+'].count++;
      }
    });

    // Convert to array for chart
    return Object.values(bins).map(bin => ({
      name: bin.label,
      value: bin.count,
      color: bin.color
    }));
  }, [states, partyFilter]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="margin-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p style={{ color: payload[0].payload.color, fontWeight: 600 }}>
            Constituencies: {payload[0].value}
          </p>
          {partyFilter !== 'all' && (
            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Party: {partyFilter}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const totalConstituencies = marginBinsData.reduce((sum, bin) => sum + bin.value, 0);

  return (
    <div className="margin-bins-chart-container">
      <div className="margin-bins-header">
        <h3>📊 Vote Margin Distribution</h3>
        <div className="margin-bins-stats">
          {partyFilter !== 'all' ? (
            <span>Showing: {totalConstituencies} constituencies for {partyFilter}</span>
          ) : (
            <span>Total: {totalConstituencies} constituencies</span>
          )}
        </div>
      </div>

      <FilterBar
        statusFilter="all"
        onStatusChange={() => {}}
        partyFilter={partyFilter}
        onPartyChange={setPartyFilter}
        marginFilter="all"
        onMarginChange={() => {}}
        parties={uniqueParties}
        showStatus={false}
        showParty={true}
        showMargin={false}
      />

      <div className="margin-bins-chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={marginBinsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-15}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Number of Constituencies', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {marginBinsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="margin-bins-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
          <span>0 - 1,000 (Very Close)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>1,000 - 2,500 (Close)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#eab308' }}></span>
          <span>2,500 - 5,000 (Moderate)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#84cc16' }}></span>
          <span>5,000 - 10,000 (Comfortable)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          <span>10,000+ (Safe)</span>
        </div>
      </div>
    </div>
  );
};

export default MarginBinsChart;

