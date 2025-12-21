import json
import re
import uuid
import os
from typing import Dict
from datetime import datetime

from app.intelligence.model_loader import pro_model
from app.core.firebase_init import init_firebase
from app.ocr.ocr_engine import extract_text_from_pdf


# ------------------------------------------------------
# Firebase singletons
# ------------------------------------------------------
db, bucket = init_firebase()


# ------------------------------------------------------
# Helper: Extract JSON safely from AI response
# ------------------------------------------------------
def _extract_json_from_text(text: str) -> Dict:
    """
    Extract JSON object safely from model output.
    Returns safe fallback schema if extraction fails.
    """
    if not text:
        return _empty_tender_schema()

    cleaned = text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        return _empty_tender_schema()

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return _empty_tender_schema()


def _empty_tender_schema() -> Dict:
    return {
        "tender_id": "",
        "title": "",
        "department": "",
        "summary": "",
        "scope_of_work": [],
        "technical_requirements": [],
        "eligibility_criteria": [],
        "required_certificates": [],
        "financial_criteria": [],
        "bid_deadlines": [],
        "contact_details": "",
        "evaluation_method": ""
    }


# ------------------------------------------------------
# 1️⃣ Tender JSON Extraction using Gemini
# ------------------------------------------------------
def extract_tender_json_from_text(text: str) -> Dict:
    """
    Uses Gemini 2.5 Pro to extract structured tender data.
    """

    prompt = f"""
You are an expert AI system that extracts DETAILED structured tender information
from Indian Government procurement documents (GeM / eProc / State tenders).

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON.
- No markdown, no explanations, no extra text.
- Do NOT hallucinate missing data.
- Extract ALL mentioned requirements, criteria, and deadlines.
- If data is missing, return empty string, 0, or empty array [].

EXTRACTION PRIORITY:
1. Tender ID/RFQ number (look for: Ref No, RFQ No, Tender No, Document ID)
2. Project title/description
3. Department/Organization name
4. ALL technical requirements mentioned
5. ALL eligibility criteria (experience, turnover, registrations)
6. ALL required certificates/documents
7. Financial criteria (bid amount, EMD, performance guarantee)
8. All bid/proposal submission deadlines
9. Contact details of tender issuer
10. Evaluation methodology/criteria

Return this exact JSON structure with ALL fields populated:

{{
  "tender_id": "Extract the official RFQ/Tender/Document number here",
  "title": "Full project/tender title",
  "department": "Department or organization issuing tender",
  "summary": "2-3 sentence summary of what is being procured",
  "scope_of_work": ["List each scope item or service requirement separately"],
  "technical_requirements": ["List each technical specification or requirement"],
  "eligibility_criteria": ["List each eligibility criterion with specific values"],
  "required_certificates": ["List each required certification or document"],
  "financial_criteria": ["List bid amount, EMD, GST, payment terms, etc."],
  "bid_deadlines": ["List all deadlines: submission, opening, technical eval, etc."],
  "contact_details": "Complete contact information of tender issuer",
  "evaluation_method": "Detailed evaluation process and weightages"
}}

TENDER DOCUMENT TEXT:
{text}
"""

    response = pro_model.generate_content(prompt)

    if not response or not response.text:
        return _empty_tender_schema()

    return _extract_json_from_text(response.text)


