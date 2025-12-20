# 🚀 Railway Deployment Guide - BidScrutiny Engine Backend

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Firebase Project**: Set up Firebase with Firestore and Storage
4. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 📋 Pre-Deployment Checklist

### ✅ Required Files (Already Created)
- [x] `Procfile` - Railway start command
- [x] `requirements.txt` - Python dependencies
- [x] `runtime.txt` - Python version
- [x] `railway.toml` - Railway configuration
- [x] `.gitignore` - Ignore sensitive files
- [x] `.env.example` - Environment variables template

### ⚠️ DO NOT COMMIT
- ❌ `.env` file
- ❌ `serviceAccount.json`
- ❌ `venv/` folder
- ❌ `__pycache__/` folders

---

## 🔧 Railway Deployment Steps

### Step 1: Prepare Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **Convert to Base64** (for Railway environment variable):

**Windows PowerShell:**
```powershell
$bytes = [System.IO.File]::ReadAllBytes("path\to\serviceAccount.json")
[Convert]::ToBase64String($bytes) | clip
```

**Linux/Mac:**
```bash
base64 -w 0 serviceAccount.json | pbcopy
```

5. Save this base64 string - you'll need it for Railway

---

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - BidScrutiny Engine Backend"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/bidscrutiny-engine.git

# Push
git push -u origin main
```

---

### Step 3: Deploy on Railway

#### Option A: Deploy from GitHub (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `bidscrutiny-engine` repository
5. Railway will auto-detect Python and start building

#### Option B: Deploy with Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

### Step 4: Configure Environment Variables

In Railway Dashboard → Your Project → Variables:

```env
# Gemini AI API Key
GEMINI_API_KEY=AIzaSy...your_actual_key

# Firebase Storage Bucket
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Service Account (Base64 encoded)
FIREBASE_SERVICE_ACCOUNT_BASE64=ewogICJ0eXBlI...your_base64_string

# Environment
ENV=production
```

---

### Step 5: Update Backend Code for Railway

Update `app/core/firebase_init.py` to handle base64 credentials:

```python
import os
import json
import base64
from firebase_admin import credentials, initialize_app, firestore, storage

def init_firebase():
    # Check if running on Railway (base64 encoded credentials)
    firebase_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64")
    
    if firebase_base64:
        # Decode base64 credentials
        cred_json = base64.b64decode(firebase_base64).decode('utf-8')
        cred_dict = json.loads(cred_json)
        cred = credentials.Certificate(cred_dict)
    else:
        # Use local file for development
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccount.json")
        cred = credentials.Certificate(cred_path)
    
    # Initialize Firebase
    initialize_app(cred, {
        'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
    })
    
    db = firestore.client()
    bucket = storage.bucket()
    
    return db, bucket
```

---

## 🔍 Verify Deployment

### Check Health Endpoint
```bash
curl https://your-app.railway.app/
```

Expected response:
```json
{
  "status": "BidScrutiny AI Backend Running 🚀",
  "mode": "DEV (Auth Disabled)"
}
```

### Test API Endpoints
```bash
# Get tenders
curl https://your-app.railway.app/tenders

# Compare all vendors
curl https://your-app.railway.app/compare-all
```

---

## 📊 Railway Dashboard Features

### View Logs
Railway Dashboard → Your Project → Deployments → View Logs

### Monitor Metrics
- CPU Usage
- Memory Usage
- Network Traffic
- Request Count

### Custom Domain (Optional)
Settings → Domains → Add Custom Domain

---

## 🐛 Troubleshooting

### Build Fails
- Check `requirements.txt` for incompatible versions
- Verify Python version in `runtime.txt`
- Check Railway build logs

### App Crashes on Start
- Verify environment variables are set correctly
- Check if Firebase credentials are properly base64 encoded
- Review Railway deployment logs

### 500 Internal Server Error
- Check if Firebase credentials are valid
- Verify Gemini API key is active
- Check Railway logs for Python errors

### Timeout Issues
- Increase healthcheck timeout in `railway.toml`
- Optimize slow endpoints
- Consider using background workers

---

## 💡 Production Best Practices

### Security
- ✅ Never commit `.env` or `serviceAccount.json`
- ✅ Use environment variables for all secrets
- ✅ Enable CORS restrictions in production
- ✅ Add rate limiting to API endpoints

### Performance
- ✅ Use connection pooling for Firebase
- ✅ Implement caching for frequent queries
- ✅ Optimize PDF processing
- ✅ Use async operations where possible

### Monitoring
- ✅ Set up Railway alerts for errors
- ✅ Monitor API response times
- ✅ Track Firebase usage quotas
- ✅ Log important events

---

## 🔗 Useful Links

- [Railway Docs](https://docs.railway.app/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Gemini API](https://ai.google.dev/docs)

---

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables
3. Test locally first with production settings
4. Review Firebase and Gemini API quotas

---

**Ready to deploy! 🚀**
