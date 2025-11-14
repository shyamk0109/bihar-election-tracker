/**
 * Tracks changes between election result updates
 */

function compareResults(oldResults, newResults) {
  if (!oldResults || !oldResults.states || oldResults.states.length === 0) {
    return {
      isFirstUpdate: true,
      timestamp: new Date().toISOString(),
      summary: 'Initial data load',
      changes: [],
      stats: {
        statusChanges: 0,
        candidateChanges: 0,
        partyChanges: 0,
        newConstituencies: 0,
        totalChanges: 0
      }
    };
  }

  const changes = [];
  const oldMap = new Map();
  oldResults.states.forEach(c => {
    oldMap.set(c.constNo || c.name, c);
  });

  newResults.states.forEach(newConst => {
    const key = newConst.constNo || newConst.name;
    const oldConst = oldMap.get(key);

    if (!oldConst) {
      changes.push({
        type: 'new',
        constituency: newConst.name,
        constNo: newConst.constNo,
        candidate: newConst.leadingCandidate,
        party: newConst.leadingParty,
        status: newConst.status
      });
      return;
    }

    // Check for status change
    const oldStatus = oldConst.status || (oldConst.declared > 0 ? 'Declared' : (oldConst.leading > 0 ? 'Leading' : 'Pending'));
    const newStatus = newConst.status || (newConst.declared > 0 ? 'Declared' : (newConst.leading > 0 ? 'Leading' : 'Pending'));
    
    if (oldStatus !== newStatus) {
      changes.push({
        type: 'status_change',
        constituency: newConst.name,
        constNo: newConst.constNo,
        oldStatus: oldStatus,
        newStatus: newStatus,
        candidate: newConst.leadingCandidate,
        party: newConst.leadingParty
      });
    }

    // Check for candidate change
    if (oldConst.leadingCandidate !== newConst.leadingCandidate) {
      changes.push({
        type: 'candidate_change',
        constituency: newConst.name,
        constNo: newConst.constNo,
        oldCandidate: oldConst.leadingCandidate,
        newCandidate: newConst.leadingCandidate,
        party: newConst.leadingParty
      });
    }

    // Check for party change
    if (oldConst.leadingParty !== newConst.leadingParty) {
      changes.push({
        type: 'party_change',
        constituency: newConst.name,
        constNo: newConst.constNo,
        oldParty: oldConst.leadingParty,
        newParty: newConst.leadingParty,
        candidate: newConst.leadingCandidate
      });
    }
  });

  // Generate summary
  const statusChanges = changes.filter(c => c.type === 'status_change').length;
  const candidateChanges = changes.filter(c => c.type === 'candidate_change').length;
  const partyChanges = changes.filter(c => c.type === 'party_change').length;
  const newConstituencies = changes.filter(c => c.type === 'new').length;

  const summaryParts = [];
  if (statusChanges > 0) summaryParts.push(`${statusChanges} status change${statusChanges > 1 ? 's' : ''}`);
  if (candidateChanges > 0) summaryParts.push(`${candidateChanges} candidate change${candidateChanges > 1 ? 's' : ''}`);
  if (partyChanges > 0) summaryParts.push(`${partyChanges} party change${partyChanges > 1 ? 's' : ''}`);
  if (newConstituencies > 0) summaryParts.push(`${newConstituencies} new result${newConstituencies > 1 ? 's' : ''}`);

  const summary = summaryParts.length > 0 
    ? summaryParts.join(', ')
    : 'No changes detected';

  return {
    isFirstUpdate: false,
    timestamp: new Date().toISOString(),
    summary: summary,
    changes: changes,
    stats: {
      statusChanges,
      candidateChanges,
      partyChanges,
      newConstituencies,
      totalChanges: changes.length
    }
  };
}

module.exports = {
  compareResults
};

