import json
import re
from typing import Dict, List

from app.intelligence.model_loader import pro_model


# ----------------------------------------------------
# Fallback schema (SAFE DEFAULT)
# ----------------------------------------------------
def _empty_comparison_schema() -> Dict:
    return {
        "summary": "Comparison could not be completed.",
        "requirement_matches": [],
        "missing_documents": [],
        "technical_score": 0,
        "financial_score": 0,
        "final_score": 0,
        "pass_fail": "FAIL"
    }


# ----------------------------------------------------
# Helper → Extract JSON safely from model response
# ----------------------------------------------------
def _extract_json_from_text(text: str) -> Dict:
    if not text:
        return _empty_comparison_schema()

    cleaned = text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        return _empty_comparison_schema()

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return _empty_comparison_schema()


# ----------------------------------------------------
# Vendor vs Tender Comparison Agent
# ----------------------------------------------------
def compare_vendor_to_tender(
    tender_json: Dict,
    vendor_json: Dict
) -> Dict:
    """
    Compares vendor submission against tender requirements.

    Returns:
      - requirement matches
      - missing documents
      - technical score
      - financial score
      - final score (recomputed)
      - PASS / FAIL
    """

    prompt = f"""
You are an AI evaluator for Indian Government procurement.

STRICT EVALUATION RULES:
- Compare vendor submission ONLY against provided tender requirements.
- Do NOT assume or infer missing data.
- Identify unmet or missing requirements clearly.
- Provide fair technical and financial scores.

SCORING RULES:
- technical_score: 0–100
- financial_score: 0–100
- final_score = (0.7 * technical_score) + (0.3 * financial_score)
- final_score >= 60 → PASS else FAIL

RETURN ONLY VALID JSON IN THIS FORMAT:

{{
  "summary": "",
  "requirement_matches": [
    {{
      "requirement": "",
      "match": false,
      "explanation": ""
    }}
  ],
  "missing_documents": [],
  "technical_score": 0,
  "financial_score": 0,
  "final_score": 0,
  "pass_fail": ""
}}

------------------------------
TENDER REQUIREMENTS
------------------------------
{json.dumps(tender_json, indent=2)}

------------------------------
VENDOR SUBMISSION
------------------------------
{json.dumps(vendor_json, indent=2)}
"""

    # ------------------------------------------
    # Call Gemini 2.5 Pro
    # ------------------------------------------
    response = pro_model.generate_content(prompt)

    if not response or not response.text:
        return _empty_comparison_schema()

    result = _extract_json_from_text(response.text)

    # ------------------------------------------
    # Recompute scores (DO NOT TRUST AI FULLY)
    # ------------------------------------------
    try:
        tech = float(result.get("technical_score", 0))
        fin = float(result.get("financial_score", 0))

        tech = min(max(tech, 0), 100)
        fin = min(max(fin, 0), 100)

        final = round((tech * 0.7) + (fin * 0.3), 2)

        result["technical_score"] = tech
        result["financial_score"] = fin
        result["final_score"] = final
        result["pass_fail"] = "PASS" if final >= 60 else "FAIL"

    except Exception:
        return _empty_comparison_schema()

    return result
