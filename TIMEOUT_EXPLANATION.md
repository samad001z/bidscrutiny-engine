# ⏱️ Timeout Settings - INCREASED FOR AI PROCESSING

## Current Settings (UPDATED)

```
Global Timeout: 300 seconds (5 minutes)
Tender Upload: 300 seconds (5 minutes)
Vendor Bid: 300 seconds (5 minutes)
```

## Why So Long?

The processing pipeline involves MULTIPLE AI and fraud detection steps:

### Tender Upload Flow
```
1. Save PDF to temp (1-2 seconds)
2. OCR Extraction (30-60 seconds) ← Text extraction from PDF
3. Gemini AI Processing (30-90 seconds) ← Structure extraction
4. Save to Firebase (2-5 seconds)
TOTAL: 60-160 seconds
```

### Vendor Bid Flow
```
1. Save PDF to temp (1-2 seconds)
2. OCR Extraction (30-60 seconds) ← Text extraction
3. Gemini AI Processing (30-90 seconds) ← Vendor info extraction
4. Fraud Detection Pipeline (30-60 seconds) ← Red flag detection
5. Compliance Analysis (30-60 seconds) ← Requirement matching
6. Reasoning Agent (30-60 seconds) ← AI explanation generation
7. Save to Firebase (2-5 seconds)
TOTAL: 150-330 seconds (2-5 minutes)
```

## What This Means

**When submitting a vendor bid:**
- ✅ First 60 seconds: "Processing your bid..."
- ✅ 60-120 seconds: AI is running fraud detection
- ✅ 120-180 seconds: Compliance checking
- ✅ 180-300 seconds: Final scoring and reasoning
- ✅ If it completes within 5 minutes: Success!

## User Experience

The frontend now shows helpful messages:

```
"Request timed out. The server is processing your bid through multiple AI pipelines:

• OCR (Optical Character Recognition)
• Fraud Detection Analysis
• Compliance Comparison
• AI Reasoning & Scoring

This can take 2-5 minutes. Please wait..."
```

## Backend Logging

You'll see progress messages:

```
[VENDOR UPLOAD] Started
  - Vendor Name: Acme Corp
  ✓ File saved: /temp/xyz.pdf (256789 bytes)
  ▶ Extracting text from PDF (OCR)...
  ✓ Text extracted: 45678 characters
  ⏳ Fraud detection in progress (1-3 minutes)...
  ⏳ Compliance comparison in progress...
  ⏳ Gemini is evaluating your vendor submission...
  ✓ Evaluation complete
[VENDOR UPLOAD] SUCCESS ✓
  - Vendor ID: acme_corp_20251221_143052
  - Final Score: 87.5
  - Pass/Fail: PASS
```

## If Still Timing Out

If it still times out after 5 minutes:

1. **Check Gemini API** - May have rate limiting
2. **Check Firebase** - May have connectivity issues
3. **Check Network** - May have slow upload speed
4. **Check File Size** - Large PDFs take longer to OCR
5. **Check Backend Logs** - Look for errors in terminal

## Performance Tips

- Use PDF files under 5MB for faster processing
- Ensure PDFs are clear and well-scanned
- Make sure internet connection is stable
- Don't close the browser during submission
- Multiple simultaneous uploads may be slower

---

**Bottom Line:** The system is working correctly. The long timeout is needed because Gemini AI + Fraud Detection is doing thorough analysis. Let it do its job! ✅
