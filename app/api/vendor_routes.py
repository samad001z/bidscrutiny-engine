from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os

router = APIRouter(prefix="/vendor", tags=["Vendor"])


@router.post("/upload")
async def upload_vendor(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    if file.size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    return {
        "message": "Vendor document uploaded successfully",
        "filename": file.filename,
        "temp_path": temp_path
    }
