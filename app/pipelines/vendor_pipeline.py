import json
import re
import uuid
import os
from typing import Dict
from datetime import datetime

from app.intelligence.model_loader import pro_model
from app.core.firebase_init import init_firebase
from app.ocr.ocr_engine import extract_text_from_pdf
from app.intelligence.comparison_agent import compare_vendor_to_tender

# 🔐 ADDED IMPORTS (CRYPTOGRAPHY)
from app.crypto.hash_utils import generate_sha256_hash
from app.crypto.signature_agent import analyze_signatures


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
        return _empty_vendor_schema()

    cleaned = text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        return _empty_vendor_schema()

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return _empty_vendor_schema()


def _empty_vendor_schema() -> Dict:
    return {
        "vendor_name": "",
        "company_name": "",
        "address": "",
        "gst_number": "",
        "pan_number": "",
        "contact": {},
        "financial_info": {},
        "certificates": []
    }


# ------------------------------------------------------
# 1️⃣ Vendor JSON Extraction using Gemini
# ------------------------------------------------------
def extract_vendor_json_from_text(text: str) -> Dict:
    """
    Uses Gemini 2.5 Pro to extract structured vendor data from bid documents.
    """

    prompt = f"""
You are an EXPERT AI Vendor Document Parser for Indian Government Procurement.

Extract ALL vendor information from this bid document and return COMPLETE JSON.

CRITICAL EXTRACTION REQUIREMENTS:
1. Company registration details (name, registration number)
2. Contact person and all contact information
3. GST, PAN, CIN, MSME status
4. Full address with postal code
5. All ISO and quality certifications
6. Years of experience in industry
7. Past work projects (at least 3 detailed entries)
8. Annual turnover for last 3 years
9. Equipment, machinery, infrastructure details
10. Product specifications being offered
11. Quoted quantity and price
12. All supporting documents attached
13. Compliance declarations

STRICT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations, no extra text.
- Do NOT hallucinate missing data.
- If data is missing, return "", 0, false, or [].

RETURN THIS EXACT SCHEMA - POPULATE ALL FIELDS:

{{
  "vendor_id": "Registration/GST number",
  "vendor_name": "Name as in registration",
  "company_name": "Full legal company name",
  "address": "Complete address with city, state, PIN",
  "gst_number": "Valid GST number",
  "pan_number": "PAN of company",
  "cin_number": "CIN if registered",
  "contact": {{
    "person_name": "Authorized signatory name",
    "email": "Email address",
    "phone": "Phone with country code",
    "designation": "Signatory designation"
  }},
  "financial_info": {{
    "annual_turnover_last_year": 0,
    "annual_turnover_2_years": 0,
    "annual_turnover_3_years": 0,
    "quoted_price": 0,
    "quoted_quantity": 0
  }},
  "experience_years": 0,
  "past_projects": ["List each completed project with client, value, completion date"],
  "iso_certifications": ["List all ISO and quality certifications"],
  "offered_specifications": ["List all product/service specifications"],
  "uploaded_documents": ["List all attached documents with descriptions"],
  "certificates": ["List certificate details with issue and validity dates"]
}}

VENDOR DOCUMENT TEXT:
{text}
"""

    response = pro_model.generate_content(prompt)

    if not response or not response.text:
        return _empty_vendor_schema()

    return _extract_json_from_text(response.text)


