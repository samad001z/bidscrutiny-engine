# 🚀 Local Development Setup - FastAPI + React + Firebase

## Prerequisites
- Python 3.11+ installed
- Node.js 16+ installed
- `.env` file with Firebase credentials (already configured ✅)

---

## Start Backend (Terminal 1)

```bash
cd c:\bidscrutiny-engine

# Activate virtual environment
venv\Scripts\activate

# Start FastAPI server
python -m uvicorn app.main:app --reload
```

**Expected output:**
```
✓ Firebase initialized successfully
⚠️ FIREBASE_STORAGE_BUCKET configured: bidscrutiny-4b0ea.appspot.com
🚀 BidScrutiny Backend Starting Up
Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend ready at**: `http://localhost:8000`

---

## Start Frontend (Terminal 2)

```bash
cd c:\bidscrutiny-engine\frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

✅ **Frontend ready at**: `http://localhost:5173`

---

## Test Firebase Connection

### Test 1: Health Check
```bash
# In a new terminal, test the health endpoint
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"ok"}
```

### Test 2: Upload Tender
1. Open `http://localhost:5173` in browser
2. Click **"Upload Tender"**
3. Fill in the form with:
   - **Name**: `Test RFQ 2024`
   - **Description**: `Infrastructure project`
   - **File**: Upload a PDF (can be any PDF)

4. **Check backend terminal** for logs:
   ```
   [TENDER UPLOAD] Started
   ✓ Firebase initialized successfully
   ✓ Tender JSON saved to Firestore
   ✓ PDF uploaded to Storage
   ```

5. **Check Firebase Console**:
   - Go to: https://console.firebase.google.com
   - Select `bidscrutiny-4b0ea`
   - Click **Firestore Database**
   - Look for `tenders` collection with your uploaded data

### Test 3: Verify Data in Firestore

Open Firebase Console → Firestore Database:
```
tenders/
├── {random-id}
│   ├── title: "Test RFQ 2024"
│   ├── department: "..."
│   ├── summary: "..."
│   ├── uploaded_at: timestamp
│   └── pdf_url: "gs://bucket/tenders/..."
```

### Test 4: Upload Vendor Bid
1. Go to **"Submit Bid"** page
2. Select the tender you just created
3. Upload a vendor bid PDF
4. Check logs for:
   ```
   [VENDOR UPLOAD] Started
   ✓ Vendor JSON saved to Firestore
   ✓ PDF uploaded to Storage
   ```

5. Check Firebase for vendor data under:
   ```
   tenders/{tender_id}/vendors/{vendor_id}
   ```

---

## Common Issues & Fixes

### ❌ "Failed to initialize Firestore"
**Problem**: Firebase credentials invalid
**Fix**: 
- Check `.env` file has `FIREBASE_SERVICE_ACCOUNT_BASE64`
- Verify the Base64 string is not truncated
- Recreate from `.env.example`

### ❌ "FIREBASE_STORAGE_BUCKET not set"
**Problem**: Missing environment variable
**Fix**:
```bash
# In your .env, add:
FIREBASE_STORAGE_BUCKET=bidscrutiny-4b0ea.appspot.com
```

### ❌ Frontend can't connect to backend
**Problem**: CORS or network issue
**Fix**:
- Make sure backend is running on `8000`
- Check browser console for errors
- Verify API URL: http://localhost:8000
- Check CORS middleware in `app/main.py`

### ❌ PDF upload fails
**Problem**: Firebase Storage not configured
**Fix**:
- Check Firestore logs in backend
- Verify Firebase project has Cloud Storage enabled
- Check bucket exists in Firebase Console

---

## Full Workflow Test

### Step 1: Upload Tender
```
User → Upload PDF → Backend OCR → Gemini Extract → Firestore Save
                  ↓
            Cloud Storage Upload (PDF)
```

### Step 2: List Tenders
```
Frontend → GET /list-tenders → Firebase Query → Return JSON
```

### Step 3: Submit Vendor Bid
```
User → Upload PDF → Backend OCR → Gemini Extract → Duplicate Check
                  ↓
            Cloud Storage Upload (PDF) → Firestore Save
```

### Step 4: Evaluate Vendors
```
Frontend → GET /list-vendors/{id} → Firebase Query → Return Bids
```

---

## Monitor Logs

**Backend Logs** show:
- ✅ Firebase initialization
- ✅ PDF extraction
- ✅ Gemini API calls
- ✅ Firestore writes
- ✅ Storage uploads
- ❌ Errors with full stack trace

**Frontend Logs** show:
- [API Request] POST /upload-tender
- [API Response] 200 OK
- [API Error] Any failures with retry attempts

Check browser **DevTools** → **Console** tab for frontend errors.

---

## API Endpoints Available

```
POST   /upload-tender              - Upload tender PDF
POST   /upload-vendor              - Upload vendor bid PDF
GET    /get-tender/{tender_id}     - Get tender details
GET    /list-tenders               - List all tenders
GET    /search-tenders             - Search tenders
GET    /list-vendors/{tender_id}   - List vendor bids
GET    /evaluate-vendors/{id}      - AI evaluation of vendors
POST   /compare-vendors            - Compare specific vendors
GET    /health                     - Health check
```

All endpoints return JSON and have 5-minute timeout for AI processing.

---

## Database Structure

### Firestore Collections
```
firestore-root
└── tenders/ [collection]
    ├── {tender_id}
    │   ├── title, department, summary
    │   ├── scope_of_work, technical_requirements
    │   ├── eligibility_criteria, required_certificates
    │   ├── financial_criteria, bid_deadlines
    │   ├── pdf_url, uploaded_at
    │   └── vendors/ [subcollection]
    │       └── {vendor_id}
    │           ├── vendor_name, company_name
    │           ├── gst_number, pan_number, address
    │           ├── contact, financial_info, certificates
    │           ├── pdf_url, document_hash, fraud_report
    │           └── uploaded_at
```

### Cloud Storage
```
gs://bidscrutiny-4b0ea.appspot.com/
├── tenders/
│   ├── {tender_id}.pdf
│   └── {tender_id}/vendors/
│       └── {vendor_id}.pdf
```

---

## Performance Tips

1. **First upload is slow** (30-60 seconds) due to Gemini AI processing
2. **Subsequent loads are fast** (1-2 seconds) as data cached in Firestore
3. **PDF extraction** happens once, results stored permanently
4. **Keep browser DevTools open** to see API logs

---

## Success Criteria ✅

- [ ] Backend starts without errors
- [ ] Firebase initialization succeeds
- [ ] Frontend connects to localhost:8000
- [ ] Tender upload completes
- [ ] Data appears in Firestore Console
- [ ] PDF uploads to Cloud Storage
- [ ] Vendor bid submission works
- [ ] Vendor data in Firestore
- [ ] No CORS errors in console
- [ ] All API calls return 200 status

---

**Status**: Your app is ready for local testing!

Start the backend and frontend, then test the workflow above.
