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
            if not FIREBASE_SERVICE_ACCOUNT_PATH or not os.path.exists(FIREBASE_SERVICE_ACCOUNT_PATH):
                print(f"⚠️ Firebase service account not found at: {FIREBASE_SERVICE_ACCOUNT_PATH}")
                print("⚠️ Firebase will not be initialized. Set FIREBASE_SERVICE_ACCOUNT_BASE64 for production.")
                return None, None
            
            try:
                cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
                print(f"✓ Using local Firebase credentials: {FIREBASE_SERVICE_ACCOUNT_PATH}")
            except Exception as e:
                print(f"⚠️ Failed to load Firebase credentials: {str(e)}")
                return None, None

        # Initialize Firebase app with storage bucket if available
        firebase_config = {}
        if FIREBASE_STORAGE_BUCKET:
            firebase_config["storageBucket"] = FIREBASE_STORAGE_BUCKET
            print(f"✓ Storage bucket configured: {FIREBASE_STORAGE_BUCKET}")
        else:
            print("⚠️ FIREBASE_STORAGE_BUCKET not set. Storage will not be available.")

        try:
            firebase_admin.initialize_app(cred, firebase_config)
        except ValueError:
            # App already initialized
            pass
        except Exception as e:
            print(f"⚠️ Failed to initialize Firebase app: {str(e)}")
            return None, None

    # Initialize Firestore client once
    if _db is None:
        try:
            _db = firestore.client()
        except Exception as e:
            print(f"⚠️ Failed to initialize Firestore: {str(e)}")
            return None, None

    # Initialize Storage bucket once (optional, won't fail if not available)
    if _bucket is None and FIREBASE_STORAGE_BUCKET:
        try:
            _bucket = storage.bucket()
        except Exception as e:
            print(f"⚠️ Failed to initialize Storage: {str(e)}")
            # Don't fail - Firestore might still work

    return _db, _bucket
