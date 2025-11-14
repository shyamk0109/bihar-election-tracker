import React, { useMemo, useState } from 'react';
import Pagination from './Pagination';
import FilterBar from './FilterBar';
import './StateWiseTable.css';

const StateWiseTable = ({ states }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [marginFilter, setMarginFilter] = useState('all');
  const [constituencyFilter, setConstituencyFilter] = useState('');
  const [candidateFilter, setCandidateFilter] = useState('');
  const itemsPerPage = 25;

  // Get unique parties for filter
  const uniqueParties = useMemo(() => {
    const parties = new Set();
    states.forEach(state => {
      if (state.leadingParty && state.leadingParty !== 'Unknown') {
        parties.add(state.leadingParty);
      }
    });
    return Array.from(parties);
  }, [states]);

  // Filter and sort states
  const filteredAndSortedStates = useMemo(() => {
    let filtered = [...states];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(state => {
        const status = state.status || (state.declared > 0 ? 'Declared' : (state.leading > 0 ? 'Leading' : 'Pending'));
        return status === statusFilter;
      });
    }

    // Apply party filter
    if (partyFilter !== 'all') {
      filtered = filtered.filter(state => state.leadingParty === partyFilter);
    }

    // Apply margin filter
    if (marginFilter !== 'all') {
      filtered = filtered.filter(state => {
        const margin = state.margin || 0;
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
    }

    // Apply constituency name filter (search)
    if (constituencyFilter.trim() !== '') {
      const searchTerm = constituencyFilter.toLowerCase().trim();
      filtered = filtered.filter(state => {
        const name = (state.name || '').toLowerCase();
        const constNo = (state.constNo || '').toString();
        return name.includes(searchTerm) || constNo.includes(searchTerm);
      });
    }

    // Apply candidate name filter
    if (candidateFilter.trim() !== '') {
      const searchTerm = candidateFilter.toLowerCase().trim();
      filtered = filtered.filter(state => {
        const candidate = (state.leadingCandidate || '').toLowerCase();
        return candidate.includes(searchTerm);
      });
    }

    // Sort by status priority: Declared > Leading > Pending, then by name
    const statusPriority = { 'Declared': 3, 'Leading': 2, 'Pending': 1 };
    return filtered.sort((a, b) => {
      const statusA = a.status || (a.declared > 0 ? 'Declared' : (a.leading > 0 ? 'Leading' : 'Pending'));
      const statusB = b.status || (b.declared > 0 ? 'Declared' : (b.leading > 0 ? 'Leading' : 'Pending'));
      const priorityDiff = (statusPriority[statusB] || 0) - (statusPriority[statusA] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });
  }, [states, statusFilter, partyFilter, marginFilter, constituencyFilter, candidateFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedStates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStates = filteredAndSortedStates.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, partyFilter, marginFilter, constituencyFilter, candidateFilter, states.length]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="state-table-container">
      <div className="table-header-section">
        <h2 className="table-title">Constituency-wise Results (Bihar - 243 Constituencies)</h2>
        <div className="table-stats">
          Total: {states.length} | Filtered: {filteredAndSortedStates.length} | Showing: {paginatedStates.length} per page
        </div>
      </div>
      
      <FilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        partyFilter={partyFilter}
        onPartyChange={setPartyFilter}
        marginFilter={marginFilter}
        onMarginChange={setMarginFilter}
        parties={uniqueParties}
        showStatus={true}
        showParty={true}
        showMargin={true}
      />
      
      <div className="search-filters-row">
        <div className="constituency-search-filter">
          <label className="search-label">Search Constituency:</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="constituency-search-input"
              placeholder="Search by name or number..."
              value={constituencyFilter}
              onChange={(e) => setConstituencyFilter(e.target.value)}
            />
            {constituencyFilter && (
              <button
                className="clear-search-btn"
                onClick={() => setConstituencyFilter('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="constituency-search-filter">
          <label className="search-label">Search Candidate:</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="constituency-search-input"
              placeholder="Search by candidate name..."
              value={candidateFilter}
              onChange={(e) => setCandidateFilter(e.target.value)}
            />
            {candidateFilter && (
              <button
                className="clear-search-btn"
                onClick={() => setCandidateFilter('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="state-table">
          <thead>
            <tr>
              <th>Constituency</th>
              <th>Leading Candidate</th>
              <th>Leading Party</th>
              <th>Margin</th>
              <th>Status</th>
              <th>Round</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStates.map((constituency, index) => {
              const status = constituency.status || (constituency.declared > 0 ? 'Declared' : (constituency.leading > 0 ? 'Leading' : 'Pending'));
              const margin = constituency.margin || constituency.marginText || '0';
              const marginNum = typeof margin === 'number' ? margin : parseInt(margin.toString().replace(/,/g, '')) || 0;
              
              return (
                <tr key={`${constituency.constNo}-${index}`}>
                  <td className="state-name">
                    <div style={{ fontWeight: 600 }}>{constituency.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>No. {constituency.constNo}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{constituency.leadingCandidate || 'N/A'}</div>
                    {constituency.trailingCandidate && (
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>vs {constituency.trailingCandidate}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#667eea' }}>{constituency.leadingParty || 'Unknown'}</div>
                    {constituency.trailingParty && constituency.trailingParty !== 'Unknown' && (
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>vs {constituency.trailingParty}</div>
                    )}
                  </td>
                  <td className="state-value" style={{ 
                    fontWeight: 600,
                    color: marginNum > 10000 ? '#10b981' : (marginNum > 5000 ? '#f59e0b' : '#ef4444')
                  }}>
                    {marginNum.toLocaleString()}
                  </td>
                  <td className="state-value" style={{ 
                    color: status === 'Declared' ? '#10b981' : (status === 'Leading' ? '#f59e0b' : '#6b7280'),
                    fontWeight: 600
                  }}>{status}</td>
                  <td className="state-value" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    {constituency.round || 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={filteredAndSortedStates.length}
      />
    </div>
  );
};

export default StateWiseTable;

