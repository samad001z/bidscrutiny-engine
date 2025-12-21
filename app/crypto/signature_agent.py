from .signature_utils import generate_signature_hash

def analyze_signatures(signature_images: list):
    """
    Compare signatures across documents
    """
    hashes = []
    for img in signature_images:
        h = generate_signature_hash(img)
        if h:
            hashes.append(h)

    if not hashes:
        return {
            "status": "missing",
            "reason": "No signatures detected in submitted documents",
            "confidence": 0.9
        }

    unique_hashes = set(hashes)

    if len(unique_hashes) > 1:
        return {
            "status": "suspicious",
            "reason": "Signatures differ across submitted documents",
            "confidence": 0.85
        }

    return {
        "status": "valid",
        "reason": "Consistent signature detected across documents",
        "confidence": 0.95
    }
