import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.core.config import (
    FIREBASE_SERVICE_ACCOUNT_PATH,
    FIREBASE_STORAGE_BUCKET
)


# Internal singletons
_db = None
_bucket = None


def init_firebase():
    """
    Initialize Firebase Admin SDK (Firestore + Storage).
    Supports both local file and Railway base64 encoded credentials.
    Safe for FastAPI reloads (no double init).
    """

    global _db, _bucket

    if not firebase_admin._apps:
        # Check if running on Railway with base64 encoded credentials
        firebase_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64")
        
        if firebase_base64:
            # Production: Decode base64 credentials from Railway
            try:
                cred_json = base64.b64decode(firebase_base64).decode('utf-8')
                cred_dict = json.loads(cred_json)
                cred = credentials.Certificate(cred_dict)
                print("✓ Using Railway base64 encoded Firebase credentials")
            except Exception as e:
                raise RuntimeError(f"Failed to decode Firebase credentials: {str(e)}")
        else:
            # Development: Use local file
            if not FIREBASE_SERVICE_ACCOUNT_PATH:
                raise RuntimeError(
                    "FIREBASE_SERVICE_ACCOUNT_PATH not set in .env"
                )
            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
            print(f"✓ Using local Firebase credentials: {FIREBASE_SERVICE_ACCOUNT_PATH}")

        if not FIREBASE_STORAGE_BUCKET:
            raise RuntimeError(
                "FIREBASE_STORAGE_BUCKET not set in .env"
            )

        firebase_admin.initialize_app(cred, {
            "storageBucket": FIREBASE_STORAGE_BUCKET
        })

    # Initialize Firestore client once
    if _db is None:
        _db = firestore.client()

    # Initialize Storage bucket once
    if _bucket is None:
        _bucket = storage.bucket()

    return _db, _bucket
