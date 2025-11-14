const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const electionScraper = require('./scraper');
const { aggregateByAlliance } = require('./alliances');
const { compareResults } = require('./changeTracker');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Store latest results in memory
let latestResults = {
  timestamp: null,
  states: [],
  summary: {
    totalSeats: 0,
    declared: 0,
    leading: 0,
    totalVotes: 0
  }
};

// Store change history
let changeHistory = [];

// API endpoint to get latest results
app.get('/api/results', async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true' || req.query.force === '1';
    
    // If force refresh is requested, always fetch fresh data
    // Otherwise, if we have recent data (less than 30 seconds old), return cached
    if (!forceRefresh && latestResults.timestamp && Date.now() - latestResults.timestamp < 30000) {
      console.log('📦 Returning cached results');
      return res.json(latestResults);
    }

    // Fetch fresh data
    console.log('🔄 Fetching fresh results from ECI...');
    let results;
    try {
      results = await electionScraper.fetchResults();
      console.log(`✅ Fetched results: ${results.states.length} constituencies, ${results.summary.declared} declared, ${results.summary.leading} leading`);
    } catch (error) {
      console.error('❌ Error fetching results:', error.message);
      console.error('Stack:', error.stack);
      // Use cached data if available
      if (latestResults.timestamp) {
        console.log('⚠️  Returning stale cached data due to error');
        return res.json(latestResults);
      }
      throw error;
    }
    
    // Track changes - always record refresh, even if no changes
    const changeInfo = compareResults(latestResults, results);
    
    // Record ALL refreshes (including initial load and no-change refreshes)
    changeHistory.unshift(changeInfo);
    // Keep only last 50 updates
    if (changeHistory.length > 50) {
      changeHistory = changeHistory.slice(0, 50);
    }
    
    if (changeInfo.isFirstUpdate) {
      console.log(`📊 Initial data loaded - recorded in history (ID: ${changeHistory.length})`);
    } else if (changeInfo.changes.length > 0) {
      console.log(`📊 Changes detected: ${changeInfo.summary} - recorded in history (ID: ${changeHistory.length})`);
    } else {
      console.log(`📊 Refresh completed: No changes detected - recorded in history (ID: ${changeHistory.length})`);
    }
    
    latestResults = results;
    console.log('✅ Fresh results loaded');
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    // Return cached data if available, even if stale
    if (latestResults.timestamp) {
      console.log('⚠️  Returning stale cached data due to error');
      return res.json(latestResults);
    }
    res.status(500).json({ error: 'Failed to fetch election results', details: error.message });
  }
});

// API endpoint to get party-wise aggregation
app.get('/api/party-wise', async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true' || req.query.force === '1';
    let results;
    
    if (forceRefresh || latestResults.states.length === 0) {
      results = await electionScraper.fetchResults();
      latestResults = results;
    } else {
      results = latestResults;
    }
    
    const partyData = electionScraper.aggregateByParty(results);
    res.json(partyData);
  } catch (error) {
    console.error('Error aggregating party data:', error);
    res.status(500).json({ error: 'Failed to aggregate party data' });
  }
});

// API endpoint to get detailed constituency data
app.get('/api/constituencies', async (req, res) => {
  try {
    const results = latestResults.states.length > 0 
      ? latestResults 
      : await electionScraper.fetchResults();
    
    res.json({
      timestamp: results.timestamp,
      constituencies: results.states.map(c => ({
        name: c.name,
        constNo: c.constNo,
        leadingCandidate: c.leadingCandidate,
        leadingParty: c.leadingParty,
        trailingCandidate: c.trailingCandidate,
        trailingParty: c.trailingParty,
        margin: c.margin,
        marginText: c.marginText,
        round: c.round,
        status: c.status,
        declared: c.declared,
        leading: c.leading,
        pending: c.pending
      }))
    });
  } catch (error) {
    console.error('Error fetching constituency data:', error);
    res.status(500).json({ error: 'Failed to fetch constituency data' });
  }
});

// API endpoint to get state-wise summary
app.get('/api/state-wise', async (req, res) => {
  try {
    const results = latestResults.states.length > 0 
      ? latestResults 
      : await electionScraper.fetchResults();
    
    res.json({
      timestamp: results.timestamp,
      states: results.states
    });
  } catch (error) {
    console.error('Error fetching state data:', error);
    res.status(500).json({ error: 'Failed to fetch state data' });
  }
});

// API endpoint to get alliance-wise aggregation
app.get('/api/alliance-wise', async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true' || req.query.force === '1';
    let results;
    
    if (forceRefresh || latestResults.states.length === 0) {
      results = await electionScraper.fetchResults();
      latestResults = results;
    } else {
      results = latestResults;
    }
    
    const allianceData = aggregateByAlliance(results);
    res.json(allianceData);
  } catch (error) {
    console.error('Error aggregating alliance data:', error);
    res.status(500).json({ error: 'Failed to aggregate alliance data' });
  }
});

