import re
import datetime
from typing import Optional

from app.core.firebase_init import init_firebase

# -----------------------------------------------------
# Firebase singletons
# -----------------------------------------------------
db, bucket = init_firebase()


# -----------------------------------------------------
# SANITIZE VENDOR NAME → Create clean vendor_id
# -----------------------------------------------------
def _sanitize_name_for_id(name: str) -> str:
    if not name:
        return "vendor"

    sanitized = re.sub(r"[^A-Za-z0-9]+", "_", name).strip("_")
    return sanitized[:50]


def make_vendor_id(name: str) -> str:
    ts = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"{_sanitize_name_for_id(name)}_{ts}"


# -----------------------------------------------------
# SAVE VENDOR RESULT TO FIRESTORE + STORAGE
# -----------------------------------------------------
def save_vendor_result(
    tender_id: str,
    vendor_json: dict,
    fraud_report: dict,
    compliance_report: dict,
    reasoning_report: dict,
    final_score: float,
    pass_fail: str,
    vendor_pdf_bytes: Optional[bytes] = None,
    vendor_filename: Optional[str] = None
) -> str:
    """
    Saves vendor evaluation result.

    Firestore path:
        tenders/{tender_id}/vendors/{vendor_id}

    Storage path (optional):
        vendors/{tender_id}/{vendor_id}/{vendor_filename}

    Returns:
        vendor_id (str)
    """

    # -----------------------------
    # Resolve vendor name safely
    # -----------------------------
    vendor_name = (
        vendor_json.get("company_name")
        or vendor_json.get("vendor_name")
        or vendor_json.get("name")
        or "vendor"
    )

    # Generate vendor ID FIRST (never dependent on storage)
    vendor_id = make_vendor_id(vendor_name)

    # -----------------------------
    # Build Firestore document
    # -----------------------------
    doc = {
        "vendor_id": vendor_id,
        "tender_id": tender_id,
        "vendor_name": vendor_name,
        "vendor_json": vendor_json,

        "fraud_report": fraud_report,
        "compliance_report": compliance_report,
        "reasoning_report": reasoning_report,

        "final_score": final_score,
        "pass_fail": pass_fail,

        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }

    # -----------------------------
    # Save to Firestore (PRIMARY)
    # -----------------------------
    doc_ref = (
        db.collection("tenders")
        .document(tender_id)
        .collection("vendors")
        .document(vendor_id)
    )

    doc_ref.set(doc)

    # -----------------------------
    # Upload vendor PDF (OPTIONAL)
    # -----------------------------
    if vendor_pdf_bytes and vendor_filename:
        try:
            blob_path = f"vendors/{tender_id}/{vendor_id}/{vendor_filename}"
            blob = bucket.blob(blob_path)

            blob.upload_from_string(
                vendor_pdf_bytes,
                content_type="application/pdf"
            )

            doc_ref.update({
                "pdf_path": blob_path
            })

        except Exception as e:
            # IMPORTANT: never block vendor_id creation
            print("⚠️ Vendor PDF upload failed:", e)

    # -----------------------------
    # ALWAYS return vendor_id
    # -----------------------------
    return vendor_id
