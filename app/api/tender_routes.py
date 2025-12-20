from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os

router = APIRouter(prefix="/tender", tags=["Tender"])


@router.post("/upload")
async def upload_tender(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    if file.size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    return {
        "message": "Tender uploaded successfully",
        "filename": file.filename,
        "temp_path": temp_path
    }
