import os
import tempfile
from pdf2image import convert_from_path
import pytesseract


# -------------------------------------------------
# Poppler path (Windows only)
# -------------------------------------------------
POPPLER_PATH = (
    r"C:\poppler-25.12.0\Library\bin"
    if os.name == "nt"
    else None
)


# -------------------------------------------------
# OCR ENGINE (PDF → TEXT with PAGE NUMBERS)
# -------------------------------------------------
def extract_text_from_pdf(pdf_path: str) -> str:
    """
    OCR-only PDF text extraction with page numbers.

    Input:
        pdf_path (str): Absolute or relative path to PDF file

    Output:
        Clean extracted text with page markers
    """

    # ---------------------------
    # Validation
    # ---------------------------
    if not isinstance(pdf_path, str):
        raise TypeError("extract_text_from_pdf expects a file path (str)")

    pdf_path = os.path.abspath(pdf_path)

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    extracted_pages = []

    # ---------------------------
    # Convert PDF → Images → OCR
    # ---------------------------
    with tempfile.TemporaryDirectory() as temp_dir:
        images = convert_from_path(
            pdf_path,
            dpi=300,
            poppler_path=POPPLER_PATH,
            output_folder=temp_dir
        )

        for idx, img in enumerate(images, start=1):
            try:
                raw_text = pytesseract.image_to_string(img)
            except Exception:
                raw_text = ""

            cleaned = clean_text(raw_text)

            if cleaned:
                extracted_pages.append(
                    f"\n--- PAGE {idx} ---\n{cleaned}"
                )

    # ---------------------------
    # Final Output
    # ---------------------------
    return "\n".join(extracted_pages)


# -------------------------------------------------
# Text Normalizer (OCR cleanup)
# -------------------------------------------------
def clean_text(text: str) -> str:
    """
    Normalize OCR output for AI processing.
    """
    if not text:
        return ""

    text = text.replace("\t", " ")
    text = text.replace("\r", "\n")

    lines = [line.strip() for line in text.split("\n")]
    lines = [line for line in lines if line]

    return "\n".join(lines)
