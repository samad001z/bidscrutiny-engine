import google.generativeai as genai
from app.core.config import GEMINI_API_KEY


# -------------------------------------------------
# Configure Gemini (ONCE)
# -------------------------------------------------
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY not set. Add it to .env file."
    )

genai.configure(api_key=GEMINI_API_KEY)

# -------------------------------------------------
# Load Models
# -------------------------------------------------

# Main model: extraction, comparison, classification
pro_model = genai.GenerativeModel("gemini-2.5-pro")

# Reasoning model: explanations only
try:
    reasoning_model = genai.GenerativeModel("gemini-3")
except Exception:
    # Fallback if Gemini 3 not available
    reasoning_model = pro_model
