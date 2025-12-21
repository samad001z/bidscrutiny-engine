import hashlib

def normalize_text(text: str) -> str:
    """
    Normalize text before hashing to avoid minor formatting differences
    """
    return " ".join(text.lower().split())

def generate_sha256_hash(text: str) -> str:
    """
    Generate SHA-256 hash of normalized text
    """
    normalized = normalize_text(text)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
