from typing import Dict, Optional

from app.intelligence.fraud_agents import run_fraud_pipeline
from app.intelligence.comparison_agent import compare_vendor_to_tender
from app.intelligence.vendor_extractor import run_vendor_extraction_pipeline
from app.intelligence.reasoning_agent import reasoning_agent
from app.storage.vendor_storage import save_vendor_result


def run_vendor_pipeline(
    vendor_text: str,
    vendor_json: Dict,
    tender_json: Dict,
    vendor_pdf_bytes: Optional[bytes] = None,
    vendor_filename: Optional[str] = None
) -> Dict:
    """
    Full vendor evaluation pipeline.

    RULE (Govt-grade):
    ❌ If compliance FAIL → overall FAIL (NO EXCEPTIONS)
    """

    # --------------------------------------------------------
    # 1️⃣ Vendor JSON Extraction (AI)
    # --------------------------------------------------------
    try:
        extracted = run_vendor_extraction_pipeline(vendor_text)
        if isinstance(extracted, dict) and "error" not in extracted:
            vendor_json = extracted
    except Exception:
        pass  # fallback to provided vendor_json

    # --------------------------------------------------------
    # 2️⃣ Fraud Detection
    # --------------------------------------------------------
    try:
        fraud_report = run_fraud_pipeline(vendor_text, vendor_json)
    except Exception:
        fraud_report = {
            "integrity_report": {},
            "certificate_report": {},
            "signature_report": {},
            "final_fraud_score": 0
        }

    # --------------------------------------------------------
    # 3️⃣ Tender Compliance Evaluation (MANDATORY GATE)
    # --------------------------------------------------------
    try:
        compliance_report = compare_vendor_to_tender(
            tender_json=tender_json,
            vendor_json=vendor_json
        )
    except Exception:
        compliance_report = {
            "summary": "",
            "requirement_matches": [],
            "missing_documents": [],
            "technical_score": 0,
            "financial_score": 0,
            "final_score": 0,
            "pass_fail": "FAIL"
        }

    # --------------------------------------------------------
    # 4️⃣ Final Score Calculation (Deterministic)
    # --------------------------------------------------------
    try:
        compliance_score = float(compliance_report.get("final_score", 0))
    except Exception:
        compliance_score = 0.0

    try:
        fraud_score = float(fraud_report.get("final_fraud_score", 0))
    except Exception:
        fraud_score = 0.0

    # Weighted score (for ranking only)
    final_score = round((compliance_score * 0.75) + (fraud_score * 0.25), 2)

    # 🔴 CRITICAL GOVERNMENT RULE
    if compliance_report.get("pass_fail") != "PASS":
        final_pass_fail = "FAIL"
    else:
        final_pass_fail = "PASS" if final_score >= 60 else "FAIL"

    # --------------------------------------------------------
    # 5️⃣ Reasoning Agent
    # --------------------------------------------------------
    try:
        reasoning_report = reasoning_agent(
            tender_json=tender_json,
            vendor_json=vendor_json,
            compliance_report=compliance_report,
            fraud_report=fraud_report
        )
    except Exception:
        reasoning_report = {
            "reason_summary": "Reasoning agent failed.",
            "vendor_strengths": [],
            "vendor_weaknesses": [],
            "risk_factors": [],
            "award_recommendation": "REJECT",
            "confidence_score": 0
        }

    # --------------------------------------------------------
    # 6️⃣ Save to Firebase (if tender_id exists)
    # --------------------------------------------------------
    tender_id = (
        tender_json.get("tender_id", "")
        .replace("/", "_")
        .replace(" ", "_")
    )

    vendor_id = None

    if tender_id:
        try:
            vendor_id = save_vendor_result(
                tender_id=tender_id,
                vendor_json=vendor_json,
                fraud_report=fraud_report,
                compliance_report=compliance_report,
                reasoning_report=reasoning_report,
                final_score=final_score,
                pass_fail=final_pass_fail,
                vendor_pdf_bytes=vendor_pdf_bytes,
                vendor_filename=vendor_filename
            )
        except Exception:
            vendor_id = None

    # --------------------------------------------------------
    # 7️⃣ Final Response
    # --------------------------------------------------------
    return {
        "vendor_id": vendor_id,
        "fraud_report": fraud_report,
        "compliance_report": compliance_report,
        "reasoning_report": reasoning_report,
        "final_score": final_score,
        "pass_fail": final_pass_fail
    }
