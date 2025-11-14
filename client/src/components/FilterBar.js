import React from 'react';
import './FilterBar.css';

const FilterBar = ({ 
  statusFilter, 
  onStatusChange, 
  partyFilter, 
  onPartyChange, 
  marginFilter, 
  onMarginChange,
  parties = [],
  showStatus = true,
  showParty = true,
  showMargin = true
}) => {
  const marginBins = [
    { label: 'All Margins', value: 'all' },
    { label: '0 - 1,000', value: '0-1000' },
    { label: '1,000 - 2,500', value: '1000-2500' },
    { label: '2,500 - 5,000', value: '2500-5000' },
    { label: '5,000 - 10,000', value: '5000-10000' },
    { label: '10,000+', value: '10000+' }
  ];

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Declared', value: 'Declared' },
    { label: 'Leading', value: 'Leading' },
    { label: 'Pending', value: 'Pending' }
  ];

  const uniqueParties = [...new Set(parties)].sort();

  return (
    <div className="filter-bar">
      {showStatus && (
        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select 
            className="filter-select" 
            value={statusFilter} 
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {showParty && (
        <div className="filter-group">
          <label className="filter-label">Party:</label>
          <select 
            className="filter-select" 
            value={partyFilter} 
            onChange={(e) => onPartyChange(e.target.value)}
          >
            <option value="all">All Parties</option>
            {uniqueParties.map(party => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>
        </div>
      )}

      {showMargin && (
        <div className="filter-group">
          <label className="filter-label">Vote Margin:</label>
          <select 
            className="filter-select" 
            value={marginFilter} 
            onChange={(e) => onMarginChange(e.target.value)}
          >
            {marginBins.map(bin => (
              <option key={bin.value} value={bin.value}>
                {bin.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;

