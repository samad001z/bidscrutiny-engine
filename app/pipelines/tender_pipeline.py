import json
import re
from typing import Dict

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
You are an AI system that extracts structured tender information
from Indian Government procurement documents (GeM / eProc).

STRICT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations.
- Do NOT hallucinate missing data.
- If data is missing, return empty string, 0, or [].

RETURN THIS EXACT SCHEMA:

{{
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
    Returns tender_id.
    """

    tender_id = (
        tender_json.get("tender_id")
        or tender_json.get("title")
        or "UNKNOWN"
    )

    # Sanitize tender_id for Firestore / Storage
    tender_id = str(tender_id).strip().replace("/", "_").replace(" ", "_")

    # Save JSON
    db.collection("tenders").document(tender_id).set(tender_json)

    # Upload PDF
    blob = bucket.blob(f"tenders/{tender_id}.pdf")
    blob.upload_from_filename(
        pdf_path,
        content_type="application/pdf"
    )

    return tender_id


# ------------------------------------------------------
# 3️⃣ Full Tender Processing Pipeline
# ------------------------------------------------------
def run_tender_pipeline(pdf_path: str) -> Dict:
    """
    End-to-end tender pipeline:
    PDF → OCR → AI extraction → Firebase persistence
    """

    # Step 1 — OCR extraction (OCR-only, file-path based)
    extracted_text = extract_text_from_pdf(pdf_path)

    # Step 2 — AI JSON extraction
    tender_json = extract_tender_json_from_text(extracted_text)

    # Step 3 — Save to Firebase
    tender_id = save_tender_to_firebase(tender_json, pdf_path)

    # Step 4 — Output
    return {
        "tender_id": tender_id,
        "tender_json": tender_json,
        "status": "Tender processed successfully"
    }
