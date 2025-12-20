# Install Railway CLI
Write-Host "Installing Railway CLI..." -ForegroundColor Cyan
npm i -g @railway/cli

# Login to Railway
Write-Host "`nLogging in to Railway..." -ForegroundColor Cyan
railway login

# Link to project (or create new)
Write-Host "`nInitializing Railway project..." -ForegroundColor Cyan
railway init

# Set environment variables
Write-Host "`nSetting environment variables..." -ForegroundColor Cyan

# Get the base64 string from clipboard
$base64String = Get-Clipboard

railway variables set FIREBASE_SERVICE_ACCOUNT_BASE64="$base64String"
railway variables set FIREBASE_STORAGE_BUCKET="bidscrutiny-d9a72.appspot.com"
railway variables set ENV="production"

Write-Host "`n✓ Environment variables set!" -ForegroundColor Green
Write-Host "`nNow set your GEMINI_API_KEY:" -ForegroundColor Yellow
Write-Host "railway variables set GEMINI_API_KEY='your-key-here'" -ForegroundColor White

# Deploy
Write-Host "`nReady to deploy! Run:" -ForegroundColor Cyan
Write-Host "railway up" -ForegroundColor White
