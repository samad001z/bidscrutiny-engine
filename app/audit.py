from __future__ import annotations

from uuid import uuid4
from datetime import datetime
from typing import Any

import pytz
from firebase_admin import firestore

from pydantic import BaseModel, Field

from app.core.firebase_init import init_firebase

IST = pytz.timezone("Asia/Kolkata")
audit_log_cache: list[dict[str, Any]] = []


class AuditEntry(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(IST))
    event_type: str
    tender_id: str
    performed_by: str = "system"
    details: dict[str, Any] = Field(default_factory=dict)


def log_audit_event(event_type, tender_id, details={}, performed_by="system"):
    entry = AuditEntry(
        event_type=event_type,
        tender_id=tender_id,
        details=details or {},
        performed_by=performed_by,
    )

    db, _ = init_firebase()
    if db is None:
        try:
            db = firestore.client()
        except Exception:
            db = None

    if db is not None:
        db.collection("audit_logs").document(entry.event_id).set(entry.model_dump())

    entry_dict = entry.model_dump()
    audit_log_cache.append(entry_dict)
    return entry_dict


def get_audit_logs(tender_id: str = None):
    if tender_id:
        db, _ = init_firebase()
        if db is None:
            return []

        docs = db.collection("audit_logs").where("tender_id", "==", tender_id).stream()
        logs: list[dict[str, Any]] = []
        for doc in docs:
            data = doc.to_dict() or {}
            if "event_id" not in data:
                data["event_id"] = doc.id
            logs.append(data)
        return logs

    return audit_log_cache[-100:]
