/**
 * Alliance/Coalition definitions for Bihar elections
 * Based on current political landscape
 */

const ALLIANCES = {
  NDA: {
    name: 'NDA (National Democratic Alliance)',
    shortName: 'NDA',
    color: '#FF6B6B',
    parties: [
      'Bharatiya Janata Party',
      'Janata Dal (United)',
      'Lok Janshakti Party (Ram Vilas)',
      'Hindustani Awam Morcha (Secular)',
      'Rashtriya Lok Janata Dal',
      'Vikassheel Insaan Party'
    ]
  },
  MAHAGATHBANDHAN: {
    name: 'Mahagathbandhan (Grand Alliance)',
    shortName: 'MGB',
    color: '#4ECDC4',
    parties: [
      'Rashtriya Janata Dal',
      'Indian National Congress',
      'Communist Party of India (Marxist-Leninist) (Liberation)',
      'Communist Party of India',
      'Communist Party of India (Marxist)',
      'All India Majlis-E-Ittehadul Muslimeen'
    ]
  },
  OTHERS: {
    name: 'Others/Independents',
    shortName: 'Others',
    color: '#95A5A6',
    parties: []
  }
};

/**
 * Determines which alliance a party belongs to
 */
function getPartyAlliance(partyName) {
  if (!partyName || partyName === 'Unknown') {
    return 'OTHERS';
  }
  
  // Check NDA
  for (const party of ALLIANCES.NDA.parties) {
    if (partyName.includes(party) || party.includes(partyName)) {
      return 'NDA';
    }
  }
  
  // Check Mahagathbandhan
  for (const party of ALLIANCES.MAHAGATHBANDHAN.parties) {
    if (partyName.includes(party) || party.includes(partyName)) {
      return 'MAHAGATHBANDHAN';
    }
  }
  
  return 'OTHERS';
}

/**
 * Aggregates results by alliance
 */
function aggregateByAlliance(results) {
  const allianceData = {
    NDA: {
      name: ALLIANCES.NDA.name,
      shortName: ALLIANCES.NDA.shortName,
      color: ALLIANCES.NDA.color,
      leading: 0,
      declared: 0,
      trailing: 0,
      totalSeats: 0,
      parties: {},
      constituencies: [],
      totalMargin: 0,
      avgMargin: 0
    },
    MAHAGATHBANDHAN: {
      name: ALLIANCES.MAHAGATHBANDHAN.name,
      shortName: ALLIANCES.MAHAGATHBANDHAN.shortName,
      color: ALLIANCES.MAHAGATHBANDHAN.color,
      leading: 0,
      declared: 0,
      trailing: 0,
      totalSeats: 0,
      parties: {},
      constituencies: [],
      totalMargin: 0,
      avgMargin: 0
    },
    OTHERS: {
      name: ALLIANCES.OTHERS.name,
      shortName: ALLIANCES.OTHERS.shortName,
      color: ALLIANCES.OTHERS.color,
      leading: 0,
      declared: 0,
      trailing: 0,
      totalSeats: 0,
      parties: {},
      constituencies: [],
      totalMargin: 0,
      avgMargin: 0
    }
  };
  
  results.states.forEach(constituency => {
    const leadingAlliance = getPartyAlliance(constituency.leadingParty);
    const trailingAlliance = getPartyAlliance(constituency.trailingParty);
    
    // Process leading alliance
    if (constituency.status === 'Declared') {
      allianceData[leadingAlliance].declared++;
      allianceData[leadingAlliance].totalSeats++;
    } else if (constituency.status === 'Leading') {
      allianceData[leadingAlliance].leading++;
    }
    
    // Track party within alliance
    if (constituency.leadingParty && constituency.leadingParty !== 'Unknown') {
      if (!allianceData[leadingAlliance].parties[constituency.leadingParty]) {
        allianceData[leadingAlliance].parties[constituency.leadingParty] = {
          name: constituency.leadingParty,
          leading: 0,
          declared: 0,
          totalSeats: 0
        };
      }
      
      if (constituency.status === 'Declared') {
        allianceData[leadingAlliance].parties[constituency.leadingParty].declared++;
        allianceData[leadingAlliance].parties[constituency.leadingParty].totalSeats++;
      } else if (constituency.status === 'Leading') {
        allianceData[leadingAlliance].parties[constituency.leadingParty].leading++;
      }
    }
    
    // Add constituency to alliance
    allianceData[leadingAlliance].constituencies.push({
      name: constituency.name,
      constNo: constituency.constNo,
      party: constituency.leadingParty,
      candidate: constituency.leadingCandidate,
      margin: constituency.margin || 0,
      status: constituency.status
    });
    
    allianceData[leadingAlliance].totalMargin += constituency.margin || 0;
    
    // Process trailing alliance
    if (trailingAlliance !== leadingAlliance) {
      allianceData[trailingAlliance].trailing++;
    }
  });
  
  // Calculate averages and convert parties to arrays
  Object.keys(allianceData).forEach(key => {
    const alliance = allianceData[key];
    alliance.avgMargin = alliance.constituencies.length > 0
      ? Math.round(alliance.totalMargin / alliance.constituencies.length)
      : 0;
    // Ensure parties is always an array
    alliance.parties = alliance.parties && Object.keys(alliance.parties).length > 0
      ? Object.values(alliance.parties)
      : [];
    alliance.parties.sort((a, b) => (b.leading + b.declared) - (a.leading + a.declared));
    // Ensure constituencies is always an array
    if (!Array.isArray(alliance.constituencies)) {
      alliance.constituencies = [];
    }
  });
  
  // Calculate projections and insights
  const totalSeats = results.summary.totalSeats;
  const alliances = Object.values(allianceData);
  
  // Projection: if current trend continues
  alliances.forEach(alliance => {
    const currentTotal = alliance.leading + alliance.declared;
    const percentage = (currentTotal / totalSeats) * 100;
    alliance.projection = {
      current: currentTotal,
      percentage: percentage.toFixed(1),
      projectedSeats: Math.round((percentage / 100) * totalSeats),
      majority: currentTotal > totalSeats / 2
    };
  });
  
  return {
    timestamp: results.timestamp,
    alliances: alliances,
    totalSeats: totalSeats,
    summary: {
      totalAlliances: alliances.length,
      leadingAlliance: alliances.reduce((max, a) => 
        (a.leading + a.declared) > (max.leading + max.declared) ? a : max
      ),
      majorityThreshold: Math.ceil(totalSeats / 2)
    }
  };
}

module.exports = {
  ALLIANCES,
  getPartyAlliance,
  aggregateByAlliance
};

