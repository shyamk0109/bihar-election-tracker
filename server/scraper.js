const axios = require('axios');
const cheerio = require('cheerio');

const ECI_BASE_URL = 'https://results.eci.gov.in/ResultAcGenNov2025/statewiseS041.htm';
const TOTAL_CONSTITUENCIES = 243; // Bihar has 243 constituencies

/**
 * Fetches a single page of results
 */
async function fetchPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://results.eci.gov.in/'
      },
      timeout: 20000,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    return cheerio.load(response.data);
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}, Headers:`, error.response.headers);
    }
    return null;
  }
}

/**
 * Finds pagination links on the page
 */
function findPaginationLinks($) {
  const links = [];
  const baseUrl = ECI_BASE_URL.substring(0, ECI_BASE_URL.lastIndexOf('/'));
  
  // Look for pagination links (statewiseS041.htm, statewiseS042.htm, etc.)
  $('a').each((index, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().trim();
    
    if (href) {
      // Check for statewiseS04 pattern (pagination links)
      if (href.match(/statewiseS04\d+\.htm/i)) {
        const fullUrl = href.startsWith('http') ? href : `${baseUrl}/${href}`;
        if (!links.includes(fullUrl)) {
          links.push(fullUrl);
        }
      }
      
      // Also check for numbered links (1, 2, 3, etc.)
      if (text.match(/^\d+$/) && href.match(/statewiseS04/i)) {
        const fullUrl = href.startsWith('http') ? href : `${baseUrl}/${href}`;
        if (!links.includes(fullUrl)) {
          links.push(fullUrl);
        }
      }
    }
  });
  
  // Also generate pagination URLs if pattern is found
  if (links.length === 0) {
    // Try generating page URLs based on pattern
    for (let i = 2; i <= 20; i++) {
      const pageUrl = ECI_BASE_URL.replace(/statewiseS041\.htm$/, `statewiseS04${i}.htm`);
      links.push(pageUrl);
    }
  }
  
  return links;
}

/**
 * Parses constituency data from a page
 */
function parseConstituencies($) {
  const constituencies = [];
  
  // Find the main results table (table with class 'table' or first large table)
  let mainTable = $('table.table, table.table-striped, table.table-bordered').first();
  
  // If not found, find the largest table
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
  
  // Fallback to first table
  if (mainTable.length === 0) {
    mainTable = $('table').first();
  }
  
  if (mainTable.length === 0) {
    return constituencies;
  }
  
  // Helper function to extract text from cell, removing nested tables
  const getCellText = (cell) => {
    const $cell = $(cell);
    // Clone to avoid modifying original
    const $clone = $cell.clone();
    // Remove nested tables and tooltips
    $clone.find('table, .tooltip, .tooltip-icon').remove();
    return $clone.text().trim().replace(/\s+/g, ' ');
  };
  
  // Helper function to extract party name from nested table structure
  const getPartyName = (cell) => {
    const $cell = $(cell);
    // First try to find party name in nested table's first td
    const partyCell = $cell.find('table tbody tr td').first();
    if (partyCell.length > 0) {
      const partyText = partyCell.text().trim();
      // Remove tooltip text if present
      return partyText.split('iParty')[0].trim();
    }
    // Fallback to regular text extraction
    return getCellText(cell);
  };
  
  // Parse rows from the main table
  mainTable.find('tr').each((index, element) => {
    const $row = $(element);
    // Only get direct child cells (not from nested tables)
    const cells = $row.children('td, th');
    
    if (cells.length < 9) {
      return;
    }
    
    // Extract constituency name (first column)
    const constituencyName = getCellText(cells[0]);
    const constNo = getCellText(cells[1]);
    
    // Skip header rows and status messages
    if (!constituencyName || 
        constituencyName.toLowerCase().includes('status known') ||
        constituencyName.toLowerCase().includes('constituency') ||
        constituencyName.length < 2 ||
        constituencyName.length > 50 ||
        !constNo.match(/^\d+$/)) { // Const No must be a number
      return;
    }
    
    // Extract data from columns
    // Format: Constituency | Const. No. | Leading Candidate | Leading Party | Trailing Candidate | Trailing Party | Margin | Round | Status
    const leadingCandidate = getCellText(cells[2]);
    const leadingParty = getPartyName(cells[3]);
    const trailingCandidate = getCellText(cells[4]);
    const trailingParty = getPartyName(cells[5]);
    const marginText = getCellText(cells[6]);
    const round = getCellText(cells[7]);
    const statusText = getCellText(cells[8]);
    
    // Parse margin as number (remove commas)
    const margin = parseInt(marginText.replace(/,/g, '')) || 0;
    
    // Determine status based on status column
    let declared = 0;
    let leading = 0;
    let pending = 1;
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
        // "Result in Progress" means counting is ongoing, candidate is leading
        declared = 0;
        leading = 1;
        pending = 0;
        status = 'Leading';
      }
    }
    
    // If we have a leading candidate, it's at least leading
    if (leadingCandidate && leadingCandidate.length > 0 && 
        !leadingCandidate.toLowerCase().includes('leading') &&
        status === 'Pending') {
      leading = 1;
      pending = 0;
      status = 'Leading';
    }
    
    // Only add if we have a valid constituency name
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
 * Fetches and parses election results from ECI website with pagination
 */
async function fetchResults() {
  try {
    const allConstituencies = [];
    const visitedUrls = new Set();
    const urlsToVisit = [ECI_BASE_URL];
    
    console.log('📊 Starting to fetch Bihar election results (243 constituencies)...');
    
    // Fetch pages until we have all constituencies or no more pages
    while (urlsToVisit.length > 0 && allConstituencies.length < TOTAL_CONSTITUENCIES) {
      const currentUrl = urlsToVisit.shift();
      
      if (visitedUrls.has(currentUrl)) {
        continue;
      }
      
      visitedUrls.add(currentUrl);
      console.log(`📄 Fetching page: ${currentUrl} (Found ${allConstituencies.length} constituencies so far)`);
      
      const $ = await fetchPage(currentUrl);
      if (!$) {
        continue;
      }
      
      // Parse constituencies from this page
      const constituencies = parseConstituencies($);
      
      // Add unique constituencies (by name or constNo)
      constituencies.forEach(constituency => {
        const exists = allConstituencies.find(c => 
          c.name === constituency.name || 
          (c.constNo && constituency.constNo && c.constNo === constituency.constNo)
        );
        if (!exists) {
          allConstituencies.push(constituency);
        }
      });
      
      // Find pagination links
      const paginationLinks = findPaginationLinks($);
      paginationLinks.forEach(link => {
        if (!visitedUrls.has(link) && !urlsToVisit.includes(link)) {
          urlsToVisit.push(link);
        }
      });
      
      // Also try generating pagination URLs based on pattern (statewiseS041, statewiseS042, etc.)
      if (paginationLinks.length === 0 || allConstituencies.length < 50) {
        const baseUrl = ECI_BASE_URL.substring(0, ECI_BASE_URL.lastIndexOf('/'));
        for (let page = 2; page <= 15; page++) {
          const pageUrl = `${baseUrl}/statewiseS04${page}.htm`;
          if (!visitedUrls.has(pageUrl) && !urlsToVisit.includes(pageUrl)) {
            urlsToVisit.push(pageUrl);
          }
        }
      }
      
      // Limit to prevent infinite loops
      if (visitedUrls.size > 20) {
        console.log('⚠️  Reached page limit, stopping pagination');
        break;
      }
    }
    
    // Remove duplicates and ensure we have exactly 243
    const uniqueConstituencies = [];
    const seen = new Set();
    
    allConstituencies.forEach(c => {
      const key = c.constNo || c.name;
      if (!seen.has(key) && c.name && c.name.length > 1) {
        seen.add(key);
        uniqueConstituencies.push(c);
      }
    });
    
    // Sort by constituency number if available
    uniqueConstituencies.sort((a, b) => {
      if (a.constNo && b.constNo) return a.constNo - b.constNo;
      return a.name.localeCompare(b.name);
    });
    
    // If we didn't get enough, fill with pending ones
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
    
    // Take exactly 243
    const finalConstituencies = uniqueConstituencies.slice(0, TOTAL_CONSTITUENCIES);
    
    console.log(`✅ Fetched ${finalConstituencies.length} unique constituencies`);
    
    // Calculate summary correctly - ensure no double counting
    const declared = finalConstituencies.filter(c => c.status === 'Declared' || c.declared > 0).length;
    const leading = finalConstituencies.filter(c => c.status === 'Leading' && c.declared === 0 && c.leading > 0).length;
    
    // Double check: if all are declared, pending should be 0
    let pending = 0;
    if (declared === TOTAL_CONSTITUENCIES) {
      pending = 0;
    } else {
      pending = Math.max(0, TOTAL_CONSTITUENCIES - declared - leading);
    }
    
    return {
      timestamp: Date.now(),
      states: finalConstituencies,
      summary: {
        totalSeats: TOTAL_CONSTITUENCIES,
        declared: declared,
        leading: leading,
        pending: Math.max(0, pending),
        totalVotes: 0
      }
    };
  } catch (error) {
    console.error('Error fetching from ECI:', error.message);
    console.error('Stack:', error.stack);
    // Return fallback data if scraping fails
    return getFallbackData();
  }
}

/**
 * Fallback data structure when scraping fails
 * Returns structure for Bihar's 243 constituencies
 */
function getFallbackData() {
  const constituencies = [];
  for (let i = 1; i <= TOTAL_CONSTITUENCIES; i++) {
    constituencies.push({
      name: `Bihar Constituency ${i}`,
      declared: 0,
      leading: 0,
      pending: 1,
      status: 'Pending'
    });
  }
  
  return {
    timestamp: Date.now(),
    states: constituencies,
    summary: {
      totalSeats: TOTAL_CONSTITUENCIES,
      declared: 0,
      leading: 0,
      pending: TOTAL_CONSTITUENCIES,
      totalVotes: 0
    }
  };
}

/**
 * Aggregates results by party with detailed statistics
 */
function aggregateByParty(results) {
  const partyData = {};
  
  results.states.forEach(constituency => {
    // Process leading party
    if (constituency.leadingParty && constituency.leadingParty !== 'Unknown') {
      if (!partyData[constituency.leadingParty]) {
        partyData[constituency.leadingParty] = {
          name: constituency.leadingParty,
          leading: 0,
          declared: 0,
          trailing: 0,
          totalSeats: 0,
          constituencies: [],
          totalMargin: 0,
          avgMargin: 0
        };
      }
      
      if (constituency.status === 'Declared') {
        partyData[constituency.leadingParty].declared++;
        partyData[constituency.leadingParty].totalSeats++;
      } else if (constituency.status === 'Leading') {
        partyData[constituency.leadingParty].leading++;
        partyData[constituency.leadingParty].totalSeats++;
      }
      
      partyData[constituency.leadingParty].constituencies.push({
        name: constituency.name,
        constNo: constituency.constNo,
        candidate: constituency.leadingCandidate,
        margin: constituency.margin,
        status: constituency.status
      });
      
      partyData[constituency.leadingParty].totalMargin += constituency.margin || 0;
    }
    
    // Process trailing party
    if (constituency.trailingParty && constituency.trailingParty !== 'Unknown') {
      if (!partyData[constituency.trailingParty]) {
        partyData[constituency.trailingParty] = {
          name: constituency.trailingParty,
          leading: 0,
          declared: 0,
          trailing: 0,
          totalSeats: 0,
          constituencies: [],
          totalMargin: 0,
          avgMargin: 0
        };
      }
      
      partyData[constituency.trailingParty].trailing++;
    }
  });
  
  // Calculate averages and total seats (declared + leading + trailing)
  const parties = Object.values(partyData).map(party => {
    party.avgMargin = party.constituencies.length > 0 
      ? Math.round(party.totalMargin / party.constituencies.length) 
      : 0;
    // Total seats = declared + leading + trailing
    party.totalSeats = party.declared + party.leading + party.trailing;
    return party;
  });
  
  // Sort by total seats (declared + leading), then by leading
  parties.sort((a, b) => {
    const aTotal = a.declared + a.leading;
    const bTotal = b.declared + b.leading;
    if (bTotal !== aTotal) return bTotal - aTotal;
    return b.leading - a.leading;
  });

  return {
    timestamp: results.timestamp,
    parties: parties,
    totalSeats: results.summary.totalSeats,
    summary: {
      totalParties: parties.length,
      partiesLeading: parties.filter(p => p.leading > 0 || p.declared > 0).length,
      partiesTrailing: parties.filter(p => p.trailing > 0).length
    }
  };
}

module.exports = {
  fetchResults,
  aggregateByParty
};


