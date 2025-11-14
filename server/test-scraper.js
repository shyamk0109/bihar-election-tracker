// Test script to inspect ECI website structure
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const ECI_BASE_URL = 'https://results.eci.gov.in/ResultAcGenNov2025/statewiseS041.htm';

async function testScraper() {
  try {
    console.log('Fetching ECI website...');
    const response = await axios.get(ECI_BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // Save HTML for inspection
    fs.writeFileSync('eci-page.html', response.data);
    console.log('✅ Saved HTML to eci-page.html');
    
    // Find all tables
    console.log('\n📊 Found tables:');
    $('table').each((index, table) => {
      console.log(`\nTable ${index + 1}:`);
      const $table = $(table);
      const rows = $table.find('tr');
      console.log(`  Rows: ${rows.length}`);
      
      // Show first few rows
      rows.slice(0, 5).each((i, row) => {
        const cells = $(row).find('td, th');
        const cellTexts = [];
        cells.each((j, cell) => {
          cellTexts.push($(cell).text().trim());
        });
        console.log(`  Row ${i + 1}: ${cellTexts.join(' | ')}`);
      });
    });
    
    // Find pagination links
    console.log('\n🔗 Pagination links:');
    $('a').each((index, link) => {
      const href = $(link).attr('href');
      const text = $(link).text().trim();
      if (href && (text.toLowerCase().includes('next') || text.match(/^\d+$/) || href.match(/page/i))) {
        console.log(`  ${text} -> ${href}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testScraper();

