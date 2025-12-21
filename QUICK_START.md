# 🚀 Quick Start Guide - BidScrutiny Engine

## Local Development (30 seconds)

### Terminal 1: Backend
```bash
cd c:\bidscrutiny-engine
python -m venv venv
venv\Scripts\activate  # On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
✅ Wait for: `Uvicorn running on http://127.0.0.1:8000`

### Terminal 2: Frontend
```bash
cd c:\bidscrutiny-engine\frontend
npm install
npm run dev
```
✅ Wait for: `Local: http://localhost:5173/`

### Browser
- Open: http://localhost:5173
- Login as **Government Evaluator** or **Vendor**
- Start uploading tenders and submitting bids!

---

## ☁️ Production Deployment (Railway)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Railway setup guide.

Quick steps:
1. Push to GitHub
2. Connect to Railway
3. Add environment variables
4. Railway deploys automatically

---

## ✅ Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Tender Upload & Extraction | ✅ WORKING | Gemini extracts structured data |
| Vendor Bid Submission | ✅ WORKING | Full bid document processing |
| Firebase Storage | ✅ WORKING | PDFs stored in Cloud Storage |
| Firestore Database | ✅ WORKING | All data persisted to Firestore |
| AI Evaluation | ✅ WORKING | Vendor matching against requirements |
| Health Check | ✅ WORKING | Railway uses `/health` endpoint |

---

## 🧪 Quick Tests

### Test 1: Upload Tender (30-60 seconds)
1. Login as **Government Evaluator**
2. Click **Upload Tender**
3. Fill form + upload PDF
4. Check terminal for: `[TENDER UPLOAD] SUCCESS ✓`
5. Should redirect to Dashboard

### Test 2: Submit Vendor Bid (30-60 seconds)
1. Login as **Vendor**
2. Click **Submit Bid**
3. Select tender + upload PDF
4. Check terminal for: `[VENDOR UPLOAD] SUCCESS ✓`
5. Dashboard should show your bid with scores

### Test 3: Check Data
```bash
curl http://localhost:8000/debug/firebase
# Shows: tender count, vendor count, all tenders
```

---

## 📊 Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Service status |
| `GET /health` | Health check (Railway) |
| `GET /debug/firebase` | Test Firebase + list data |
| `POST /upload-tender` | Upload tender PDF |
| `POST /upload-vendor` | Submit vendor bid |
| `GET /compare-all` | All vendors (dashboard) |
| `GET /tenders` | Available tenders (vendor) |

---

## 🎯 Important Files

- **Backend Config**: `app/main.py` (enhanced with logging)
- **Frontend Config**: `frontend/src/services/api.js` (auto-detect env)
- **Dev Environment**: `frontend/.env.local` (localhost:8000)
- **Documentation**: `FIXES_SUMMARY.md` & `IMPLEMENTATION_COMPLETE.md`

---

## ⚡ Performance

- Tender upload: 30-60 seconds (OCR + AI)
- Vendor bid: 30-60 seconds (Full evaluation)
- Dashboard load: <2 seconds (Firestore query)
- Error recovery: 3 retries with exponential backoff

---

## 🐛 If Something Goes Wrong

### Check Backend
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy",...}
```

### Check Firebase
```bash
curl http://localhost:8000/debug/firebase
# Should show tenders and vendors
```

### Check Environment
```bash
# Frontend should show:
# [API Config] Environment: DEVELOPMENT
# [API Config] Base URL: http://localhost:8000
```

### Check Logs
- **Backend**: Terminal 1 shows detailed operation logs
- **Frontend**: Browser DevTools → Console tab
- **Firebase**: Check Firestore in Firebase Console

---

## 📚 Full Documentation

- See `FIXES_SUMMARY.md` for detailed error fixes
- See `IMPLEMENTATION_COMPLETE.md` for complete checklist
- See `README.md` in frontend folder for React setup

---

## 🎉 That's It!

Everything is configured and working. Just start the servers and begin using the system!

**Questions?** Check the error message in the console - they're now detailed and actionable.

Happy bidding! 🚀
