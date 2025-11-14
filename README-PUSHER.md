# Local Data Pusher Service

This service runs on your local machine and fetches election data from the ECI website, then pushes it to your Railway deployment every 5 minutes.

## Setup

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Set Railway API URL** (optional, defaults to the deployed URL):
   ```bash
   # Windows PowerShell
   $env:RAILWAY_API_URL="https://web-production-8807.up.railway.app/api/push-data"
   
   # Windows CMD
   set RAILWAY_API_URL=https://web-production-8807.up.railway.app/api/push-data
   
   # Linux/Mac
   export RAILWAY_API_URL=https://web-production-8807.up.railway.app/api/push-data
   ```

3. **Run the pusher service**:
   ```bash
   npm run pusher
   ```

   Or directly:
   ```bash
   node local-data-pusher.js
   ```

## How It Works

1. The service fetches data from `https://results.eci.gov.in/ResultAcGenNov2025/statewiseS041.htm` and all paginated pages
2. Parses all 243 constituencies
3. Pushes the data to Railway via POST request to `/api/push-data`
4. Repeats every 5 minutes automatically

## Running in Background

### Windows (PowerShell)
```powershell
Start-Process node -ArgumentList "local-data-pusher.js" -WindowStyle Hidden
```

### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., "At startup" or "Daily")
4. Action: Start a program
5. Program: `node`
6. Arguments: `local-data-pusher.js`
7. Start in: `C:\Users\Shyam\Desktop\2026\Election`

### Linux/Mac (PM2 - Recommended)
```bash
npm install -g pm2
pm2 start local-data-pusher.js --name election-pusher
pm2 save
pm2 startup  # To start on system boot
```

## Monitoring

The service will log:
- When it starts fetching
- Progress of fetching each page
- Number of constituencies found
- Success/failure of pushing to Railway
- Next update time

## Stopping the Service

Press `Ctrl+C` in the terminal, or if running in background, kill the process.

