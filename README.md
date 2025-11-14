# 🗳️ Bihar Election Tracker - Real-time Results Dashboard

A comprehensive web application that tracks and aggregates election results from the Election Commission of India (ECI) website in real-time. Built with expert election analyst features including data visualization, state-wise breakdowns, party-wise analysis, and alliance-level analytics.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Data Flow](#data-flow)
- [Backend API](#backend-api)
- [Frontend Components](#frontend-components)
- [Data Scraping](#data-scraping)
- [Alliance System](#alliance-system)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Key Features](#key-features)
- [Extending the Application](#extending-the-application)

---

## 🚀 Quick Deploy

**Deploy to Railway in 5 minutes:**
1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Get your live link!

See `QUICK_DEPLOY.md` for step-by-step instructions or `DEPLOYMENT.md` for detailed guide.

---

## 🎯 Project Overview

This application is designed to track Bihar Assembly Election results in real-time. It scrapes data from the ECI website (https://results.eci.gov.in/ResultAcGenNov2025/statewiseS041.htm), processes it, and presents it in an analytical dashboard format.

### Key Capabilities:
- **Real-time Data Fetching**: Automatically scrapes and updates election results every 30 seconds
- **Multi-page Scraping**: Handles pagination across multiple result pages
- **Constituency-level Details**: Shows candidate names, parties, vote margins, and status
- **Party-wise Analysis**: Aggregates results by individual political parties
- **Alliance Analysis**: Groups parties into NDA, Mahagathbandhan, and Others
- **Political Insights**: Provides analyst-style commentary and projections

### Election Context:
- **State**: Bihar
- **Total Constituencies**: 243
- **Majority Threshold**: 122 seats (50% + 1)
- **Data Source**: Election Commission of India official website

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   ECI Website   │
│  (results.eci)  │
└────────┬────────┘
         │
         │ HTTP Requests (with pagination)
         │
┌────────▼─────────────────────────┐
│      Backend Server              │
│  ┌───────────────────────────┐  │
│  │   Express.js Server       │  │
│  │   Port: 5000              │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Scraper Module          │  │
│  │   - Fetches HTML pages    │  │
│  │   - Parses constituency   │  │
│  │   - Handles pagination    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Alliance Module         │  │
│  │   - Groups parties        │  │
│  │   - Calculates totals     │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   API Endpoints           │  │
│  │   - /api/results          │  │
│  │   - /api/party-wise       │  │
│  │   - /api/alliance-wise    │  │
│  └───────────────────────────┘  │
└────────┬─────────────────────────┘
         │
         │ REST API (JSON)
         │
┌────────▼─────────────────────────┐
│      Frontend (React)            │
│  ┌───────────────────────────┐  │
│  │   React Components        │  │
│  │   - Dashboard             │  │
│  │   - Charts (Recharts)     │  │
│  │   - Tables                │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Auto-refresh (30s)      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Data Flow

1. **Scraping Phase**:
   - Backend initiates request to ECI website
   - Fetches first page (statewiseS041.htm)
   - Parses HTML using Cheerio
   - Extracts constituency data
   - Identifies pagination links
   - Fetches subsequent pages (statewiseS042.htm, etc.)
   - Continues until all 243 constituencies are found

2. **Processing Phase**:
   - Deduplicates constituencies
   - Extracts party names from nested tables
   - Calculates vote margins
   - Determines status (Declared/Leading/Pending)
   - Groups by party
   - Groups by alliance (NDA/MGB/Others)

3. **API Phase**:
   - Stores processed data in memory
   - Serves via REST endpoints
   - Caches for 30 seconds to reduce load

4. **Frontend Phase**:
   - React components fetch from API
   - Data is rendered in tables and charts
   - Auto-refreshes every 30 seconds
   - Updates UI in real-time

---

## 📁 Project Structure

```
Election/
├── server/                          # Backend Node.js application
│   ├── index.js                    # Express server setup and API routes
│   ├── scraper.js                  # ECI website scraper and parser
│   ├── alliances.js                # Alliance definitions and aggregation
│   ├── analyze-data.js             # Data analysis utility (dev tool)
│   └── test-scraper.js             # Scraper testing utility
│
├── client/                          # Frontend React application
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── App.js                  # Main React component
│   │   ├── App.css                 # App styles
│   │   ├── index.js                # React entry point
│   │   ├── index.css               # Global styles
│   │   └── components/
│   │       ├── Dashboard.js        # Main dashboard container
│   │       ├── Dashboard.css
│   │       ├── Header.js           # Top header with refresh button
│   │       ├── Header.css
│   │       ├── SummaryCards.js     # Summary statistics cards
│   │       ├── SummaryCards.css
│   │       ├── StateWiseTable.js   # Constituency results table
│   │       ├── StateWiseTable.css
│   │       ├── ResultsChart.js     # Bar and pie charts
│   │       ├── ResultsChart.css
│   │       ├── PartyWise.js        # Party-wise analysis component
│   │       ├── PartyWise.css
│   │       ├── AllianceAnalysis.js # Alliance-level analysis
│   │       ├── AllianceAnalysis.css
│   │       ├── LoadingSpinner.js   # Loading indicator
│   │       └── LoadingSpinner.css
│   └── package.json                # React dependencies
│
├── package.json                     # Root package.json with scripts
├── README.md                        # This file
├── SETUP.md                         # Setup instructions
├── .gitignore                       # Git ignore rules
└── eci-page.html                    # Cached HTML for analysis (dev)
```

---

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web server framework
- **Axios**: HTTP client for web scraping
- **Cheerio**: Server-side HTML parsing (jQuery-like)
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Frontend
- **React 18**: UI library
- **Recharts**: Charting library (bar, pie charts)
- **Axios**: HTTP client for API calls
- **date-fns**: Date formatting utilities

### Development Tools
- **nodemon**: Auto-restart server on changes
- **concurrently**: Run server and client simultaneously

---

## 🔄 Data Flow

### 1. Scraping Process (`server/scraper.js`)

```javascript
fetchResults() 
  → fetchPage(url)           // Get HTML from ECI
  → parseConstituencies($)    // Extract data from HTML
  → findPaginationLinks($)   // Find next page links
  → Repeat for all pages      // Until 243 constituencies found
  → Deduplicate              // Remove duplicates
  → Return structured data    // JSON format
```

### 2. Data Structure

**Constituency Object:**
```javascript
{
  name: "AGIAON",                    // Constituency name
  constNo: 195,                      // Constituency number (1-243)
  leadingCandidate: "MAHESH PASWAN", // Leading candidate name
  leadingParty: "Bharatiya Janata Party", // Leading party
  trailingCandidate: "SHIV PRAKASH RANJAN", // Trailing candidate
  trailingParty: "Communist Party...",     // Trailing party
  margin: 2037,                      // Vote margin (number)
  marginText: "2037",                // Vote margin (string)
  round: "4/24",                     // Round information
  declared: 0,                       // 1 if declared, 0 otherwise
  leading: 1,                        // 1 if leading, 0 otherwise
  pending: 0,                        // 1 if pending, 0 otherwise
  status: "Leading"                  // "Declared" | "Leading" | "Pending"
}
```

**Summary Object:**
```javascript
{
  totalSeats: 243,     // Total constituencies
  declared: 0,         // Count of declared seats
  leading: 241,        // Count of leading seats
  pending: 2,          // Count of pending seats
  totalVotes: 0        // Total votes (if available)
}
```

### 3. Party Aggregation (`server/scraper.js` → `aggregateByParty()`)

Groups constituencies by leading party:
```javascript
{
  name: "Bharatiya Janata Party",
  leading: 81,           // Seats where party is leading
  declared: 0,           // Seats declared for party
  trailing: 20,          // Seats where party is trailing
  totalSeats: 81,        // Total seats (declared + leading)
  constituencies: [...], // Array of constituency objects
  totalMargin: 150000,   // Sum of all vote margins
  avgMargin: 1851        // Average vote margin
}
```

### 4. Alliance Aggregation (`server/alliances.js` → `aggregateByAlliance()`)

Groups parties into alliances:
```javascript
{
  name: "NDA (National Democratic Alliance)",
  shortName: "NDA",
  color: "#FF6B6B",
  leading: 186,
  declared: 0,
  trailing: 20,
  totalSeats: 186,
  parties: [...],        // Array of party objects in alliance
  constituencies: [...],  // All constituencies where alliance is leading
  totalMargin: 500000,
  avgMargin: 2688,
  projection: {
    current: 186,
    percentage: "76.5",
    projectedSeats: 186,
    majority: true       // true if > 122 seats
  }
}
```

---

## 🔌 Backend API

### Server Setup (`server/index.js`)

- **Port**: 5000 (configurable via PORT env variable)
- **CORS**: Enabled for all origins
- **Caching**: Results cached for 30 seconds
- **Error Handling**: Graceful fallbacks if scraping fails

### API Endpoints

#### 1. `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T05:20:41.040Z"
}
```

#### 2. `GET /api/results`
Get latest election results with all constituency data.

**Response:**
```json
{
  "timestamp": 1763098836000,
  "states": [
    {
      "name": "AGIAON",
      "constNo": 195,
      "leadingCandidate": "MAHESH PASWAN",
      "leadingParty": "Bharatiya Janata Party",
      "trailingCandidate": "SHIV PRAKASH RANJAN",
      "trailingParty": "Communist Party...",
      "margin": 2037,
      "marginText": "2037",
      "round": "4/24",
      "declared": 0,
      "leading": 1,
      "pending": 0,
      "status": "Leading"
    },
    // ... 242 more constituencies
  ],
  "summary": {
    "totalSeats": 243,
    "declared": 0,
    "leading": 241,
    "pending": 2,
    "totalVotes": 0
  }
}
```

#### 3. `GET /api/party-wise`
Get party-wise aggregated statistics.

**Response:**
```json
{
  "timestamp": 1763098836000,
  "parties": [
    {
      "name": "Bharatiya Janata Party",
      "leading": 81,
      "declared": 0,
      "trailing": 20,
      "totalSeats": 81,
      "constituencies": [...],
      "totalMargin": 150000,
      "avgMargin": 1851
    },
    // ... more parties
  ],
  "totalSeats": 243,
  "summary": {
    "totalParties": 16,
    "partiesLeading": 11,
    "partiesTrailing": 5
  }
}
```

#### 4. `GET /api/alliance-wise`
Get alliance-wise aggregated statistics (NDA, MGB, Others).

**Response:**
```json
{
  "timestamp": 1763098836000,
  "alliances": [
    {
      "name": "NDA (National Democratic Alliance)",
      "shortName": "NDA",
      "color": "#FF6B6B",
      "leading": 186,
      "declared": 0,
      "trailing": 20,
      "totalSeats": 186,
      "parties": [...],
      "constituencies": [...],
      "totalMargin": 500000,
      "avgMargin": 2688,
      "projection": {
        "current": 186,
        "percentage": "76.5",
        "projectedSeats": 186,
        "majority": true
      }
    },
    // ... MGB and Others
  ],
  "totalSeats": 243,
  "summary": {
    "totalAlliances": 3,
    "leadingAlliance": {...},
    "majorityThreshold": 122
  }
}
```

#### 5. `GET /api/constituencies`
Get detailed constituency data (same as `/api/results` but formatted differently).

#### 6. `GET /api/state-wise`
Get state-wise summary (legacy endpoint, same as `/api/results`).

---

## 🎨 Frontend Components

### Component Hierarchy

```
App
├── Header
│   ├── Title & Subtitle
│   ├── Last Update Time
│   └── Refresh Button
├── Dashboard
    ├── SummaryCards (4 cards: Total, Declared, Leading, Pending)
    ├── ResultsChart (Bar & Pie charts)
    ├── StateWiseTable (Constituency table with candidates/parties/margins)
    ├── PartyWise
    │   ├── Party Summary Cards
    │   ├── Party Charts
    │   └── Party Details Table
    └── AllianceAnalysis
        ├── Alliance Summary Cards
        ├── Alliance Charts
        ├── Political Insights
        └── Alliance Details (expandable)
```

### Key Components

#### 1. `App.js`
- Main application component
- Manages state (results, loading, error)
- Fetches data from API
- Auto-refreshes every 30 seconds
- Handles error states

#### 2. `Dashboard.js`
- Container for all dashboard sections
- Renders: SummaryCards, Charts, Table, PartyWise, AllianceAnalysis

#### 3. `SummaryCards.js`
- Displays 4 summary statistics
- Cards: Total Constituencies, Declared, Leading, Pending
- Color-coded with icons

#### 4. `StateWiseTable.js`
- Shows all 243 constituencies
- Columns: Constituency, Leading Candidate, Leading Party, Margin, Status, Round
- Sortable by status
- Color-coded margins (green >10k, orange >5k, red <5k)

#### 5. `ResultsChart.js`
- Bar chart: Top 20 constituencies by status
- Pie chart: Overall progress (Declared/Leading/Pending)
- Uses Recharts library

#### 6. `PartyWise.js`
- Party-wise statistics
- Bar chart: Top parties by seats
- Pie chart: Seat distribution
- Expandable party details
- Shows constituencies per party

#### 7. `AllianceAnalysis.js`
- Alliance-level analysis (NDA, MGB, Others)
- Summary cards with majority indicators
- Charts comparing alliances
- Political insights and projections
- Expandable alliance details

---

## 🕷️ Data Scraping

### Scraper Module (`server/scraper.js`)

#### Key Functions

**`fetchPage(url)`**
- Fetches HTML from ECI website
- Uses browser-like headers to avoid 403 errors
- Returns Cheerio object for parsing
- Timeout: 20 seconds

**`parseConstituencies($)`**
- Finds main results table in HTML
- Extracts constituency data from table rows
- Handles nested tables (party names are in nested structures)
- Returns array of constituency objects

**`findPaginationLinks($)`**
- Finds pagination links on page
- Pattern: `statewiseS041.htm`, `statewiseS042.htm`, etc.
- Returns array of URLs to fetch

**`fetchResults()`**
- Main function that orchestrates scraping
- Fetches pages sequentially
- Stops when 243 constituencies found or page limit reached
- Deduplicates and sorts results
- Returns complete results object

#### HTML Structure Understanding

The ECI website uses:
- Main table with class `table table-striped table-bordered`
- 9 columns per row:
  1. Constituency name
  2. Constituency number
  3. Leading candidate
  4. Leading party (nested table)
  5. Trailing candidate
  6. Trailing party (nested table)
  7. Margin
  8. Round
  9. Status

**Nested Table Structure:**
Party names are in nested `<table>` elements within cells. The scraper:
1. Finds the nested table
2. Extracts text from first `<td>`
3. Removes tooltip text (splits on "iParty")
4. Returns clean party name

#### Pagination Pattern

- First page: `statewiseS041.htm`
- Subsequent pages: `statewiseS042.htm`, `statewiseS043.htm`, etc.
- Some pages may be Hindi versions: `./hi/statewiseS041.htm`
- Scraper tries pages 1-15, stops on 404 errors

#### Error Handling

- **403 Forbidden**: Uses enhanced headers (User-Agent, Referer, etc.)
- **404 Not Found**: Skips page, continues to next
- **Timeout**: Returns null, continues to next page
- **Parse Failures**: Uses fallback data structure

---

## 🏛️ Alliance System

### Alliance Definitions (`server/alliances.js`)

#### NDA (National Democratic Alliance)
- **Color**: #FF6B6B (Red)
- **Parties**:
  - Bharatiya Janata Party (BJP)
  - Janata Dal (United) - JD(U)
  - Lok Janshakti Party (Ram Vilas) - LJP(RV)
  - Hindustani Awam Morcha (Secular) - HAM(S)
  - Rashtriya Lok Janata Dal - RLJD
  - Vikassheel Insaan Party - VIP

#### Mahagathbandhan (Grand Alliance)
- **Color**: #4ECDC4 (Teal)
- **Parties**:
  - Rashtriya Janata Dal - RJD
  - Indian National Congress - INC
  - Communist Party of India (Marxist-Leninist) Liberation - CPI(ML)
  - Communist Party of India - CPI
  - Communist Party of India (Marxist) - CPI(M)
  - All India Majlis-E-Ittehadul Muslimeen - AIMIM

#### Others/Independents
- **Color**: #95A5A6 (Gray)
- All parties not in NDA or Mahagathbandhan

### Alliance Matching Logic

The `getPartyAlliance(partyName)` function:
1. Checks if party name contains any NDA party name (or vice versa)
2. If not, checks Mahagathbandhan parties
3. If not found, returns "OTHERS"

**Note**: Uses partial matching (includes) to handle variations in party names.

### Alliance Aggregation

For each constituency:
1. Determines leading party's alliance
2. Adds to that alliance's totals
3. Determines trailing party's alliance
4. Increments trailing count for that alliance
5. Calculates projections and insights

---

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js**: Version 14+ (LTS recommended)
   - Download from: https://nodejs.org/
   - Verify: `node --version`
   - npm comes with Node.js

2. **Internet Connection**: Required to fetch data from ECI website

### Installation

1. **Clone/Navigate to project directory:**
   ```bash
   cd Election
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

   Or use the convenience script:
   ```bash
   npm run install-all
   ```

### Running the Application

#### Development Mode (Recommended)

Run both server and client simultaneously:
```bash
npm run dev
```

This will:
- Start backend server on `http://localhost:5000`
- Start React app on `http://localhost:3000`
- Auto-reload on code changes

#### Separate Processes

**Backend only:**
```bash
npm run server
# or
node server/index.js
```

**Frontend only:**
```bash
npm run client
# or
cd client && npm start
```

### Production Build

1. **Build React app:**
   ```bash
   npm run build
   ```

2. **Set environment variable:**
   ```bash
   set NODE_ENV=production
   ```

3. **Start server:**
   ```bash
   node server/index.js
   ```

   Server will serve built React app from `client/build/`

---

## 📊 Usage

### Accessing the Application

1. **Open browser**: Navigate to `http://localhost:3000`
2. **Wait for compilation**: First run takes 30-60 seconds
3. **View dashboard**: See real-time election results

### Dashboard Features

1. **Summary Cards**: Quick overview at top
2. **Charts**: Visual representation of data
3. **Constituency Table**: Detailed results with candidates and margins
4. **Party Analysis**: Click party rows to see constituencies
5. **Alliance Analysis**: View NDA vs MGB vs Others
6. **Auto-refresh**: Updates every 30 seconds automatically
7. **Manual Refresh**: Click "Refresh" button in header

### Understanding the Data

- **Declared**: Final results announced
- **Leading**: Counting in progress, candidate ahead
- **Pending**: No results available yet
- **Margin**: Vote difference between leading and trailing candidate
- **Round**: Counting round (e.g., "4/24" means round 4 of 24)

---

## 🔑 Key Features

### 1. Real-time Updates
- Auto-refreshes every 30 seconds
- Manual refresh button
- Shows last update time
- Live indicator animation

### 2. Comprehensive Data
- All 243 constituencies
- Candidate names
- Party affiliations
- Vote margins
- Status tracking

### 3. Multi-level Analysis
- **Constituency-level**: Individual seat details
- **Party-level**: Aggregation by political party
- **Alliance-level**: NDA vs Mahagathbandhan analysis

### 4. Visualizations
- Bar charts for comparisons
- Pie charts for distributions
- Color-coded data
- Interactive tooltips

### 5. Political Insights
- Majority calculations
- Seat projections
- Gap analysis
- Trend indicators

### 6. Responsive Design
- Works on desktop, tablet, mobile
- Adaptive layouts
- Touch-friendly controls

---

## 🔧 Extending the Application

### Adding New Alliances

Edit `server/alliances.js`:

```javascript
const ALLIANCES = {
  // ... existing alliances
  NEW_ALLIANCE: {
    name: 'New Alliance Name',
    shortName: 'NA',
    color: '#HEXCOLOR',
    parties: [
      'Party Name 1',
      'Party Name 2'
    ]
  }
};
```

### Adding New API Endpoint

Edit `server/index.js`:

```javascript
app.get('/api/new-endpoint', async (req, res) => {
  try {
    const results = latestResults.states.length > 0 
      ? latestResults 
      : await electionScraper.fetchResults();
    
    // Process results
    const processedData = processResults(results);
    
    res.json(processedData);
  } catch (error) {
    res.status(500).json({ error: 'Error message' });
  }
});
```

### Adding New Frontend Component

1. Create component file: `client/src/components/NewComponent.js`
2. Create CSS file: `client/src/components/NewComponent.css`
3. Import in `Dashboard.js`:
   ```javascript
   import NewComponent from './components/NewComponent';
   ```
4. Add to Dashboard render:
   ```javascript
   <NewComponent data={results} />
   ```

### Modifying Scraper

Edit `server/scraper.js`:

- **Change URL**: Update `ECI_BASE_URL` constant
- **Change parsing**: Modify `parseConstituencies()` function
- **Change pagination**: Modify `findPaginationLinks()` function
- **Add fields**: Extract additional data in parsing function

### Changing Update Frequency

Edit `client/src/App.js`:

```javascript
// Change from 30000 (30 seconds) to desired milliseconds
const interval = setInterval(fetchResults, 60000); // 60 seconds
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT in `server/index.js` or use environment variable
   - Change React port: Edit `client/package.json` scripts

2. **403 Forbidden errors**
   - ECI website may be blocking requests
   - Check headers in `server/scraper.js` `fetchPage()` function
   - May need to add delays between requests

3. **No data showing**
   - Check browser console for API errors
   - Verify server is running: `http://localhost:5000/api/health`
   - Check server logs for scraping errors

4. **React compilation errors**
   - Clear cache: `cd client && rm -rf node_modules && npm install`
   - Check for syntax errors in component files
   - Verify all imports are correct

5. **Party names not matching**
   - Update party name matching in `server/alliances.js`
   - Check actual party names from ECI website
   - Adjust `getPartyAlliance()` function logic

---

## 📝 Data Structure Reference

### Complete Constituency Object
```javascript
{
  name: String,              // "AGIAON"
  constNo: Number,           // 195
  leadingCandidate: String,  // "MAHESH PASWAN"
  leadingParty: String,      // "Bharatiya Janata Party"
  trailingCandidate: String, // "SHIV PRAKASH RANJAN"
  trailingParty: String,     // "Communist Party..."
  margin: Number,            // 2037
  marginText: String,        // "2037"
  round: String,            // "4/24"
  declared: Number,         // 0 or 1
  leading: Number,          // 0 or 1
  pending: Number,          // 0 or 1
  status: String            // "Declared" | "Leading" | "Pending"
}
```

### Complete Party Object
```javascript
{
  name: String,
  leading: Number,
  declared: Number,
  trailing: Number,
  totalSeats: Number,
  constituencies: Array<ConstituencyObject>,
  totalMargin: Number,
  avgMargin: Number
}
```

### Complete Alliance Object
```javascript
{
  name: String,
  shortName: String,
  color: String,
  leading: Number,
  declared: Number,
  trailing: Number,
  totalSeats: Number,
  parties: Array<PartyObject>,
  constituencies: Array<ConstituencyObject>,
  totalMargin: Number,
  avgMargin: Number,
  projection: {
    current: Number,
    percentage: String,
    projectedSeats: Number,
    majority: Boolean
  }
}
```

---

## 🔐 Environment Variables

Create `.env` file in root directory:

```env
PORT=5000
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5000
```

---

## 📚 Dependencies

### Backend Dependencies
- `express`: ^4.18.2 - Web framework
- `cors`: ^2.8.5 - CORS middleware
- `axios`: ^1.6.0 - HTTP client
- `cheerio`: ^1.0.0-rc.12 - HTML parsing
- `node-cron`: ^3.0.3 - Scheduled tasks (if needed)
- `dotenv`: ^16.3.1 - Environment variables

### Frontend Dependencies
- `react`: ^18.2.0 - UI library
- `react-dom`: ^18.2.0 - React DOM renderer
- `axios`: ^1.6.0 - HTTP client
- `recharts`: ^2.10.3 - Charting library
- `date-fns`: ^2.30.0 - Date utilities

### Dev Dependencies
- `nodemon`: ^3.0.1 - Auto-restart server
- `concurrently`: ^8.2.2 - Run multiple commands

---

## 🎯 Future Enhancements

Potential improvements:
1. **Historical Data**: Store results over time for trend analysis
2. **Notifications**: Alert when major changes occur
3. **Export**: Download data as CSV/PDF
4. **Filters**: Filter by party, alliance, region
5. **Search**: Search constituencies by name
6. **Maps**: Geographic visualization of results
7. **Vote Share**: Calculate and display vote percentages
8. **Trends**: Show changes over time
9. **Predictions**: ML-based seat projections
10. **Multi-state**: Support for other states

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

This is a single-developer project, but suggestions and improvements are welcome!

---

## 📞 Support

For issues or questions:
1. Check this README first
2. Review server logs
3. Check browser console for errors
4. Verify ECI website is accessible

---

## 🔄 Update Log

### Version 1.0.0
- Initial release
- Real-time scraping from ECI website
- Constituency-level details
- Party-wise analysis
- Alliance-level analysis
- Interactive dashboard
- Auto-refresh functionality

---

**Last Updated**: November 2025
**Maintained By**: Election Tracker Team
