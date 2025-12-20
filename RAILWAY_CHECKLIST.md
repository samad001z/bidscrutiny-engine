# 🚀 RAILWAY DEPLOYMENT CHECKLIST

## ✅ BEFORE DEPLOYMENT

### 1. Environment Variables (CRITICAL)
Go to Railway → Your Project → Variables tab and add:

```
FIREBASE_SERVICE_ACCOUNT_BASE64=<paste your base64 string from clipboard>
FIREBASE_STORAGE_BUCKET=bidscrutiny-d9a72.appspot.com
GEMINI_API_KEY=<your gemini api key>
ENV=production
```

**Note:** The base64 Firebase credentials are already in your clipboard from earlier!

### 2. GitHub Repository
✅ Code pushed to: https://github.com/samad001z/bidscrutiny-engine.github.io

### 3. Railway Project Setup
1. Go to https://railway.app/
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose: `samad001z/bidscrutiny-engine.github.io`
5. Railway will auto-detect:
   - Python runtime (runtime.txt)
   - Build configuration (nixpacks.toml)
   - Start command (Procfile)

---

## 📋 CONFIGURATION FILES

### Files Created:
- ✅ `Procfile` - Railway start command
- ✅ `runtime.txt` - Python 3.11.0
- ✅ `railway.toml` - Health checks & restart policy
- ✅ `nixpacks.toml` - System dependencies (tesseract, poppler)
- ✅ `aptfile` - Backup system packages
- ✅ `start.sh` - Startup validation script
- ✅ `.gitignore` - Excludes sensitive files
- ✅ `.env.example` - Environment variable template

### System Packages Installed (via nixpacks.toml):
- `tesseract-ocr` - OCR engine
- `tesseract-ocr-eng` - English language data
- `poppler-utils` - PDF processing
- `libgl1-mesa-glx` - OpenGL support
- `libglib2.0-0` - Image processing libraries

---

## 🔍 HEALTH CHECK

Railway will check: `https://your-app.railway.app/health`

Expected response:
```json
{
  "status": "healthy",
  "firebase": "connected"
}
```

---

## 🐛 TROUBLESHOOTING

### Build Failed?
1. **Check Railway Logs** → Click "web" service → "Build Logs"
2. Common issues:
   - Missing system packages → Already fixed in nixpacks.toml
   - Python version mismatch → Already fixed in runtime.txt
   - Import errors → Check all files imported correctly

### Deployment Failed?
1. **Check Railway Logs** → Click "web" service → "Deploy Logs"
2. Common issues:
   - Missing environment variables → Check Variables tab
   - Firebase connection failed → Verify FIREBASE_SERVICE_ACCOUNT_BASE64 is set correctly
   - Port binding failed → Railway auto-sets $PORT variable

### Service Offline?
1. **Check Runtime Logs** → Click "web" service → "View Logs"
2. Look for:
   - `✓ Firebase initialized successfully` → Good!
   - `⚠️ Firebase initialization failed` → Check environment variables
   - `ModuleNotFoundError` → Missing dependency in requirements.txt

### Firebase Credentials Issue?
If you see "Firebase initialization failed":
1. Verify `FIREBASE_SERVICE_ACCOUNT_BASE64` is set
2. Re-generate base64 string:
   ```powershell
   $bytes = [System.IO.File]::ReadAllBytes("serviceAccount.json")
   [Convert]::ToBase64String($bytes) | Set-Clipboard
   ```
3. Paste into Railway Variables
4. Manually restart deployment

---

## 🎯 POST-DEPLOYMENT TESTING

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

### 2. Test Root Endpoint
```bash
curl https://your-app.railway.app/
```

Expected:
```json
{
  "status": "ok",
  "service": "BidScrutiny AI Backend",
  "version": "1.0.0",
  "firebase": "connected",
  "message": "Service is running"
}
```

### 3. Test Tenders Endpoint
```bash
curl https://your-app.railway.app/tenders
```

### 4. Update Frontend
Once deployed, update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = "https://your-app.railway.app";
```

---

## 📊 MONITORING

### Railway Dashboard
- **Metrics** → View CPU, Memory, Network usage
- **Logs** → Real-time application logs
- **Deployments** → Deployment history
- **Settings** → Domain, environment variables

### Custom Domain (Optional)
1. Go to Railway → Settings → Domains
2. Add custom domain
3. Update DNS records as shown
4. Wait for SSL certificate provisioning

---

## 🔒 SECURITY CHECKLIST

✅ `.env` and `serviceAccount.json` in `.gitignore`
✅ Credentials stored as base64 in Railway environment variables
✅ CORS configured (tighten in production if needed)
✅ Firebase Admin SDK with service account authentication
✅ No hardcoded secrets in code

---

## 📝 DEPLOYMENT LOG

### What Was Fixed:
1. ✅ Added system dependencies for PDF/OCR processing
2. ✅ Updated uvicorn to use `[standard]` for better performance
3. ✅ Added graceful Firebase initialization (no crash on startup)
4. ✅ Added `/health` endpoint for Railway health checks
5. ✅ Made OCR engine path detection automatic (Windows/Linux)
6. ✅ Added startup validation script with environment variable checks
7. ✅ Configured default values for all environment variables
8. ✅ Fixed Procfile to use startup script

### Railway Auto-Detects:
- Python 3.11.0 from `runtime.txt`
- System packages from `nixpacks.toml`
- Start command from `Procfile`
- Health check from `railway.toml`

---

## 🆘 SUPPORT

If deployment fails, share:
1. Railway build logs
2. Railway deploy logs  
3. Runtime logs (from "View Logs")
4. Environment variables (names only, not values)

---

**NEXT STEP:** Go to Railway, set environment variables, and let it deploy! 🚀