# ------------------------------------------------------
# 2️⃣ Save Tender JSON + PDF to Firebase
# ------------------------------------------------------
def save_tender_to_firebase(tender_json: Dict, pdf_path: str) -> str:
    """
    Saves tender JSON to Firestore and PDF to Firebase Storage.
    Returns unique document ID (NOT extracted tender_id).
    
    The extracted tender_id is stored inside the document as a field.
    """

    try:
        extracted_tender_id = tender_json.get("tender_id", "").strip()
        print(f"\n  ▶ Saving tender to Firebase...")
        print(f"    Extracted Tender ID: {extracted_tender_id}")

        # Generate unique document ID (prevents overwrites)
        # Format: tender_TIMESTAMP_UUID
        unique_doc_id = f"tender_{datetime.utcnow().isoformat()}_{uuid.uuid4().hex[:8]}"
        print(f"    Generated DB Document ID: {unique_doc_id}")
        
        # Build complete data to save
        data_to_save = {
            **tender_json,
            "db_document_id": unique_doc_id,  # Store unique DB ID
            "extracted_tender_id": extracted_tender_id,  # Keep extracted tender ID
            "uploaded_at": datetime.utcnow().isoformat(),
            "pdf_filename": os.path.basename(pdf_path)
        }

        # Save JSON to Firestore
        if db is None:
            print("  ❌ Firebase Firestore not initialized")
            raise RuntimeError("Firestore is not available")
            
        try:
            db.collection("tenders").document(unique_doc_id).set(data_to_save)
            print(f"  ✓ Tender JSON saved to Firestore")
        except Exception as e:
            print(f"  ❌ Firestore save failed: {str(e)}")
            raise

        # Upload PDF to Storage
        if bucket is not None:
            try:
                blob = bucket.blob(f"tenders/{unique_doc_id}.pdf")
                blob.upload_from_filename(
                    pdf_path,
                    content_type="application/pdf"
                )
                pdf_url = blob.public_url
                print(f"  ✓ PDF uploaded to Storage: {pdf_url}")
                
                # Update document with PDF URL
                db.collection("tenders").document(unique_doc_id).update({
                    "pdf_url": pdf_url
                })
            except Exception as e:
                print(f"  ⚠ PDF upload failed: {str(e)}")
                # Don't fail the entire process if PDF upload fails
        else:
            print("  ⚠ Firebase Storage bucket not configured, skipping PDF upload")

        print(f"  ✓ Tender successfully stored with ID: {unique_doc_id}")
        return unique_doc_id
        
    except Exception as e:
        print(f"  ❌ Tender save failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


# ------------------------------------------------------
# 3️⃣ Full Tender Processing Pipeline
# ------------------------------------------------------
def run_tender_pipeline(pdf_path: str) -> Dict:
    """
    End-to-end tender pipeline:
    PDF → OCR → AI extraction → Firebase persistence
    """

    try:
        print(f"\n{'='*60}")
        print(f"[TENDER PIPELINE] Starting")
        print(f"{'='*60}")
        print(f"  - PDF Path: {pdf_path}")
        print(f"  - File Size: {os.path.getsize(pdf_path)} bytes")
        
        # Step 1 — OCR extraction
        print(f"\n  ▶ Step 1: Extracting text from PDF (OCR)...")
        try:
            extracted_text = extract_text_from_pdf(pdf_path)
            print(f"  ✓ Text extracted: {len(extracted_text)} characters")
        except Exception as e:
            print(f"  ❌ OCR extraction failed: {str(e)}")
            raise

        # Step 2 — AI JSON extraction
        print(f"\n  ▶ Step 2: Extracting tender data (AI)...")
        try:
            tender_json = extract_tender_json_from_text(extracted_text)
            extracted_id = tender_json.get("tender_id", "UNKNOWN")
            print(f"  ✓ Tender data extracted")
            print(f"    - Title: {tender_json.get('title', 'Unknown')[:50]}...")
            print(f"    - Extracted Tender ID: {extracted_id}")
            print(f"    - Department: {tender_json.get('department', 'Unknown')[:40]}...")
        except Exception as e:
            print(f"  ❌ AI extraction failed: {str(e)}")
            raise

        # Step 3 — Save to Firebase
        print(f"\n  ▶ Step 3: Saving to Firebase...")
        try:
            tender_id = save_tender_to_firebase(tender_json, pdf_path)
        except Exception as e:
            print(f"  ❌ Firebase save failed: {str(e)}")
            raise

        # Step 4 — Output
        print(f"\n{'='*60}")
        print(f"[TENDER PIPELINE] SUCCESS ✓")
        print(f"{'='*60}")
        print(f"  - Document ID: {tender_id}")
        print(f"  - Extracted ID: {tender_json.get('tender_id', 'UNKNOWN')}")
        print(f"  - Status: Ready for vendor bidding")
        print(f"{'='*60}\n")
        
        return {
            "tender_id": tender_id,
            "tender_json": tender_json,
            "status": "Tender processed successfully"
        }
        
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"[TENDER PIPELINE] FAILED ❌")
        print(f"{'='*60}")
        print(f"  ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        
        raise
