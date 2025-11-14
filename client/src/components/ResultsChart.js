import React from 'react';
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
import './ResultsChart.css';

const ResultsChart = ({ states }) => {
  // Prepare data for bar chart (top 20 constituencies by status)
  const chartData = states
    .slice(0, 20)
    .map(constituency => ({
      name: constituency.name.length > 15 ? constituency.name.substring(0, 15) + '...' : constituency.name,
      fullName: constituency.name,
      Declared: constituency.declared,
      Leading: constituency.leading,
      Pending: constituency.pending
    }));

  // Prepare data for pie chart (summary)
  const totalDeclared = states.reduce((sum, state) => sum + state.declared, 0);
  const totalLeading = states.reduce((sum, state) => sum + state.leading, 0);
  const totalPending = states.reduce((sum, state) => sum + state.pending, 0);

  const pieData = [
    { name: 'Declared', value: totalDeclared, color: '#10b981' },
    { name: 'Leading', value: totalLeading, color: '#f59e0b' },
    { name: 'Pending', value: totalPending, color: '#6b7280' }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#6b7280'];

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
    <div className="charts-container">
      <h2 className="chart-title">Results Visualization</h2>
      
      <div className="charts-grid">
        <div className="chart-item">
          <h3 className="chart-subtitle">Top Constituencies - Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
              <Bar dataKey="Pending" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3 className="chart-subtitle">Overall Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;