# ------------------------------------------------------
# 2️⃣ Save Vendor Bid + Crypto Metadata to Firebase
# ------------------------------------------------------
def save_vendor_to_firebase(
    tender_id: str,
    vendor_json: Dict,
    vendor_text: str,
    vendor_pdf_bytes: bytes,
    vendor_filename: str
) -> Dict:
    """
    Saves vendor JSON, cryptographic hash, fraud metadata and PDF.
    Uses unique document IDs to prevent overwrites.
    """

    vendor_name = vendor_json.get("company_name") or vendor_json.get("vendor_name") or "UNKNOWN_VENDOR"
    print(f"\n  ▶ Saving vendor: {vendor_name}")
    print(f"    Tender ID: {tender_id}")

    # ✅ VALIDATE TENDER EXISTS
    try:
        tender_doc = db.collection("tenders").document(tender_id).get()
        if not tender_doc.exists:
            print(f"  ❌ ERROR: Tender '{tender_id}' does not exist in Firebase!")
            return {
                "status": "error",
                "error": f"Tender '{tender_id}' not found in database"
            }
        
        tender_data = tender_doc.to_dict()
        tender_title = tender_data.get('title', 'Unknown') if tender_data else 'Unknown'
        print(f"  ✓ Tender validated: {tender_title}")
    except Exception as e:
        print(f"  ❌ ERROR: Failed to validate tender: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "error": f"Tender validation failed: {str(e)}"
        }

    # 🔐 SHA-256 DOCUMENT HASH
    document_hash = generate_sha256_hash(vendor_text)
    print(f"    Document hash: {document_hash[:8]}...")

    # Duplicate check (same tender + same document)
    try:
        existing = list(
            db.collection("tenders")
            .document(tender_id)
            .collection("vendors")
            .where(filter=db.FieldFilter("document_hash", "==", document_hash))
            .limit(1)
            .stream()
        )
    except Exception as e:
        print(f"  ⚠ Duplicate check failed: {str(e)}")
        existing = []
    
    if existing:
        return {
            "status": "rejected",
            "reason": "Duplicate bid detected for this tender"
        }

    # ✍️ SIGNATURE ANALYSIS (AGENT)
    signature_images = vendor_json.get("signature_images", [])
    signature_fraud = analyze_signatures(signature_images)

    # Generate unique vendor document ID (prevents overwrites)
    # Format: vendor_TIMESTAMP_HASH_UUID
    unique_vendor_id = f"vendor_{datetime.utcnow().isoformat()}_{document_hash[:8]}_{uuid.uuid4().hex[:4]}".replace(":", "")
    print(f"  - Generated unique vendor ID: {unique_vendor_id}")

    # Upload PDF
    try:
        blob = bucket.blob(f"tenders/{tender_id}/vendors/{unique_vendor_id}.pdf")
        blob.upload_from_string(
            vendor_pdf_bytes,
            content_type="application/pdf"
        )
        pdf_url = blob.public_url
        print(f"  ✓ PDF uploaded to Storage: {pdf_url}")
    except Exception as e:
        print(f"  ❌ PDF upload failed: {str(e)}")
        pdf_url = None

    # Store Vendor Document with metadata
    vendor_doc = {
        "unique_vendor_id": unique_vendor_id,
        "vendor_name": vendor_name,
        "company_name": vendor_json.get("company_name", ""),
        "vendor_json": vendor_json,
        "document_hash": document_hash,
        "pdf_url": pdf_url,
        "pdf_filename": vendor_filename,
        "uploaded_at": datetime.utcnow().isoformat(),
        "fraud_report": {
            "signature_fraud": signature_fraud
        },
    }

    try:
        vendor_ref = db.collection("tenders") \
            .document(tender_id) \
            .collection("vendors") \
            .document(unique_vendor_id)
        
        # This creates the vendors subcollection if it doesn't exist
        vendor_ref.set(vendor_doc)
        
        # Verify it was actually written
        verify = vendor_ref.get()
        if verify.exists:
            print(f"  ✓ Vendor {unique_vendor_id} stored in Firebase")
            print(f"    Path: tenders/{tender_id}/vendors/{unique_vendor_id}")
        else:
            raise Exception("Document was not created in Firestore")
            
    except Exception as e:
        print(f"  ❌ Firebase storage failed: {str(e)}")
        print(f"  - Tender ID: {tender_id}")
        print(f"  - Vendor ID: {unique_vendor_id}")
        print(f"  - Full error details:")
        import traceback
        traceback.print_exc()
        raise

    return {
        "vendor_id": unique_vendor_id,
        "vendor_name": vendor_name,
        "pdf_url": pdf_url,
        "document_hash": document_hash,
        "signature_fraud": signature_fraud,
        "status": "Vendor bid saved successfully"
    }


