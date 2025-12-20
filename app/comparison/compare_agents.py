import json
import re
from datetime import datetime
from typing import Dict, List

from app.core.firebase_init import init_firebase
from app.intelligence.model_loader import pro_model


# ------------------------------------------------------------
# Firebase singletons
# ------------------------------------------------------------
db, bucket = init_firebase()


# ------------------------------------------------------------
# 1️⃣ FINAL SCORE CALCULATOR
# ------------------------------------------------------------
def compute_final_score(vendor: Dict) -> float:
    """
    75% compliance + 25% fraud (deterministic)
    """
    try:
        compliance = float(
            vendor.get("compliance_report", {}).get("final_score", 0)
        )
        fraud = float(
            vendor.get("fraud_report", {}).get("final_fraud_score", 0)
        )
        return round((compliance * 0.75) + (fraud * 0.25), 2)
    except Exception:
        return 0.0


# ------------------------------------------------------------
# 2️⃣ AI PROMPT BUILDER (TOP-VENDOR REASONING)
# ------------------------------------------------------------
def build_reasoning_prompt(
    tender: Dict,
    ranked_vendors: List[Dict]
) -> str:

    short_tender = {
        "tender_id": tender.get("tender_id", ""),
        "title": tender.get("title", ""),
        "key_requirements": tender.get("eligibility_criteria", [])[:6]
    }

    vendor_summary = []
    for v in ranked_vendors:
        vendor_summary.append({
            "vendor_id": v.get("vendor_id"),
            "score": v.get("score"),
            "pass_fail": v.get("pass_fail", "UNKNOWN"),
            "missing_documents": v.get(
                "compliance_report", {}
            ).get("missing_documents", [])[:3],
            "fraud_risks": v.get(
                "fraud_report", {}
            ).get("integrity_report", {}).get("anomalies_detected", [])[:2]
        })

    return f"""
You are a Government Tender Evaluation Specialist.

Based on the tender and ranked vendors,
produce a final award recommendation following
Indian government procurement norms.

STRICT RULES:
- Return ONLY valid JSON.
- No markdown, no explanations.
- Be neutral, transparent, and auditable.

RETURN FORMAT:

{{
  "award_recommendation": "",
  "justification": "",
  "ranked_summary": [],
  "confidence": 0
}}

TENDER:
{json.dumps(short_tender, ensure_ascii=False)}

VENDORS:
{json.dumps(vendor_summary, ensure_ascii=False)}
"""


# ------------------------------------------------------------
# Helper → Safe JSON extraction
# ------------------------------------------------------------
def _extract_json(text: str) -> Dict:
    if not text:
        return {}

    cleaned = text.replace("```json", "").replace("```", "").strip()
    match = re.search(r"\{[\s\S]*\}", cleaned)

    if not match:
        return {}

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return {}


# ------------------------------------------------------------
# 3️⃣ COMPARE ALL VENDORS FOR ONE TENDER
# ------------------------------------------------------------
def compare_single_tender(tender_id: str) -> Dict:

    tender_doc = db.collection("tenders").document(tender_id).get()
    if not tender_doc.exists:
        return {"error": f"Tender '{tender_id}' not found"}

    tender = tender_doc.to_dict()

    vendor_stream = (
        db.collection("tenders")
        .document(tender_id)
        .collection("vendors")
        .stream()
    )

    vendors = []
    for doc in vendor_stream:
        v = doc.to_dict()
        v["vendor_id"] = v.get("vendor_id", doc.id)
        v["score"] = compute_final_score(v)
        vendors.append(v)

    if not vendors:
        return {
            "tender_id": tender_id,
            "vendor_count": 0,
            "rankings": [],
            "reasoning": {},
            "generated_at": datetime.utcnow().isoformat()
        }

    ranked = sorted(vendors, key=lambda x: x["score"], reverse=True)

    rankings = []
    for idx, v in enumerate(ranked, start=1):
        rankings.append({
            "rank": idx,
            "vendor_id": v["vendor_id"],
            "score": v["score"],
            "pass_fail": v.get("pass_fail", ""),
            "technical": v.get("compliance_report", {}).get("technical_score", 0),
            "financial": v.get("compliance_report", {}).get("financial_score", 0),
            "fraud": v.get("fraud_report", {}).get("final_fraud_score", 0)
        })

    # ------------------------------------------------------------
    # AI FINAL REASONING (TOP 5 ONLY)
    # ------------------------------------------------------------
    prompt = build_reasoning_prompt(tender, ranked[:5])

    try:
        response = pro_model.generate_content(prompt)
        reasoning = _extract_json(response.text if response else "")
    except Exception:
        reasoning = {}

    report = {
        "tender_id": tender_id,
        "vendor_count": len(vendors),
        "rankings": rankings,
        "reasoning": reasoning,
        "generated_at": datetime.utcnow().isoformat()
    }

    # Save comparison snapshot
    db.collection("tenders").document(tender_id).collection(
        "comparisons"
    ).document(
        datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    ).set(report)

    return report


# ------------------------------------------------------------
# 4️⃣ COMPARE ALL TENDERS
# ------------------------------------------------------------
def compare_all_tenders() -> Dict:

    tender_docs = db.collection("tenders").stream()
    results = []

    for td in tender_docs:
        results.append(compare_single_tender(td.id))

    return {
        "tender_count": len(results),
        "tenders": results
    }
