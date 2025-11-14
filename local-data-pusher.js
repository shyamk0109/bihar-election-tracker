/**
 * Local Data Pusher Service
 * Fetches data from ECI website and pushes to Railway deployment
 * Run this on your local machine: node local-data-pusher.js
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://web-production-8807.up.railway.app/api/push-data';
const ECI_BASE_URL = 'https://results.eci.gov.in/ResultAcGenNov2025/statewiseS041.htm';
const TOTAL_CONSTITUENCIES = 243;
const PUSH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches a single page of results
 */
async function fetchPage(url) {
  try {
    console.log(`  🌐 Fetching: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
      },
      timeout: 30000,
    });
    return cheerio.load(response.data);
  } catch (error) {
    console.error(`  ❌ Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Extracts text from a cell, removing nested tables
 */
function getCellText(cell, $) {
  const $cell = $(cell);
  const $clone = $cell.clone();
  $clone.find('table, .tooltip, .tooltip-icon').remove();
  return $clone.text().trim().replace(/\s+/g, ' ');
}

/**
 * Extracts party name from nested table structure
 */
function getPartyName(cell, $) {
  const $cell = $(cell);
  const partyCell = $cell.find('table tbody tr td').first();
  if (partyCell.length > 0) {
    const partyText = partyCell.text().trim();
    return partyText.split('iParty')[0].trim();
  }
  return getCellText(cell, $);
}

/**
 * Parses constituencies from a page
 */
function parseConstituencies($) {
  const constituencies = [];
  
  // Find the main results table
  let mainTable = $('table.table, table.table-striped, table.table-bordered').first();
  
  if (mainTable.length === 0) {
    const tables = $('table');
    let maxRows = 0;
    tables.each((index, table) => {
      const rows = $(table).find('tr').length;
      if (rows > maxRows && rows > 10) {
        maxRows = rows;
        mainTable = $(table);
      }
    });
  }
  
  if (mainTable.length === 0) {
    mainTable = $('table').first();
  }
  
  if (mainTable.length === 0) {
    return constituencies;
  }
  
  // Parse rows
  mainTable.find('tr').each((index, element) => {
    const $row = $(element);
    const cells = $row.children('td, th');
    
    if (cells.length < 9) return;
    
    const constituencyName = getCellText(cells[0]);
    const constNo = getCellText(cells[1]);
    
    // Skip header rows
    if (!constituencyName || 
        constituencyName.toLowerCase().includes('status known') ||
        constituencyName.toLowerCase().includes('constituency') ||
        constituencyName.length < 2 ||
        constituencyName.length > 50 ||
        !constNo.match(/^\d+$/)) {
      return;
    }
    
    const leadingCandidate = getCellText(cells[2]);
    const leadingParty = getPartyName(cells[3]);
    const trailingCandidate = getCellText(cells[4]);
    const trailingParty = getPartyName(cells[5]);
    const marginText = getCellText(cells[6]);
    const round = getCellText(cells[7]);
    const statusText = getCellText(cells[8]);
    
    const margin = parseInt(marginText.replace(/,/g, '')) || 0;
    
    let declared = 0, leading = 0, pending = 1;
    let status = 'Pending';
    
    if (statusText) {
      const statusLower = statusText.toLowerCase();
      if (statusLower.includes('won') || statusLower.includes('declared') || 
          (statusLower.includes('result') && !statusLower.includes('progress'))) {
        declared = 1;
        leading = 0;
        pending = 0;
        status = 'Declared';
      } else if (statusLower.includes('result in progress') || statusLower.includes('leading') || 
                 statusLower.includes('progress')) {
        declared = 0;
        leading = 1;
        pending = 0;
        status = 'Leading';
      }
    }
    
    if (leadingCandidate && leadingCandidate.length > 0 && 
        !leadingCandidate.toLowerCase().includes('leading') &&
        status === 'Pending') {
      leading = 1;
      pending = 0;
      status = 'Leading';
    }
    
    if (constituencyName && constituencyName.length > 1 && constituencyName.length < 50) {
      constituencies.push({
        name: constituencyName,
        constNo: parseInt(constNo) || 0,
        leadingCandidate: leadingCandidate,
        leadingParty: leadingParty || 'Unknown',
        trailingCandidate: trailingCandidate || '',
        trailingParty: trailingParty || 'Unknown',
        margin: margin,
        marginText: marginText,
        round: round,
        declared: declared,
        leading: leading,
        pending: pending,
        status: status
      });
    }
  });
  
  return constituencies;
}

/**
 * Fetches all results from ECI website
 */
async function fetchAllResults() {
  try {
    const allConstituencies = [];
    const visitedUrls = new Set();
    const urlsToVisit = [ECI_BASE_URL];
    const baseUrl = ECI_BASE_URL.substring(0, ECI_BASE_URL.lastIndexOf('/'));
    
    console.log('📊 Starting to fetch Bihar election results (243 constituencies)...');
    
    // Generate pagination URLs
    for (let page = 2; page <= 20; page++) {
      urlsToVisit.push(`${baseUrl}/statewiseS04${page}.htm`);
    }
    
    // Fetch all pages
    for (const url of urlsToVisit) {
      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);
      
      console.log(`📄 Fetching: ${url} (Found ${allConstituencies.length} so far)`);
      
      const $ = await fetchPage(url);
      if (!$) continue;
      
      const constituencies = parseConstituencies($);
      console.log(`  ✅ Parsed ${constituencies.length} constituencies`);
      
      // Add unique constituencies
      constituencies.forEach(constituency => {
        const exists = allConstituencies.find(c => 
          c.name === constituency.name || 
          (c.constNo && constituency.constNo && c.constNo === constituency.constNo)
        );
        if (!exists) {
          allConstituencies.push(constituency);
        }
      });
      
      if (allConstituencies.length >= TOTAL_CONSTITUENCIES) {
        console.log(`✅ Found all ${TOTAL_CONSTITUENCIES} constituencies!`);
        break;
      }
    }
    
    // Remove duplicates
    const uniqueConstituencies = [];
    const seen = new Set();
    allConstituencies.forEach(c => {
      const key = c.constNo || c.name;
      if (!seen.has(key) && c.name && c.name.length > 1) {
        seen.add(key);
        uniqueConstituencies.push(c);
      }
    });
    
    // Sort by constituency number
    uniqueConstituencies.sort((a, b) => {
      if (a.constNo && b.constNo) return a.constNo - b.constNo;
      return a.name.localeCompare(b.name);
    });
    
    // Fill to 243 if needed
    while (uniqueConstituencies.length < TOTAL_CONSTITUENCIES) {
      uniqueConstituencies.push({
        name: `Constituency ${uniqueConstituencies.length + 1}`,
        constNo: uniqueConstituencies.length + 1,
        declared: 0,
        leading: 0,
        pending: 1,
        status: 'Pending'
      });
    }
    
    const finalConstituencies = uniqueConstituencies.slice(0, TOTAL_CONSTITUENCIES);
    
    // Calculate summary
    const declared = finalConstituencies.filter(c => c.status === 'Declared' || c.declared > 0).length;
    const leading = finalConstituencies.filter(c => c.status === 'Leading' && c.declared === 0 && c.leading > 0).length;
    const pending = Math.max(0, TOTAL_CONSTITUENCIES - declared - leading);
    
    return {
      timestamp: Date.now(),
      states: finalConstituencies,
      summary: {
        totalSeats: TOTAL_CONSTITUENCIES,
        declared: declared,
        leading: leading,
        pending: pending,
        totalVotes: 0
      }
    };
  } catch (error) {
    console.error('❌ Error fetching results:', error);
    throw error;
  }
}

/**
 * Pushes data to Railway
 */
async function pushToRailway(data) {
  try {
    console.log(`\n🚀 Pushing data to Railway...`);
    const response = await axios.post(RAILWAY_API_URL, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log(`✅ Successfully pushed to Railway!`);
    console.log(`   Constituencies: ${data.states.length}`);
    console.log(`   Declared: ${data.summary.declared}, Leading: ${data.summary.leading}, Pending: ${data.summary.pending}`);
    return true;
  } catch (error) {
    console.error(`❌ Error pushing to Railway:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response:`, error.response.data);
    }
    return false;
  }
}

/**
 * Main function - fetches and pushes data
 */
async function fetchAndPush() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log(`🔄 Starting data fetch and push at ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
    
    const results = await fetchAllResults();
    await pushToRailway(results);
    
    console.log(`\n✅ Process completed at ${new Date().toLocaleString()}`);
    console.log(`⏰ Next update in 5 minutes...\n`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run immediately on start
console.log('🚀 Local Data Pusher Service Started');
console.log(`📡 Railway API: ${RAILWAY_API_URL}`);
console.log(`⏰ Update interval: 5 minutes\n`);

fetchAndPush();

// Then run every 5 minutes
setInterval(fetchAndPush, PUSH_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

