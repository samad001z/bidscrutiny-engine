import json
import re
from typing import Dict

from app.intelligence.model_loader import pro_model


# ------------------------------------------------------
# Fallback schema (NO hallucination)
# ------------------------------------------------------
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
# Helper: extract JSON safely
# ------------------------------------------------------
def _extract_json_from_text(text: str) -> Dict:
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


# ------------------------------------------------------
# CORE AI EXTRACTOR — Tender Text → JSON
# ------------------------------------------------------
def extract_tender_json_from_text(tender_text: str) -> Dict:
    """
    Converts tender OCR text into structured tender JSON.
    Uses Gemini 2.5 Pro.
    """

    prompt = f"""
You are an AI Tender Document Parser for Indian Government Procurement
(GeM / eProc / State & Central tenders).

STRICT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations, no commentary.
- Do NOT hallucinate missing data.
- If information is missing, return "", 0, or [].

RETURN EXACTLY THIS SCHEMA:

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
{tender_text}
"""

    response = pro_model.generate_content(prompt)

    if not response or not response.text:
        return _empty_tender_schema()

    return _extract_json_from_text(response.text)


# ------------------------------------------------------
# PIPELINE WRAPPER (used by tender_pipeline)
# ------------------------------------------------------
def run_tender_extraction_pipeline(tender_text: str) -> Dict:
    """
    Wrapper used by tender_pipeline.
    """
    return extract_tender_json_from_text(tender_text)
