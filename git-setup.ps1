# Git Setup and Push to GitHub
# Run this script after creating your GitHub repository

Write-Host "🚀 BidScrutiny Engine - GitHub Setup" -ForegroundColor Cyan
Write-Host ""

# Configure Git (replace with your details)
Write-Host "Step 1: Configuring Git..." -ForegroundColor Yellow
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow
git init

# Add all files (respecting .gitignore)
Write-Host "Step 3: Adding files..." -ForegroundColor Yellow
git add .

# Show what will be committed
Write-Host "Step 4: Files to be committed:" -ForegroundColor Yellow
git status

# Commit
Write-Host "Step 5: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: BidScrutiny Engine backend and frontend"

# Set main branch
Write-Host "Step 6: Setting main branch..." -ForegroundColor Yellow
git branch -M main

# Instructions for remote
Write-Host ""
Write-Host "✅ Repository ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub (https://github.com/new)" -ForegroundColor White
Write-Host "2. Run this command with YOUR repository URL:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git" -ForegroundColor Yellow
Write-Host "3. Push to GitHub:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
