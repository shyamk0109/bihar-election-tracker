# Deployment Guide - Railway

This guide will help you deploy the Bihar Election Tracker to Railway.

## Prerequisites

1. A GitHub account
2. A Railway account (sign up at https://railway.app - free tier available)
3. Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit - Election Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Deploy to Railway

1. **Go to Railway**: Visit https://railway.app and sign in (or create an account)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub account
   - Select your repository

3. **Configure Deployment**:
   - Railway will auto-detect it's a Node.js project
   - It will automatically:
     - Install dependencies (root + client)
     - Build the React app
     - Start the server

4. **Set Environment Variables** (if needed):
   - Go to your project → Variables
   - Add `NODE_ENV=production` (usually set automatically)
   - The app will use Railway's PORT automatically

5. **Deploy**:
   - Railway will start building automatically
   - Watch the build logs
   - Once complete, you'll get a URL like: `https://your-app-name.up.railway.app`

### 3. Custom Domain (Optional)

1. Go to your project → Settings → Domains
2. Click "Generate Domain" or add your custom domain
3. Railway provides free HTTPS automatically

## How It Works

- **Build Process**: 
  - Installs root dependencies (`npm install`)
  - Installs client dependencies (`cd client && npm install`)
  - Builds React app (`cd client && npm run build`)

- **Runtime**:
  - Starts Node.js server (`node server/index.js`)
  - Server serves:
    - API endpoints at `/api/*`
    - React app at all other routes
  - Uses Railway's PORT environment variable

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Railway uses Node 18 by default)

### App Doesn't Load
- Check server logs in Railway dashboard
- Verify the build completed successfully
- Ensure `NODE_ENV=production` is set

### API Calls Fail
- The app uses relative URLs in production
- All API calls go to the same domain
- Check browser console for errors

### 403 Errors from ECI Website
- The scraper may face rate limiting
- Railway IPs might be blocked
- Consider adding delays or using a proxy (advanced)

## Environment Variables

The app works with these defaults:
- `PORT`: Set automatically by Railway
- `NODE_ENV`: Set to `production` automatically
- `REACT_APP_API_URL`: Not needed in production (uses relative URLs)

## Monitoring

- View logs in Railway dashboard
- Check metrics (CPU, Memory, Network)
- Set up alerts if needed

## Cost

- Railway offers a free tier with:
  - $5 free credit monthly
  - 500 hours of usage
  - Perfect for this app!

## Alternative: Deploy to Vercel (Frontend) + Railway (Backend)

If you prefer to separate frontend and backend:

1. **Backend (Railway)**:
   - Deploy only the `server/` folder
   - Update CORS to allow your frontend domain

2. **Frontend (Vercel)**:
   - Connect your GitHub repo
   - Set root directory to `client/`
   - Add environment variable: `REACT_APP_API_URL=https://your-railway-app.up.railway.app`

This guide uses the simpler single-deployment approach (recommended).