# 3️⃣ Evaluate Vendor Against Tender Requirements
# -------------------------------------------------------
def evaluate_vendor_compliance(
    tender_json: Dict,
    vendor_json: Dict,
    unique_vendor_id: str,
    tender_id: str
) -> Dict:
    """
    Compare vendor submission against tender requirements.
    Store compliance report and return scores.
    """
    
    try:
        # Run comparison agent
        comparison_result = compare_vendor_to_tender(tender_json, vendor_json)
        
        # Build compliance report
        compliance_report = {
            "summary": comparison_result.get("summary", ""),
            "requirement_matches": comparison_result.get("requirement_matches", []),
            "missing_documents": comparison_result.get("missing_documents", []),
            "technical_score": float(comparison_result.get("technical_score", 0)),
            "financial_score": float(comparison_result.get("financial_score", 0)),
            "final_score": float(comparison_result.get("final_score", 0)),
            "evaluated_at": datetime.utcnow().isoformat()
        }
        
        # Update vendor document with compliance report
        vendor_ref = db.collection("tenders") \
            .document(tender_id) \
            .collection("vendors") \
            .document(unique_vendor_id)
        
        vendor_ref.update({
            "compliance_report": compliance_report,
            "pass_fail": comparison_result.get("pass_fail", "FAIL")
        })
        
        print(f"  ✓ Vendor {unique_vendor_id} evaluated and stored successfully")
        
        return {
            "compliance_report": compliance_report,
            "pass_fail": comparison_result.get("pass_fail", "FAIL")
        }
    except Exception as e:
        print(f"  ❌ Evaluation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "compliance_report": {},
            "pass_fail": "FAIL",
            "error": str(e)
        }


# ------------------------------------------------------
# 3️⃣ Full Vendor Processing Pipeline
# ------------------------------------------------------
def run_vendor_pipeline(
    vendor_text: str,
    vendor_json: Dict,
    tender_json: Dict,
    vendor_pdf_bytes: bytes,
    vendor_filename: str
) -> Dict:
    """
    End-to-end vendor pipeline:
    OCR → AI extraction → Crypto checks → Compliance evaluation → Firebase persistence
    """

    try:
        # Use the actual database document ID if available, otherwise use tender_id
        actual_tender_id = tender_json.get("_db_document_id") or tender_json.get("tender_id")
        tender_display_id = tender_json.get("tender_id", "UNKNOWN")
        
        print(f"\n  ▶ Starting vendor pipeline for tender: {tender_display_id}")
        print(f"    Database document ID: {actual_tender_id}")
        
        # Step 1: Save vendor + crypto metadata to Firebase
        print(f"  ▶ Step 1: Saving vendor to Firebase...")
        save_result = save_vendor_to_firebase(
            tender_id=actual_tender_id,
            vendor_json=vendor_json,
            vendor_text=vendor_text,
            vendor_pdf_bytes=vendor_pdf_bytes,
            vendor_filename=vendor_filename
        )
        
        # Check if save was successful (not a duplicate)
        if save_result.get("status") in ["rejected", "error"]:
            print(f"  ⚠ Vendor rejected: {save_result.get('reason') or save_result.get('error')}")
            return {
                "tender_id": actual_tender_id,
                "status": "rejected",
                "reason": save_result.get("reason")
            }
        
        unique_vendor_id = save_result.get("vendor_id")
        print(f"  ✓ Vendor saved with ID: {unique_vendor_id}")
        
        # Step 2: Evaluate vendor against tender requirements
        print(f"  ▶ Step 2: Evaluating vendor compliance...")
        evaluation_result = evaluate_vendor_compliance(
            tender_json=tender_json,
            vendor_json=vendor_json,
            unique_vendor_id=unique_vendor_id,
            tender_id=actual_tender_id
        )
        
        if evaluation_result.get("error"):
            print(f"  ⚠ Evaluation failed: {evaluation_result.get('error')}")
        else:
            print(f"  ✓ Evaluation complete: {evaluation_result.get('pass_fail')}")
        
        # Combine all results
        final_result = {
            "tender_id": actual_tender_id,
            "vendor_id": unique_vendor_id,
            "vendor_name": save_result.get("vendor_name"),
            "document_hash": save_result.get("document_hash"),
            "pdf_url": save_result.get("pdf_url"),
            "compliance_report": evaluation_result.get("compliance_report"),
            "pass_fail": evaluation_result.get("pass_fail"),
            "final_score": evaluation_result.get("compliance_report", {}).get("final_score", 0),
            "status": "Vendor processed successfully"
        }
        
        print(f"  ✓ Vendor pipeline completed successfully\n")
        return final_result
        
    except Exception as e:
        print(f"  ❌ Vendor pipeline failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "error": str(e),
            "detail": "Vendor processing failed"
        }
