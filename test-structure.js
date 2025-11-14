// Simple structure validation script
// Run with: node test-structure.js (once Node.js is installed)

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating project structure...\n');

const requiredFiles = [
  'package.json',
  'server/index.js',
  'server/scraper.js',
  'client/package.json',
  'client/src/App.js',
  'client/src/index.js',
  'client/src/components/Dashboard.js',
  'client/src/components/Header.js',
  'client/src/components/SummaryCards.js',
  'client/src/components/StateWiseTable.js',
  'client/src/components/ResultsChart.js'
];

let allGood = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ All required files are present!');
  console.log('\n📋 Next steps:');
  console.log('1. Install Node.js from https://nodejs.org/');
  console.log('2. Run: npm run install-all');
  console.log('3. Run: npm run dev');
} else {
  console.log('❌ Some files are missing. Please check the structure.');
}

console.log('='.repeat(50));

