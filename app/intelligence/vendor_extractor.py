import json
import re
from typing import Dict

from app.intelligence.model_loader import pro_model


# ------------------------------------------------------------
# 1️⃣ CORE AI EXTRACTOR — Vendor PDF Text → Structured JSON
# ------------------------------------------------------------
def extract_vendor_json_from_text(vendor_text: str) -> Dict:
    """
    Converts raw vendor document text into structured JSON.
    Safe defaults only. No hallucination.
    """

    prompt = f"""
You are an AI Vendor Document Parser for Indian Government Procurement (GeM / eProc).

Extract ALL vendor details from the following document text and convert it into CLEAN JSON.

STRICT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations, no commentary.
- If a field is missing, use "", 0, false, or [].
- Do NOT hallucinate or infer missing data.

FIELDS (RETURN EXACTLY THIS SCHEMA):

{{
  "vendor_id": "",
  "company_name": "",
  "address": "",
  "contact_person": "",
  "email": "",
  "phone": "",
  "gst_number": "",
  "pan_number": "",
  "cin_number": "",
  "msme_status": "",
  "iso_certifications": [],

  "local_content_percentage": 0,

  "experience_years": 0,
  "past_work_summary": [],
  "annual_turnover": 0,

  "offered_item_specifications": [],
  "offered_quantity": 0,
  "offered_price": 0,

  "uploaded_documents": [],
  "declarations": {{
    "no_blacklisting": false,
    "authorized_signature_present": false,
    "manufacturer_authorization": false
  }}
}}

VENDOR DOCUMENT TEXT:
{vendor_text}
"""

    response = pro_model.generate_content(prompt)

    if not response or not response.text:
        raise ValueError("Empty response from Gemini model")

    raw = response.text.strip()

    # Remove accidental markdown
    raw = raw.replace("```json", "").replace("```", "").strip()

    # Extract JSON safely
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        raise ValueError("No valid JSON object found in model output")

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Vendor JSON parsing failed: {str(e)}\nRAW OUTPUT:\n{raw}"
        )


# ------------------------------------------------------------
# 2️⃣ PIPELINE WRAPPER — Used by vendor_pipeline
# ------------------------------------------------------------
def run_vendor_extraction_pipeline(vendor_text: str) -> Dict:
    """
    Wrapper used by vendor_pipeline.
    Raises exceptions upward (pipeline decides handling).
    """
    return extract_vendor_json_from_text(vendor_text)
