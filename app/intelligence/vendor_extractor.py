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
You are an EXPERT AI Vendor Document Parser for Indian Government Procurement (GeM / eProc).

Extract ALL vendor details from the bid document and return CLEAN, COMPLETE JSON.

CRITICAL EXTRACTION PRIORITY:
1. Company legal name and registration details
2. Contact person, email, phone (from authorized signatory)
3. GST number, PAN, CIN, MSME certificate
4. Full address with PIN code
5. ISO certifications, quality certifications
6. Years of experience and industry background
7. Past work history (at least 3 completed projects)
8. Annual turnover for last 3 years
9. Equipment and infrastructure details
10. Product/service specifications being offered
11. Quantity and quoted price
12. All attached certificates and documents
13. Declarations and undertakings

STRICT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations, no commentary.
- If a field is missing, use "", 0, false, or [].
- Do NOT hallucinate or infer missing data.
- Extract exactly what is mentioned in the document.

RETURN EXACTLY THIS SCHEMA WITH ALL FIELDS POPULATED:

{{
  "vendor_id": "Company registration number or GST",
  "company_name": "Full legal company name",
  "address": "Complete address with city, state, PIN",
  "contact_person": "Name of authorized signatory",
  "email": "Contact email address",
  "phone": "Contact phone number with country code",
  "gst_number": "Valid GST number if present",
  "pan_number": "PAN of company",
  "cin_number": "CIN if registered company",
  "msme_status": "MSME certificate status if applicable",
  "iso_certifications": ["List each ISO or quality certification"],
  "local_content_percentage": 0,
  "experience_years": 0,
  "past_work_summary": ["List each completed project with client, value, date"],
  "annual_turnover": 0,
  "offered_item_specifications": ["List each product/service specification"],
  "offered_quantity": 0,
  "offered_price": 0,
  "uploaded_documents": ["List all attached documents with page references"],
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
