import json
import re
from typing import Dict

from app.intelligence.model_loader import pro_model


# --------------------------------------------------------
# Helper: Extract JSON safely from model output
# --------------------------------------------------------
def _extract_json(text: str) -> Dict | None:
    if not text:
        return None

    cleaned = text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


# --------------------------------------------------------
# 1️⃣ Document Integrity Agent
# --------------------------------------------------------
def fraud_document_integrity_agent(pdf_text: str) -> Dict:
    prompt = f"""
You are an AI document forensics expert.

Analyze the PDF text for:
- Placeholder text
- Template reuse
- Suspicious repetition
- Missing mandatory details
- Manipulation or tampering indicators

Return ONLY valid JSON:

{{
  "authenticity_score": 0,
  "anomalies_detected": [],
  "tampering_detected": false,
  "metadata_warnings": [],
  "final_verdict": ""
}}

PDF_CONTENT:
{pdf_text}
"""

    response = pro_model.generate_content(prompt)
    result = _extract_json(response.text if response else "")

    if not result:
        return {
            "authenticity_score": 0,
            "anomalies_detected": ["Invalid model response"],
            "tampering_detected": True,
            "metadata_warnings": [],
            "final_verdict": "SUSPICIOUS"
        }

    return result


# --------------------------------------------------------
# 2️⃣ Certificate Verification Agent
# --------------------------------------------------------
def certificate_verification_agent(vendor_json: Dict) -> Dict:
    prompt = f"""
Analyze vendor certificates for authenticity.

Check:
- GSTIN structure
- PAN format
- ISO validity
- MSME/Udyam presence
- Cross-document name consistency

Return ONLY valid JSON:

{{
  "certificates_valid": true,
  "invalid_certificates": [],
  "gst_validation": "",
  "pan_validation": "",
  "iso_validation": "",
  "mismatch_flags": [],
  "overall_certificate_score": 0
}}

VENDOR_JSON:
{json.dumps(vendor_json, indent=2)}
"""

    response = pro_model.generate_content(prompt)
    result = _extract_json(response.text if response else "")

    if not result:
        return {
            "certificates_valid": False,
            "invalid_certificates": ["Invalid model response"],
            "gst_validation": "ERROR",
            "pan_validation": "ERROR",
            "iso_validation": "ERROR",
            "mismatch_flags": ["Parsing failed"],
            "overall_certificate_score": 0
        }

    return result


# --------------------------------------------------------
# 3️⃣ Signature Authenticity Agent
# --------------------------------------------------------
def signature_validation_agent(pdf_text: str) -> Dict:
    prompt = f"""
Analyze signature authenticity in the vendor PDF text.

Look for:
- Missing signature
- Typed vs image signature
- No digital signature
- Copy-paste artifacts
- Fake seal or stamp

Return ONLY valid JSON:

{{
  "signature_present": false,
  "digital_signature_valid": false,
  "signature_anomalies": [],
  "forgery_detection_score": 0,
  "final_verdict": ""
}}

PDF_TEXT:
{pdf_text}
"""

    response = pro_model.generate_content(prompt)
    result = _extract_json(response.text if response else "")

    if not result:
        return {
            "signature_present": False,
            "digital_signature_valid": False,
            "signature_anomalies": ["Invalid model response"],
            "forgery_detection_score": 100,
            "final_verdict": "INVALID"
        }

    return result


# --------------------------------------------------------
# 4️⃣ FULL FRAUD PIPELINE (EXPORTED)
# --------------------------------------------------------
def run_fraud_pipeline(pdf_text: str, vendor_json: Dict) -> Dict:
    """
    Runs:
      - Document integrity check
      - Certificate verification
      - Signature authenticity check

    Returns weighted fraud score.
    """

    integrity = fraud_document_integrity_agent(pdf_text)
    certificates = certificate_verification_agent(vendor_json)
    signature = signature_validation_agent(pdf_text)

    # Deterministic weighted score
    final_score = round(
        (integrity.get("authenticity_score", 0) * 0.40) +
        (certificates.get("overall_certificate_score", 0) * 0.40) +
        ((100 - signature.get("forgery_detection_score", 100)) * 0.20),
        2
    )

    return {
        "integrity_report": integrity,
        "certificate_report": certificates,
        "signature_report": signature,
        "final_fraud_score": final_score
    }
