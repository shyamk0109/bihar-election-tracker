# Setup Instructions

## Prerequisites

You need to install Node.js and npm first:

### Install Node.js

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the LTS (Long Term Support) version for Windows
   - Choose the Windows Installer (.msi) for your system (64-bit recommended)

2. **Install Node.js:**
   - Run the downloaded installer
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option
   - Complete the installation

3. **Verify Installation:**
   Open PowerShell or Command Prompt and run:
   ```bash
   node --version
   npm --version
   ```
   Both commands should show version numbers.

## Installation Steps

Once Node.js is installed:

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   This installs dependencies for both the server and client.

2. **Start the application:**
   ```bash
   npm run dev
   ```
   This starts both the backend server and frontend React app.

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Alternative: Install Dependencies Separately

If `npm run install-all` doesn't work:

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

Then start the app:
```bash
npm run dev
```

## Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:
- Change the port in `client/package.json` (for React)
- Change PORT in `server/index.js` (for Express)

### CORS Issues
The app is configured to handle CORS. If you see CORS errors, check that the proxy in `client/package.json` points to the correct backend URL.

### Scraping Issues
If the ECI website structure changes, the scraper will use fallback data. Check the browser console and server logs for details.

## Development Commands

- `npm run dev` - Start both server and client
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend (requires server to be running separately)
- `npm run build` - Build the React app for production

