import json
import re
from typing import Dict

from app.intelligence.model_loader import pro_model


# --------------------------------------------------------
# Helper → Extract JSON safely
# --------------------------------------------------------
def _extract_json(text: str) -> Dict:
    if not text:
        return _fallback_reasoning()

    cleaned = text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        return _fallback_reasoning()

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return _fallback_reasoning()


def _fallback_reasoning() -> Dict:
    return {
        "reason_summary": "Model returned invalid or incomplete reasoning.",
        "vendor_strengths": [],
        "vendor_weaknesses": [],
        "risk_factors": [],
        "award_recommendation": "REJECT",
        "confidence_score": 0
    }


# --------------------------------------------------------
# 🧠 REASONING AGENT (EXPORTED)
# --------------------------------------------------------
def reasoning_agent(
    tender_json: Dict,
    vendor_json: Dict,
    compliance_report: Dict,
    fraud_report: Dict
) -> Dict:
    """
    Generates explainable reasoning for government officers.
    """

    prompt = f"""
You are an AI Government Procurement Officer.

Your task:
Provide clear, explainable reasoning on whether a vendor
should be awarded a tender, reconsidered, or rejected.

Consider:
1. Tender requirements
2. Vendor submission
3. Compliance score
4. Fraud indicators
5. Fairness and transparency

STRICT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations outside JSON.
- Do NOT hallucinate facts.
- Be neutral and legally cautious.

RETURN EXACTLY THIS FORMAT:

{{
  "reason_summary": "",
  "vendor_strengths": [],
  "vendor_weaknesses": [],
  "risk_factors": [],
  "award_recommendation": "AWARD / RETHINK / REJECT",
  "confidence_score": 0
}}

-----------------------------
TENDER JSON:
{json.dumps(tender_json, indent=2)}

-----------------------------
VENDOR JSON:
{json.dumps(vendor_json, indent=2)}

-----------------------------
COMPLIANCE REPORT:
{json.dumps(compliance_report, indent=2)}

-----------------------------
FRAUD REPORT:
{json.dumps(fraud_report, indent=2)}
"""

    response = pro_model.generate_content(prompt)

    if not response or not response.text:
        return _fallback_reasoning()

    return _extract_json(response.text)
