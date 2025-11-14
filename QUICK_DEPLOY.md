# 🚀 Quick Deployment Guide - Railway

## Prerequisites
- GitHub account
- Railway account (free at https://railway.app)

## Steps (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/election-tracker.git
git push -u origin main
```

### 2. Deploy on Railway
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway → Select your repo
5. **That's it!** Railway will:
   - Auto-detect Node.js
   - Install dependencies
   - Build React app
   - Deploy everything

### 3. Get Your Link
- Railway gives you a URL like: `https://your-app.up.railway.app`
- Share this link! 🎉

## What Happens Automatically
✅ Installs all dependencies  
✅ Builds React app  
✅ Starts server  
✅ Serves API + Frontend  
✅ HTTPS enabled  
✅ Auto-deploys on git push  

## Custom Domain (Optional)
1. Project → Settings → Domains
2. Add your domain or use Railway's free domain

## Cost
- **Free tier**: $5 credit/month, 500 hours
- Perfect for this app!

## Troubleshooting
- **Build fails?** Check logs in Railway dashboard
- **App not loading?** Check server logs
- **API errors?** App uses relative URLs - should work automatically

---

**Need help?** Check `DEPLOYMENT.md` for detailed guide.

