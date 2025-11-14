@echo off
echo ========================================
echo   Railway Deployment Setup
echo ========================================
echo.
echo Step 1: Create GitHub Repository
echo   1. Go to: https://github.com/new
echo   2. Name: bihar-election-tracker
echo   3. Make it Public
echo   4. DO NOT initialize with README
echo   5. Click Create repository
echo.
echo Press any key after you've created the repository...
pause
echo.
echo Step 2: Setting up Git remote...
git remote add origin https://github.com/shyamk0109/bihar-election-tracker.git
if %errorlevel% neq 0 (
    echo Remote might already exist, trying to update...
    git remote set-url origin https://github.com/shyamk0109/bihar-election-tracker.git
)
echo.
echo Step 3: Renaming branch to main...
git branch -M main
echo.
echo Step 4: Pushing to GitHub...
git push -u origin main
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. Go to: https://railway.app
echo 2. Login with GitHub
echo 3. Click "New Project"
echo 4. Select "Deploy from GitHub repo"
echo 5. Choose "bihar-election-tracker"
echo 6. Wait for deployment (2-3 minutes)
echo 7. Get your URL from Settings ^> Generate Domain
echo.
echo Done! Your app will be live shortly.
pause

