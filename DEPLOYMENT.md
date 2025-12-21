# BidScrutiny Engine - Railway Deployment Guide

This application is configured for deployment on **Railway.app**.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Firebase project with credentials

## Environment Variables Required

Add these to Railway **Variables**:

```
FIREBASE_SERVICE_ACCOUNT_BASE64=<your base64 encoded Firebase service account JSON>
FIREBASE_STORAGE_BUCKET=bidscrutiny-4b0ea.appspot.com
GEMINI_API_KEY=<your Gemini API key>
ENV=production
```

### Getting FIREBASE_SERVICE_ACCOUNT_BASE64

1. Download your Firebase service account JSON from Firebase Console
2. Encode it to base64:
   ```bash
   # On Linux/Mac
   cat serviceAccount.json | base64
   
   # On Windows PowerShell
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("serviceAccount.json"))
   ```
3. Paste the entire output into the Railway variable

## Deployment Steps

1. **Push to GitHub**: Commit all changes
   ```bash
   git add .
   git commit -m "deployment ready"
   git push
   ```

2. **In Railway Dashboard**:
   - Connect your GitHub repository
   - Railway will automatically detect `railway.toml`
   - Add all environment variables (see above)
   - Deploy will start automatically

3. **Verify Deployment**:
   - Check the deployment logs for startup messages
   - Verify healthcheck passes: `GET /health`
   - Test a tender upload endpoint

## Application Structure

```
app/
├── main.py                 # FastAPI app with all endpoints
├── core/
│   ├── firebase_init.py   # Firebase initialization
│   ├── config.py          # Configuration management
│   └── logging.py         # Logging setup
├── pipelines/
│   ├── tender_pipeline.py # Tender extraction & storage
│   └── vendor_pipeline.py # Vendor extraction & storage
├── intelligence/
│   ├── model_loader.py    # Gemini model
│   ├── tender_extractor.py
│   └── vendor_extractor.py
├── ocr/
│   └── ocr_engine.py      # PDF text extraction
├── crypto/
│   ├── hash_utils.py
│   ├── signature_utils.py
│   └── signature_agent.py
└── storage/
    └── vendor_storage.py  # Vendor data storage
```

## Key Features

### Tender Management
- **POST /upload-tender** - Upload and extract tender documents
- **GET /get-tender/{tender_id}** - Retrieve tender details
- **GET /list-tenders** - List all tenders
- **GET /search-tenders** - Search tenders by keyword

### Vendor Management
- **POST /upload-vendor** - Upload vendor bid documents
- **GET /list-vendors/{tender_id}** - List vendors for a tender
- **GET /evaluate-vendors/{tender_id}** - AI evaluation of vendors

### Comparison
- **POST /compare-vendors** - Compare vendors against tender requirements

### Health Check
- **GET /health** - Service health endpoint (used by Railway)

## Firebase Integration

### Data Structure

**Tenders Collection**:
```
/tenders/{tender_id}
├── title: string
├── department: string
├── summary: string
├── scope_of_work: array
├── technical_requirements: array
├── eligibility_criteria: array
├── required_certificates: array
├── financial_criteria: array
├── bid_deadlines: array
├── pdf_url: string (Cloud Storage URL)
├── uploaded_at: timestamp
└── vendors: subcollection
    └── {vendor_id}
        ├── vendor_name: string
        ├── company_name: string
        ├── vendor_json: object
        ├── document_hash: string
        ├── pdf_url: string
        ├── uploaded_at: timestamp
        └── fraud_report: object
```

## Troubleshooting

### Health Check Failing
- Check that `FIREBASE_SERVICE_ACCOUNT_BASE64` is properly set
- Check that `FIREBASE_STORAGE_BUCKET` is set
- View Railway logs for Firebase initialization errors

### PDF Upload Failing
- Verify `FIREBASE_STORAGE_BUCKET` exists in Firebase
- Check Cloud Storage permissions in Firebase Console
- Ensure the storage bucket name is correct

### Tender/Vendor Storage Failing
- Verify Firestore is enabled in Firebase
- Check Firestore permissions and security rules
- Ensure the Firebase service account has appropriate permissions

## Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up .env file
cp .env.example .env
# Edit .env with your local Firebase credentials

# Run the server
python -m uvicorn app.main:app --reload
```

## API Examples

### Upload Tender
```bash
curl -X POST http://localhost:8000/upload-tender \
  -F "file=@tender.pdf" \
  -F "name=RFQ-2024-001" \
  -F "description=Infrastructure Project"
```

### Get Tender
```bash
curl http://localhost:8000/get-tender/TENDER_ID
```

### Upload Vendor Bid
```bash
curl -X POST http://localhost:8000/upload-vendor \
  -F "file=@vendor_bid.pdf" \
  -F "tender_id=TENDER_ID"
```

## Support

For issues or questions:
1. Check Railway logs
2. Review the application logs in `stdout`
3. Verify all environment variables are set correctly
4. Check Firebase Console for errors

---

Last updated: December 21, 2025
