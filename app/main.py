from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os

# ==========================================================
# CORE IMPORTS
# ==========================================================
from app.core.firebase_init import init_firebase
from app.ocr.ocr_engine import extract_text_from_pdf

# ==========================================================
# PIPELINES
# ==========================================================
from app.pipelines.tender_pipeline import run_tender_pipeline
from app.pipelines.vendor_pipeline import run_vendor_pipeline

# ==========================================================
# AGENTS / COMPARISON
# ==========================================================
from app.intelligence.vendor_extractor import run_vendor_extraction_pipeline
from app.comparison.compare_agents import compare_single_tender

# ==========================================================
# FASTAPI APP
# ==========================================================
app = FastAPI(
    title="BidScrutiny AI Backend",
    version="1.0.0",
    description="AI-assisted government tender evaluation system"
)

# ==========================================================
# CORS
# ==========================================================
# Build allowed origins based on environment
allow_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# Add production URLs from environment
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allow_origins.append(frontend_url)
    print(f"[CORS] Added frontend URL: {frontend_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Allow all origins as fallback (simpler approach)

@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# ==========================================================
# FIREBASE INIT (SINGLETON)
# ==========================================================
try:
    db, bucket = init_firebase()
    print("✓ Firebase initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase initialization failed: {str(e)}")
    db, bucket = None, None

# Ensure temp directory exists
os.makedirs("temp", exist_ok=True)

# ==========================================================
# 1️⃣ UPLOAD TENDER
# ==========================================================
@app.post("/upload-tender")
async def upload_tender(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(...)
):
    """Upload a tender document and process with OCR"""
    try:
        print(f"\n{'='*60}")
        print(f"[TENDER UPLOAD] Started")
        print(f"{'='*60}")
        print(f"  - Name: {name}")
        print(f"  - Description: {description}")
        print(f"  - File: {file.filename}")
        print(f"  - Content Type: {file.content_type}")
        
        if not file.filename.lower().endswith(".pdf"):
            print(f"  ❌ Invalid file type: {file.filename}")
            return {"error": "Only PDF files allowed"}

        # Save tender PDF to temp path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tender_pdf_path = tmp.name
            print(f"  ✓ File saved: {tender_pdf_path} ({len(content)} bytes)")

        try:
            # Run full tender pipeline (OCR happens inside)
            print(f"  ▶ Running tender pipeline...")
            print(f"  ⏳ OCR + AI extraction in progress (1-3 minutes)...")
            print(f"  ⏳ Gemini is analyzing your document...")
            result = run_tender_pipeline(tender_pdf_path)
            print(f"  ✓ Pipeline complete!")
            
            # Add name and description to the result
            if "tender_id" in result:
                # Update the tender document in Firestore with name and description
                print(f"  ▶ Updating Firestore...")
                db.collection("tenders").document(result["tender_id"]).update({
                    "title": name,
                    "description": description
                })
                print(f"  ✓ Updated Firestore: {result['tender_id']}")
            
            print(f"{'='*60}")
            print(f"[TENDER UPLOAD] SUCCESS ✓")
            print(f"{'='*60}\n")
            
            return {
                **result,
                "message": "Tender uploaded successfully",
                "name": name,
                "status": "completed"
            }
        finally:
            if os.path.exists(tender_pdf_path):
                os.remove(tender_pdf_path)
                print(f"  ✓ Cleaned up temp file")
                
    except Exception as e:
        print(f"{'='*60}")
        print(f"[TENDER UPLOAD] FAILED ❌")
        print(f"{'='*60}")
        print(f"  ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "detail": "Failed to process tender", "status": "failed"}

# ==========================================================
# 2️⃣ UPLOAD VENDOR BID
# ==========================================================
@app.post("/upload-vendor")
async def upload_vendor(
    file: UploadFile = File(...),
    vendor_name: str = Form(...),
    tender_id: str = Form(...)
):
    """Upload vendor bid document and process evaluation"""
    try:
        print(f"\n{'='*60}")
        print(f"[VENDOR UPLOAD] Started")
        print(f"{'='*60}")
        print(f"  - Vendor Name: {vendor_name}")
        print(f"  - Tender ID: {tender_id}")
        print(f"  - File: {file.filename}")
        print(f"  - Content Type: {file.content_type}")
        
        if not file.filename.lower().endswith(".pdf"):
            print(f"  ❌ Invalid file type: {file.filename}")
            return {"error": "Only PDF files allowed"}

        # Save vendor PDF to temp path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            vendor_pdf_path = tmp.name
            print(f"  ✓ File saved: {vendor_pdf_path} ({len(content)} bytes)")

        try:
            # --------------------------------------------------
            # OCR (FILE PATH ONLY — matches ocr_engine.py)
            # --------------------------------------------------
            print(f"  ▶ Extracting text from PDF (OCR)...")
            vendor_text = extract_text_from_pdf(vendor_pdf_path)
            print(f"  ✓ Text extracted: {len(vendor_text)} characters")

            # --------------------------------------------------
            # Fetch tender JSON (handle both database ID and extracted ID)
            # --------------------------------------------------
            print(f"  ▶ Fetching tender from Firebase...")
            print(f"    Tender ID provided: {tender_id}")
            
            # Try direct lookup first (if it's a database document ID)
            tender_doc = db.collection("tenders").document(tender_id).get()
            
            # If not found, search by extracted_tender_id field
            if not tender_doc.exists:
                print(f"  ⚠ Direct lookup failed, searching by extracted_tender_id...")
                try:
                    results = list(
                        db.collection("tenders")
                        .where(filter=db.FieldFilter("extracted_tender_id", "==", tender_id))
                        .limit(1)
                        .stream()
                    )
                    if results:
                        tender_doc = results[0]
                        actual_tender_id = tender_doc.id
                        print(f"  ✓ Found tender by extracted_tender_id: {actual_tender_id}")
                    else:
                        print(f"  ❌ Tender not found: {tender_id}")
                        return {"error": f"Tender '{tender_id}' not found in database"}
                except Exception as search_error:
                    print(f"  ❌ Search failed: {str(search_error)}")
                    return {"error": f"Failed to find tender: {str(search_error)}"}
            else:
                actual_tender_id = tender_id

            tender_json = tender_doc.to_dict()
            # Ensure the actual database ID is used for vendor storage
            tender_json["_db_document_id"] = actual_tender_id
            print(f"  ✓ Tender found: {tender_json.get('title', 'Untitled')}")

            # --------------------------------------------------
            # Vendor extraction (AI)
            # --------------------------------------------------
            print(f"  ▶ Running vendor extraction AI...")
            vendor_json = run_vendor_extraction_pipeline(vendor_text)
            
            # Override vendor name from form
            vendor_json["vendor_name"] = vendor_name
            print(f"  ✓ Vendor JSON extracted")

            # --------------------------------------------------
            # Full vendor evaluation pipeline
            # --------------------------------------------------
            print(f"  ▶ Running fraud & compliance analysis...")
            print(f"  ⏳ Fraud detection in progress (1-3 minutes)...")
            print(f"  ⏳ Compliance comparison in progress...")
            print(f"  ⏳ Gemini is evaluating your vendor submission...")
            with open(vendor_pdf_path, "rb") as f:
                vendor_pdf_bytes = f.read()

            result = run_vendor_pipeline(
                vendor_text=vendor_text,
                vendor_json=vendor_json,
                tender_json=tender_json,
                vendor_pdf_bytes=vendor_pdf_bytes,
                vendor_filename=file.filename
            )
            print(f"  ✓ Evaluation complete")

            print(f"{'='*60}")
            print(f"[VENDOR UPLOAD] SUCCESS ✓")
            print(f"{'='*60}")
            print(f"  - Vendor ID: {result.get('vendor_id', 'N/A')}")
            print(f"  - Final Score: {result.get('final_score', 0)}")
            print(f"  - Pass/Fail: {result.get('pass_fail', 'UNKNOWN')}")
            print(f"{'='*60}\n")

            return {
                **result,
                "message": "Vendor bid submitted successfully",
                "vendor_name": vendor_name,
                "status": "completed"
            }
        finally:
            if os.path.exists(vendor_pdf_path):
                os.remove(vendor_pdf_path)
                print(f"  ✓ Cleaned up temp file")
                
    except Exception as e:
        print(f"{'='*60}")
        print(f"[VENDOR UPLOAD] FAILED ❌")
        print(f"{'='*60}")
        print(f"  ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "detail": "Failed to process vendor bid", "status": "failed"}

# ==========================================================
# 3️⃣ COMPARE VENDORS FOR ONE TENDER
# ==========================================================
@app.get("/compare/{tender_id}")
async def compare_tender(tender_id: str):
    """Get detailed vendor comparison for a specific tender"""
    return compare_single_tender(tender_id)

# ==========================================================
# 4️⃣ COMPARE ALL TENDERS (GOVERNMENT DASHBOARD)
# ==========================================================
@app.get("/compare-all")
async def compare_everything():
    """Get all vendors across all tenders for government dashboard"""
    try:
        # Fetch all tenders
        tenders = db.collection("tenders").stream()
        
        all_vendors = []
        
        for tender_doc in tenders:
            tender_id = tender_doc.id
            tender_data = tender_doc.to_dict()
            
            # Fetch all vendors for this tender
            vendor_stream = (
                db.collection("tenders")
                .document(tender_id)
                .collection("vendors")
                .stream()
            )
            
            for vendor_doc in vendor_stream:
                vendor_data = vendor_doc.to_dict()
                vendor_id = vendor_data.get("vendor_id", vendor_doc.id)
                
                # Extract compliance and fraud scores
                compliance_report = vendor_data.get("compliance_report", {})
                fraud_report = vendor_data.get("fraud_report", {})
                
                # Calculate scores
                compliance_score = float(compliance_report.get("final_score", 0))
                eligibility_score = float(compliance_report.get("eligibility_score", 0))
                technical_score = float(compliance_report.get("technical_score", 0))
                financial_score = float(compliance_report.get("financial_score", 0))
                
                # Get missing documents
                missing_docs = compliance_report.get("missing_documents", [])
                
                # Get fraud risk
                fraud_score = float(fraud_report.get("final_fraud_score", 0))
                fraud_risk = "high" if fraud_score < 60 else "medium" if fraud_score < 80 else "low"
                
                # Get status
                pass_fail = vendor_data.get("pass_fail", "UNKNOWN")
                status = "eligible" if pass_fail == "PASS" else "not_eligible"
                
                # Build vendor object for frontend
                vendor_obj = {
                    "id": vendor_id,
                    "name": vendor_data.get("vendor_name", "Unknown Vendor"),
                    "tender_id": tender_id,
                    "tender_name": tender_data.get("title", "Unknown Tender"),
                    "compliance_score": int(compliance_score),
                    "eligibility_score": int(eligibility_score),
                    "technical_score": int(technical_score),
                    "financial_score": int(financial_score),
                    "missing_documents": missing_docs,
                    "fraud_risk": fraud_risk,
                    "status": status,
                    "submitted_date": vendor_data.get("created_at", ""),
                }
                
                all_vendors.append(vendor_obj)
        
        # Calculate summary
        eligible_vendors = [v for v in all_vendors if v["status"] == "eligible"]
        flagged_vendors = [v for v in all_vendors if v["fraud_risk"] in ["high", "medium"]]
        avg_compliance = int(sum(v["compliance_score"] for v in all_vendors) / len(all_vendors)) if all_vendors else 0
        
        return {
            "vendors": all_vendors,
            "summary": {
                "total_vendors": len(all_vendors),
                "eligible_vendors": len(eligible_vendors),
                "flagged_vendors": len(flagged_vendors),
                "avg_compliance": avg_compliance
            }
        }
    except Exception as e:
        return {
            "error": str(e),
            "vendors": [],
            "summary": {
                "total_vendors": 0,
                "eligible_vendors": 0,
                "flagged_vendors": 0,
                "avg_compliance": 0
            }
        }

# ==========================================================
# 5️⃣ GET VENDOR DETAILS
# ==========================================================
@app.get("/vendor/{vendor_id}")
async def get_vendor_details(vendor_id: str):
    """Get detailed evaluation for a specific vendor"""
    try:
        # Search all tenders for this vendor
        tenders = db.collection("tenders").stream()
        
        for tender_doc in tenders:
            tender_id = tender_doc.id
            vendor_doc = (
                db.collection("tenders")
                .document(tender_id)
                .collection("vendors")
                .where("vendor_id", "==", vendor_id)
                .limit(1)
                .stream()
            )
            
            for v_doc in vendor_doc:
                vendor_data = v_doc.to_dict()
                
                # Build complete vendor details
                compliance_report = vendor_data.get("compliance_report", {})
                fraud_report = vendor_data.get("fraud_report", {})
                reasoning_report = vendor_data.get("reasoning_report", {})
                
                return {
                    "id": vendor_id,
                    "name": vendor_data.get("vendor_name", "Unknown"),
                    "compliance_score": int(compliance_report.get("final_score", 0)),
                    "eligibility_score": int(compliance_report.get("eligibility_score", 0)),
                    "technical_score": int(compliance_report.get("technical_score", 0)),
                    "financial_score": int(compliance_report.get("financial_score", 0)),
                    "status": "eligible" if vendor_data.get("pass_fail") == "PASS" else "not_eligible",
                    "fraud_risk": "low" if fraud_report.get("final_fraud_score", 100) > 80 else "medium" if fraud_report.get("final_fraud_score", 100) > 60 else "high",
                    "submitted_date": vendor_data.get("created_at", ""),
                    "documents": compliance_report.get("document_checklist", []),
                    "requirements": compliance_report.get("requirements", []),
                    "fraud_alerts": fraud_report.get("integrity_report", {}).get("anomalies_detected", []),
                    "ai_explanation": reasoning_report
                }
        
        return {"error": "Vendor not found"}
    except Exception as e:
        return {"error": str(e)}

# ==========================================================
# 6️⃣ GET AVAILABLE TENDERS (VENDOR VIEW)
# ==========================================================
@app.get("/tenders")
async def get_tenders():
    """Get all available tenders for vendor view"""
    try:
        tenders = db.collection("tenders").stream()
        tender_list = []
        
        for doc in tenders:
            tender_data = doc.to_dict()
            tender_list.append({
                "id": doc.id,
                "name": tender_data.get("title", "Unknown Tender"),
                "description": tender_data.get("description", ""),
                "deadline": tender_data.get("deadline", ""),
                "status": "open"
            })
        
        return {"tenders": tender_list}
    except Exception as e:
        return {"error": str(e), "tenders": []}

# ==========================================================
# 7️⃣ GET ALL BIDS FOR SPECIFIC TENDER (WITH RANKING)
# ==========================================================
@app.get("/tender/{tender_id}/bids")
async def get_tender_bids(tender_id: str):
    """Get all vendor bids for a specific tender with rankings and fraud comparison"""
    try:
        # Verify tender exists
        tender_doc = db.collection("tenders").document(tender_id).get()
        if not tender_doc.exists:
            return {"error": "Tender not found"}
        
        tender_data = tender_doc.to_dict()
        
        # Fetch all vendors for this tender
        vendor_stream = (
            db.collection("tenders")
            .document(tender_id)
            .collection("vendors")
            .stream()
        )
        
        bids = []
        for vendor_doc in vendor_stream:
            vendor_data = vendor_doc.to_dict()
            vendor_id = vendor_data.get("vendor_id", vendor_doc.id)
            
            # Extract all relevant data
            compliance_report = vendor_data.get("compliance_report", {})
            fraud_report = vendor_data.get("fraud_report", {})
            
            # Get financial data
            financial_data = vendor_data.get("vendor_json", {}).get("financial_info", {})
            quoted_price = financial_data.get("quoted_price", 0)
            
            # Calculate scores
            compliance_score = float(compliance_report.get("final_score", 0))
            fraud_score = float(fraud_report.get("final_fraud_score", 100))
            eligibility_score = float(compliance_report.get("eligibility_score", 0))
            technical_score = float(compliance_report.get("technical_score", 0))
            financial_score = float(compliance_report.get("financial_score", 0))
            
            # Get status
            pass_fail = vendor_data.get("pass_fail", "UNKNOWN")
            status = "eligible" if pass_fail == "PASS" else "rejected"
            
            bid = {
                "vendor_id": vendor_id,
                "vendor_name": vendor_data.get("vendor_name", "Unknown"),
                "compliance_score": int(compliance_score),
                "fraud_score": int(fraud_score),
                "eligibility_score": int(eligibility_score),
                "technical_score": int(technical_score),
                "financial_score": int(financial_score),
                "quoted_price": quoted_price,
                "status": status,
                "submitted_at": vendor_data.get("created_at", ""),
                "missing_documents": compliance_report.get("missing_documents", []),
                "fraud_alerts": fraud_report.get("integrity_report", {}).get("anomalies_detected", []),
                "pdf_url": vendor_data.get("pdf_url", ""),
                "vendor_data": vendor_data  # Store full data for comparison
            }
            bids.append(bid)
        
        # Rank by compliance score (high to low)
        bids_sorted = sorted(bids, key=lambda x: x["compliance_score"], reverse=True)
        
        # Add rank
        for idx, bid in enumerate(bids_sorted):
            bid["rank"] = idx + 1
        
        # Detect potential fraud by comparing vendor data
        fraud_flags = []
        for i, bid1 in enumerate(bids):
            for j, bid2 in enumerate(bids):
                if i >= j:
                    continue
                
                # Check for duplicate GST, PAN, Bank Account
                vendor1_data = bid1["vendor_data"].get("vendor_json", {})
                vendor2_data = bid2["vendor_data"].get("vendor_json", {})
                
                gst1 = vendor1_data.get("gst_number", "")
                gst2 = vendor2_data.get("gst_number", "")
                
                pan1 = vendor1_data.get("pan_number", "")
                pan2 = vendor2_data.get("pan_number", "")
                
                if gst1 and gst2 and gst1 == gst2:
                    fraud_flags.append({
                        "type": "duplicate_gst",
                        "vendors": [bid1["vendor_name"], bid2["vendor_name"]],
                        "value": gst1,
                        "severity": "high",
                        "reasoning": "Two different vendors submitted bids with the same GST number, indicating potential collusion or identity fraud."
                    })
                
                if pan1 and pan2 and pan1 == pan2:
                    fraud_flags.append({
                        "type": "duplicate_pan",
                        "vendors": [bid1["vendor_name"], bid2["vendor_name"]],
                        "value": pan1,
                        "severity": "high",
                        "reasoning": "Two different vendors submitted bids with the same PAN number, indicating potential collusion or identity fraud."
                    })
                
                # Check for suspiciously similar prices (within 1%)
                price1 = bid1["quoted_price"]
                price2 = bid2["quoted_price"]
                
                if price1 and price2 and price1 > 0 and price2 > 0:
                    diff_percent = abs(price1 - price2) / max(price1, price2) * 100
                    if diff_percent < 1:
                        fraud_flags.append({
                            "type": "similar_pricing",
                            "vendors": [bid1["vendor_name"], bid2["vendor_name"]],
                            "value": f"₹{price1:,.2f} vs ₹{price2:,.2f}",
                            "severity": "medium",
                            "reasoning": f"Bids are suspiciously similar (within {diff_percent:.2f}%), suggesting possible price coordination."
                        })
        
        # Remove vendor_data from response (too large)
        for bid in bids_sorted:
            del bid["vendor_data"]
        
        # Find lowest quoted price winner (among eligible only)
        eligible_bids = [b for b in bids_sorted if b["status"] == "eligible" and b["quoted_price"] > 0]
        recommended_winner = None
        if eligible_bids:
            winner = min(eligible_bids, key=lambda x: x["quoted_price"])
            recommended_winner = {
                "vendor_id": winner["vendor_id"],
                "vendor_name": winner["vendor_name"],
                "quoted_price": winner["quoted_price"],
                "compliance_score": winner["compliance_score"],
                "reasoning": f"{winner['vendor_name']} is recommended as they have the lowest quoted price (₹{winner['quoted_price']:,.2f}) among eligible bidders with a compliance score of {winner['compliance_score']}%."
            }
        
        return {
            "tender_id": tender_id,
            "tender_name": tender_data.get("title", "Unknown"),
            "tender_description": tender_data.get("description", ""),
            "total_bids": len(bids),
            "eligible_bids": len(eligible_bids),
            "bids": bids_sorted,
            "fraud_flags": fraud_flags,
            "recommended_winner": recommended_winner
        }
        
    except Exception as e:
        return {"error": str(e)}

# ==========================================================
# 8️⃣ DOWNLOAD VENDOR REPORT (PDF DATA)
# ==========================================================
@app.get("/vendor/{vendor_id}/report")
async def download_vendor_report(vendor_id: str):
    """Get complete vendor report data for download"""
    try:
        # Search all tenders for this vendor
        tenders = db.collection("tenders").stream()
        
        for tender_doc in tenders:
            tender_id = tender_doc.id
            tender_data = tender_doc.to_dict()
            
            vendor_doc = (
                db.collection("tenders")
                .document(tender_id)
                .collection("vendors")
                .where("vendor_id", "==", vendor_id)
                .limit(1)
                .stream()
            )
            
            for v_doc in vendor_doc:
                vendor_data = v_doc.to_dict()
                
                # Build comprehensive report
                compliance_report = vendor_data.get("compliance_report", {})
                fraud_report = vendor_data.get("fraud_report", {})
                reasoning_report = vendor_data.get("reasoning_report", {})
                vendor_json = vendor_data.get("vendor_json", {})
                
                report = {
                    "vendor_id": vendor_id,
                    "vendor_name": vendor_data.get("vendor_name", "Unknown"),
                    "tender_id": tender_id,
                    "tender_name": tender_data.get("title", "Unknown"),
                    "submitted_at": vendor_data.get("created_at", ""),
                    
                    # Overall Assessment
                    "overall_status": vendor_data.get("pass_fail", "UNKNOWN"),
                    "compliance_score": compliance_report.get("final_score", 0),
                    "fraud_score": fraud_report.get("final_fraud_score", 0),
                    
                    # Detailed Scores
                    "scores": {
                        "eligibility": compliance_report.get("eligibility_score", 0),
                        "technical": compliance_report.get("technical_score", 0),
                        "financial": compliance_report.get("financial_score", 0)
                    },
                    
                    # Company Information
                    "company_info": {
                        "name": vendor_json.get("company_name", ""),
                        "address": vendor_json.get("address", ""),
                        "gst_number": vendor_json.get("gst_number", ""),
                        "pan_number": vendor_json.get("pan_number", ""),
                        "contact": vendor_json.get("contact", {})
                    },
                    
                    # Financial Data
                    "financial_info": vendor_json.get("financial_info", {}),
                    
                    # Documents
                    "documents": compliance_report.get("document_checklist", []),
                    "missing_documents": compliance_report.get("missing_documents", []),
                    
                    # Requirements Check
                    "requirements": compliance_report.get("requirements", []),
                    
                    # Fraud Analysis
                    "fraud_analysis": {
                        "anomalies": fraud_report.get("integrity_report", {}).get("anomalies_detected", []),
                        "signature_status": fraud_report.get("signature_fraud", {}).get("status", ""),
                        "risk_level": "high" if fraud_report.get("final_fraud_score", 100) < 60 else "medium" if fraud_report.get("final_fraud_score", 100) < 80 else "low"
                    },
                    
                    # AI Reasoning
                    "ai_reasoning": reasoning_report,
                    
                    # PDF URL
                    "pdf_url": vendor_data.get("pdf_url", "")
                }
                
                return report
        
        return {"error": "Vendor not found"}
        
    except Exception as e:
        return {"error": str(e)}

# ==========================================================
# 9️⃣ ROOT / HEALTH CHECK
# ==========================================================
@app.get("/")
def root():
    firebase_status = "connected" if db is not None else "disconnected"
    return {
        "status": "ok",
        "service": "BidScrutiny AI Backend",
        "version": "1.0.0",
        "firebase": firebase_status,
        "message": "Service is running"
    }

@app.get("/health")
def health_check():
    """Railway health check endpoint"""
    return {
        "status": "healthy",
        "firebase": "connected" if db is not None else "disconnected",
        "cors": "enabled"
    }

@app.get("/debug/firebase")
def debug_firebase():
    """Test Firebase connection and list data"""
    try:
        # Test Firestore read
        tenders = db.collection("tenders").limit(5).stream()
        tender_count = sum(1 for _ in tenders)
        
        # Re-fetch for actual data
        tenders = db.collection("tenders").stream()
        tender_list = []
        vendor_count = 0
        
        for tender_doc in tenders:
            tender_id = tender_doc.id
            tender_data = tender_doc.to_dict()
            tender_list.append({
                "id": tender_id,
                "title": tender_data.get("title", "Unknown"),
                "created_at": tender_data.get("created_at", "Unknown")
            })
            
            # Count vendors
            vendor_stream = (
                db.collection("tenders")
                .document(tender_id)
                .collection("vendors")
                .stream()
            )
            vendor_count += sum(1 for _ in vendor_stream)
        
        return {
            "status": "connected",
            "firebase": db is not None,
            "storage": bucket is not None,
            "tenders_count": len(tender_list),
            "vendors_count": vendor_count,
            "tenders": tender_list,
            "message": "Firebase connection successful"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "firebase": db is not None,
            "storage": bucket is not None
        }

# Railway deployment configuration
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
