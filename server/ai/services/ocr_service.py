# Handles image preprocessing and text extraction using PaddleOCR.


import cv2
import numpy as np
from paddleocr import PaddleOCR

_ocr_engine = PaddleOCR(use_angle_cls=True, lang="en", enable_mkldnn=False)


def preprocess_image(image: np.ndarray) -> np.ndarray:

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    denoised = cv2.fastNlMeansDenoising(gray, h=10)

    thresh = cv2.adaptiveThreshold(
        denoised, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31,
        C=10
    )

    deskewed = _deskew(thresh)

    return cv2.cvtColor(deskewed, cv2.COLOR_GRAY2BGR)


def _deskew(img: np.ndarray) -> np.ndarray:
    """Estimates and corrects small rotation angles using minAreaRect on text pixels."""
    coords = np.column_stack(np.where(img > 0))
    if coords.shape[0] < 20:
        # Not enough foreground pixels to reliably estimate a skew angle
        return img

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    # Ignore negligible skew — avoids introducing artifacts on already-straight images
    if abs(angle) < 0.5:
        return img

    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def extract_text(image: np.ndarray, preprocess: bool = True) -> dict:
    """
    Runs OCR on an image and returns structured text results.

    Args:
        image: BGR image as a numpy array (e.g. from cv2.imread or decoded webcam frame)
        preprocess: whether to run the cleanup pipeline first (recommended for
                    labels/signboards, can be skipped for already-clean scanned docs)

    Returns:
        {
            "full_text": "concatenated text, reading order, space-joined",
            "lines": [
                {"text": str, "confidence": float, "box": [[x,y], ...]}
            ]
        }
    """
    processed = preprocess_image(image) if preprocess else image

    result = _ocr_engine.predict(processed)

    lines = []
    full_text_parts = []

    # PaddleOCR result shape: [[ [box, (text, confidence)], ... ]]
    if result:
        for res in result:
            texts = res.get("rec_texts", [])
            scores = res.get("rec_scores", [])
            polys = res.get("rec_polys", [])
            for i, text in enumerate(texts):
                confidence = float(scores[i]) if i < len(scores) else 0.0
                box = polys[i].tolist() if i < len(polys) else []
                lines.append({
                    "text": text,
                    "confidence": round(confidence, 3),
                    "box": box
                })
                full_text_parts.append(text)

    return {
        "full_text": " ".join(full_text_parts).strip(),
        "lines": lines
    }


def read_text(image_path: str) -> dict:
    """
    Path-based entry point matching the team convention used by
    detect_objects(image_path) / detect_currency(image_path).

    Returns:
        {
            "success": bool,
            "text": str,           # consumed directly by ReadText.jsx as data.text
            "spoken_text": str,    # consistent field name across all AI services
            "lines": [...]
        }
    """
    image = cv2.imread(image_path)
    if image is None:
        return {
            "success": False,
            "text": "Could not read the captured image. Please try again.",
            "spoken_text": "Could not read the captured image. Please try again.",
            "lines": []
        }

    result = extract_text(image, preprocess=True)

    if not result["full_text"]:
        message = "No readable text was found. Try moving closer or improving lighting."
        return {"success": True, "text": message, "spoken_text": message, "lines": []}

    return {
        "success": True,
        "text": result["full_text"],
        "spoken_text": result["full_text"],
        "lines": result["lines"]
    }
