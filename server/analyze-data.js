// Analyze ECI data structure
const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('eci-page.html', 'utf8');
const $ = cheerio.load(html);

console.log('=== ECI DATA ANALYSIS ===\n');

// Find the main table
const mainTable = $('table').first();
const rows = mainTable.find('tr');

console.log(`Total rows in main table: ${rows.length}\n`);

// Parse first few data rows
let dataRows = [];
rows.each((index, row) => {
  const $row = $(row);
  const cells = $row.find('> td, > th'); // Only direct children
  
  if (cells.length >= 9) {
    // Get text from cells, but handle nested tables
    const getCellText = (cell) => {
      const $cell = $(cell);
      // Remove nested tables and tooltips
      $cell.find('table, .tooltip').remove();
      return $cell.text().trim();
    };
    
    const rowData = {
      index: index,
      constituency: getCellText(cells[0]),
      constNo: getCellText(cells[1]),
      leadingCandidate: getCellText(cells[2]),
      leadingParty: getCellText(cells[3]).replace(/\s+/g, ' '),
      trailingCandidate: getCellText(cells[4]),
      trailingParty: getCellText(cells[5]).replace(/\s+/g, ' '),
      margin: getCellText(cells[6]),
      round: getCellText(cells[7]),
      status: getCellText(cells[8])
    };
    
    // Skip header rows and invalid rows
    if (rowData.constituency && 
        !rowData.constituency.toLowerCase().includes('status known') &&
        !rowData.constituency.toLowerCase().includes('constituency') &&
        rowData.constituency.length > 1 &&
        rowData.constituency.length < 50 &&
        !rowData.constituency.match(/^\d+$/) &&
        rowData.constNo.match(/^\d+$/)) { // Const No should be a number
      dataRows.push(rowData);
    }
  }
});

console.log(`Found ${dataRows.length} constituency rows\n`);

// Show first 5 examples
console.log('First 5 constituencies:');
dataRows.slice(0, 5).forEach((row, i) => {
  console.log(`\n${i + 1}. ${row.constituency} (No. ${row.constNo})`);
  console.log(`   Status: ${row.status}`);
  console.log(`   Leading: ${row.leadingCandidate} (${row.leadingParty.substring(0, 30)})`);
  console.log(`   Trailing: ${row.trailingCandidate} (${row.trailingParty.substring(0, 30)})`);
  console.log(`   Margin: ${row.margin}, Round: ${row.round}`);
});

// Analyze status distribution
const statusCounts = {};
dataRows.forEach(row => {
  const status = row.status || 'Unknown';
  statusCounts[status] = (statusCounts[status] || 0) + 1;
});

console.log('\n\n=== STATUS DISTRIBUTION ===');
Object.entries(statusCounts).forEach(([status, count]) => {
  console.log(`${status}: ${count}`);
});

// Check for pagination
console.log('\n\n=== PAGINATION LINKS ===');
const paginationLinks = [];
$('a').each((index, link) => {
  const href = $(link).attr('href');
  const text = $(link).text().trim();
  if (href && href.match(/statewiseS04\d+\.htm/i)) {
    paginationLinks.push({ text, href });
  }
});

console.log(`Found ${paginationLinks.length} pagination links`);
paginationLinks.slice(0, 10).forEach(link => {
  console.log(`  ${link.text} -> ${link.href}`);
});

