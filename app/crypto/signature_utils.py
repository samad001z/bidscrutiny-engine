from PIL import Image
import imagehash

def generate_signature_hash(image_path: str):
    """
    Generate perceptual hash (pHash) for a signature image
    """
    try:
        img = Image.open(image_path).convert("L")
        return str(imagehash.phash(img))
    except Exception:
        return None