// API endpoint to get change history
app.get('/api/refresh-history', (req, res) => {
  try {
    res.json({
      history: changeHistory,
      totalUpdates: changeHistory.length
    });
  } catch (error) {
    console.error('Error fetching refresh history:', error);
    res.status(500).json({ error: 'Failed to fetch refresh history' });
  }
});

// API endpoint to receive data from local service
app.post('/api/push-data', express.json({ limit: '10mb' }), (req, res) => {
  try {
    const data = req.body;
    
    // Validate data structure
    if (!data.states || !Array.isArray(data.states)) {
      return res.status(400).json({ error: 'Invalid data format. Expected { states: [], summary: {} }' });
    }
    
    // Update latest results
    latestResults = {
      timestamp: data.timestamp || Date.now(),
      states: data.states,
      summary: data.summary || {}
    };
    
    // Track changes
    const changeInfo = compareResults({}, latestResults);
    if (changeInfo.hasChanges) {
      changeHistory.unshift({
        timestamp: Date.now(),
        changes: changeInfo.changes,
        summary: latestResults.summary,
        isFirstUpdate: changeHistory.length === 0
      });
      
      // Keep only last 100 updates
      if (changeHistory.length > 100) {
        changeHistory = changeHistory.slice(0, 100);
      }
    }
    
    console.log(`✅ Received data push: ${data.states.length} constituencies, ${data.summary?.declared || 0} declared, ${data.summary?.leading || 0} leading`);
    
    res.json({ 
      success: true, 
      message: 'Data received successfully',
      constituenciesCount: data.states.length,
      timestamp: latestResults.timestamp
    });
  } catch (error) {
    console.error('Error receiving data push:', error);
    res.status(500).json({ error: 'Failed to process data push', message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasData: latestResults.timestamp !== null,
    dataAge: latestResults.timestamp ? Date.now() - latestResults.timestamp : null,
    constituenciesCount: latestResults.states ? latestResults.states.length : 0
  });
});

// Test endpoint to manually trigger scraper and see what happens
app.get('/api/test-scraper', async (req, res) => {
  try {
    console.log('🧪 Test scraper endpoint called');
    const results = await electionScraper.fetchResults();
    res.json({
      success: true,
      constituenciesFound: results.states.length,
      declared: results.summary.declared,
      leading: results.summary.leading,
      pending: results.summary.pending,
      sample: results.states.slice(0, 5).map(s => ({
        name: s.name,
        constNo: s.constNo,
        status: s.status,
        leadingParty: s.leadingParty,
        declared: s.declared,
        leading: s.leading
      })),
      timestamp: results.timestamp,
      hasRealData: results.states.some(s => s.leadingParty && s.leadingParty !== 'Unknown' && (s.declared > 0 || s.leading > 0))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Serve static files in production
const buildPath = path.join(__dirname, '../client/build');
if (process.env.NODE_ENV === 'production' || fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Schedule automatic data fetching every 5 minutes
const cron = require('node-cron');

// Fetch data automatically every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('\n⏰ Scheduled data fetch triggered...');
  try {
    const results = await electionScraper.fetchResults();
    const changeInfo = compareResults(latestResults, results);
    
    latestResults = results;
    
    if (changeInfo.hasChanges) {
      changeHistory.unshift({
        timestamp: Date.now(),
        changes: changeInfo.changes,
        summary: results.summary,
        isFirstUpdate: false
      });
      
      if (changeHistory.length > 100) {
        changeHistory = changeHistory.slice(0, 100);
      }
      
      console.log(`✅ Scheduled update completed: ${results.states.length} constituencies, ${results.summary.declared} declared, ${results.summary.leading} leading`);
    } else {
      console.log(`✅ Scheduled update completed (no changes): ${results.states.length} constituencies`);
    }
  } catch (error) {
    console.error('❌ Error in scheduled fetch:', error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

app.listen(PORT, () => {
  console.log(`🚀 Election Tracker Server running on port ${PORT}`);
  console.log(`📊 Fetching initial results...`);
  console.log(`⏰ Auto-refresh scheduled: Every 5 minutes`);
  
  // Fetch initial results
  electionScraper.fetchResults()
    .then(results => {
      latestResults = results;
      console.log(`✅ Initial results loaded: ${results.states.length} states`);
      console.log(`   Declared: ${results.summary.declared}, Leading: ${results.summary.leading}, Pending: ${results.summary.pending}`);
      const hasRealData = results.states.some(s => s.leadingParty && s.leadingParty !== 'Unknown' && (s.declared > 0 || s.leading > 0));
      if (!hasRealData) {
        console.log(`⚠️  WARNING: No real data found! All constituencies appear to be empty.`);
        console.log(`   The scraper will retry automatically every 5 minutes.`);
      }
    })
    .catch(err => {
      console.error('❌ Error loading initial results:', err.message);
      console.error('Stack:', err.stack);
      console.log(`   The scraper will retry automatically every 5 minutes.`);
    });
});

