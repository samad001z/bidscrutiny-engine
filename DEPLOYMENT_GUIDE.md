# 🚀 Production Deployment Guide

## Overview
- **Backend**: Python FastAPI → Railway.app
- **Frontend**: React Vite → Vercel
- **Database**: Firebase Firestore
- **Storage**: Firebase Cloud Storage

---

## 📋 Pre-Deployment Checklist

### Backend (Railway)
- [ ] Python 3.11+ installed locally
- [ ] All dependencies in `requirements.txt`
- [ ] `.env` file with all required variables
- [ ] Firebase service account JSON
- [ ] Gemini API key
- [ ] Git repository initialized and pushed to GitHub/GitLab

### Frontend (Vercel)
- [ ] Node.js 18+ installed
- [ ] All dependencies in `package.json`
- [ ] `npm run build` works without errors
- [ ] `.env.production` file with `VITE_API_URL`
- [ ] Git repository pushed to GitHub

---

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Firebase Service Account
```bash
# Get your Firebase service account JSON from:
# Firebase Console > Project Settings > Service Accounts > Generate New Private Key

# Convert JSON to Base64 (Windows PowerShell):
$content = Get-Content "C:\path\to\serviceAccount.json" -Raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content)) | Set-Clipboard

# Or use this Python one-liner:
python -c "import base64; print(base64.b64encode(open('serviceAccount.json', 'rb').read()).decode())"
```

### Step 2: Create Railway Account & Project
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project
4. Select "Deploy from GitHub"
5. Authorize and select your repository

### Step 3: Set Environment Variables in Railway
1. Go to your Railway project
2. Click "Variables" tab
3. Add the following variables:

```
FIREBASE_SERVICE_ACCOUNT_BASE64 = [YOUR_BASE64_ENCODED_JSON]
FIREBASE_STORAGE_BUCKET = your-bucket.appspot.com
GEMINI_API_KEY = your_gemini_api_key
FRONTEND_URL = https://your-frontend.vercel.app
ENVIRONMENT = production
LOG_LEVEL = info
```

### Step 4: Configure Railway Build Settings
1. Click "Settings" tab
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `bash start.sh`
4. Root Directory: `.` (current directory)

### Step 5: Deploy
1. Click "Deploy" button
2. Wait for build to complete
3. Copy the Railway URL (e.g., `https://your-app.railway.app`)

### Step 6: Verify Deployment
```bash
# Test the API
curl https://your-backend.railway.app/health

# Should return:
# {"status": "ok", "environment": "production"}
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Repository
Ensure your frontend code is pushed to GitHub:
```bash
cd frontend
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Grant Vercel access to your repository

### Step 3: Deploy Project
1. Click "New Project"
2. Select your repository
3. Framework Preset: **Vite**
4. Root Directory: `frontend`
5. Click "Deploy"

### Step 4: Set Environment Variables
1. Go to Project Settings > Environment Variables
2. Add the following:

```
VITE_API_URL = https://your-backend.railway.app
```

3. Click "Save"

### Step 5: Rebuild & Deploy
1. Go to Deployments
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete

### Step 6: Verify Deployment
1. Click on the deployed URL
2. Should load without CORS errors
3. Check browser console for API connection logs

---

## 🔗 Connect Backend & Frontend

### Step 1: Update Frontend with Backend URL
In Vercel Dashboard:
1. Project Settings > Environment Variables
2. Set `VITE_API_URL` to your Railway URL
3. Redeploy the project

### Step 2: Update Backend with Frontend URL
In Railway Dashboard:
1. Variables tab
2. Set `FRONTEND_URL` to your Vercel URL
3. Redeploy

### Step 3: Test Connection
1. Open your Vercel frontend
2. Open browser DevTools > Console
3. Should see:
   ```
   [API Config] Environment: PRODUCTION
   [API Config] Base URL: https://your-backend.railway.app
   ```

---

## 🧪 Testing Production

### Backend Tests
```bash
# Health check
curl https://your-backend.railway.app/health

# Example: Get tenders
curl https://your-backend.railway.app/tenders \
  -H "Content-Type: application/json"
```

### Frontend Tests
1. Open https://your-frontend.vercel.app
2. Try uploading a tender
3. Monitor console for errors
4. Check Network tab for API calls

---

## 🔐 Security Checklist

- [ ] Firebase credentials are NOT in git (use environment variables)
- [ ] Gemini API key is NOT in frontend code
- [ ] CORS is restricted to production domain
- [ ] No hardcoded localhost URLs in production build
- [ ] Environment variables are set in both services
- [ ] Secrets are NOT logged to console
- [ ] HTTPS is enforced (Vercel & Railway both use HTTPS)

---

## 📝 Environment Variables Reference

### Backend (.env for Railway)

```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_json
FIREBASE_STORAGE_BUCKET=project.appspot.com

# Gemini
GEMINI_API_KEY=your_gemini_key

# Application
FRONTEND_URL=https://your-frontend.vercel.app
ENVIRONMENT=production
LOG_LEVEL=info
PORT=8000
```

### Frontend (.env.production for Vercel)

```env
VITE_API_URL=https://your-backend.railway.app
```

---

## 🚨 Troubleshooting

### CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check `FRONTEND_URL` is set in Railway variables
2. Ensure Vercel URL matches exactly (including protocol)
3. Redeploy both services
4. Clear browser cache and hard refresh

### API Connection Failing
**Problem**: `Cannot reach API endpoint`

**Solution**:
1. Verify Railway URL is correct
2. Set `VITE_API_URL` in Vercel environment variables
3. Rebuild frontend on Vercel
4. Check Railway logs for errors

### Firebase Connection Issues
**Problem**: `Firebase initialization failed`

**Solution**:
1. Verify `FIREBASE_SERVICE_ACCOUNT_BASE64` is valid base64
2. Check `FIREBASE_STORAGE_BUCKET` matches your project
3. Ensure Firebase service account has correct permissions
4. Check Railway logs

### Timeout on Large Files
**Problem**: `Request timeout uploading PDF`

**Solution**:
- API timeout is set to 300 seconds (5 minutes)
- Railway/Vercel default timeout is 60 seconds
- Large PDFs might need Railway Pro plan for longer timeouts
- Consider optimizing PDF size

---

## 📊 Monitoring

### Check Service Health
```bash
# Backend
curl https://your-backend.railway.app/health

# Monitor logs in Railway Dashboard
# Dashboard > Logs tab
```

### View Errors
- **Railway**: Dashboard > Logs > filter by severity
- **Vercel**: Project > Deployments > click deployment > View Logs

---

## 🔄 Updates & Redeployment

### Deploy New Backend Version
```bash
# Push changes to GitHub
git add .
git commit -m "Update: description"
git push origin main

# Railway auto-deploys on push to main
# Monitor in Railway Dashboard
```

### Deploy New Frontend Version
```bash
# Build locally to test
npm run build

# Push to GitHub
git add .
git commit -m "Update: description"
git push origin main

# Vercel auto-deploys on push to main
# Monitor in Vercel Dashboard
```

---

## 📞 Support

### Common Issues
- Check Railway logs: Project > Logs
- Check Vercel logs: Deployments > View Logs
- Check Firebase console for permissions
- Check Gemini API quota

### Documentation
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)

---

**Deployment Status**: ✅ Ready for Production
