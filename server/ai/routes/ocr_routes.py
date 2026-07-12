# FastAPI endpoints for text reading and medicine label reading.


# TODO: Mount this in your main FastAPI app with: from routes.ocr_routes import router as ocr_router app.include_router(ocr_router, prefix="/api")


import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException

from server.ai.services.ocr_service import extract_text
from server.ai.services.medicine_service import parse_medicine_label

router = APIRouter()


async def _decode_upload(file: UploadFile) -> np.ndarray:
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image. Please upload a valid image file.")
    return image


@router.post("/ocr/text")
async def read_text(file: UploadFile = File(...)):
    """
    General-purpose text reader: books, signboards, menus, documents.
    Returns full text for the frontend to pass straight to Web Speech API.
    """
    image = await _decode_upload(file)
    result = extract_text(image, preprocess=True)

    if not result["full_text"]:
        return {
            "success": True,
            "full_text": "No readable text was found. Try moving closer or improving lighting.",
            "lines": []
        }

    return {"success": True, **result}


@router.post("/ocr/medicine")
async def read_medicine(file: UploadFile = File(...)):
    """
    Medicine label reader: extracts name, dosage, and expiry,
    and returns a spoken-friendly summary sentence.
    """
    image = await _decode_upload(file)
    ocr_result = extract_text(image, preprocess=True)

    if not ocr_result["lines"]:
        return {
            "success": True,
            "speech_text": "No text was detected on this label. Please try again with better lighting.",
            "details": None
        }

    parsed = parse_medicine_label(ocr_result["lines"])
    speech_text = _build_speech_summary(parsed)

    return {
        "success": True,
        "speech_text": speech_text,
        "details": parsed
    }


def _build_speech_summary(parsed: dict) -> str:
    """Turns parsed fields into a natural sentence for TTS, since raw JSON reads poorly aloud."""
    parts = []

    if parsed["name"]:
        parts.append(f"This appears to be {parsed['name']}.")
    else:
        parts.append("Could not confidently identify the medicine name.")

    if parsed["dosage"]:
        parts.append(f"Dosage: {parsed['dosage']}.")

    if parsed["expiry"]:
        parts.append(f"Expiry date: {parsed['expiry']}.")
    else:
        parts.append("Expiry date not found — please check manually.")

    return " ".join(parts)
