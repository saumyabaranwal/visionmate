#Parses raw OCR text from a medicine box/strip into structured fields: name, dosage, and expiry date.


import re
from datetime import datetime

from ai.services.ocr_service import extract_text
import cv2


# Common dosage units seen on Indian medicine packaging
DOSAGE_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s?(mg|mcg|ml|g|iu)\b",
    re.IGNORECASE
)

# Expiry is often labeled "EXP", "Exp Date", "Expiry", followed by a date
EXPIRY_LABEL_PATTERN = re.compile(
    r"(?:EXP|EXPIRY|EXP\.?\s?DATE)[:\s]*([0-9]{1,2}[\/\-.][0-9]{2,4}|[0-9]{2,4}[\/\-.][0-9]{1,2})",
    re.IGNORECASE
)

# Fallback: bare MM/YYYY or MM-YYYY pattern anywhere in the text
DATE_FALLBACK_PATTERN = re.compile(
    r"\b(0[1-9]|1[0-2])[\/\-.](\d{2,4})\b"
)

# Words that show up near the drug name but aren't part of it
NOISE_WORDS = {
    "tablets", "tablet", "capsules", "capsule", "syrup", "injection",
    "mfg", "batch", "no", "b.no", "exp", "mrp", "rs", "storage",
    "keep", "away", "children", "reg", "no.",
}


def parse_medicine_label(ocr_lines: list[dict]) -> dict:
    """
    Args:
        ocr_lines: the "lines" list returned by ocr_service.extract_text()

    Returns:
        {
            "name": str | None,
            "dosage": str | None,
            "expiry": str | None,
            "raw_text": str
        }
    """
    texts = [line["text"] for line in ocr_lines]
    raw_text = " ".join(texts)

    return {
        "name": _guess_name(texts),
        "dosage": _find_dosage(raw_text),
        "expiry": _find_expiry(raw_text),
        "raw_text": raw_text,
    }


def _guess_name(texts: list[str]) -> str | None:
    """
    Heuristic: the medicine name is usually the longest all-caps or
    title-case line near the top of the label, and isn't a noise word
    or a pure number/date.
    """
    candidates = []
    for text in texts:
        cleaned = text.strip()
        if not cleaned or cleaned.lower() in NOISE_WORDS:
            continue
        if re.fullmatch(r"[\d\s\/\-.]+", cleaned):
            continue  # skip pure numbers/dates
        if DOSAGE_PATTERN.fullmatch(cleaned):
            continue
        candidates.append(cleaned)

    if not candidates:
        return None

    # Prefer the longest candidate that appears early in the text (top of label)
    return max(candidates[:5] if len(candidates) >= 5 else candidates, key=len)


def _find_dosage(text: str) -> str | None:
    match = DOSAGE_PATTERN.search(text)
    if match:
        return f"{match.group(1)}{match.group(2).lower()}"
    return None


def _find_expiry(text: str) -> str | None:
    match = EXPIRY_LABEL_PATTERN.search(text)
    if not match:
        match = DATE_FALLBACK_PATTERN.search(text)
    if not match:
        return None

    raw_date = match.group(1) if match.lastindex else match.group(0)
    return _normalize_date(raw_date)


def _normalize_date(raw: str) -> str:
    """Best-effort normalization to MM/YYYY for consistent voice output."""
    raw = raw.replace(".", "/").replace("-", "/")
    parts = raw.split("/")

    if len(parts) == 2:
        month, year = parts
        if len(year) == 2:
            year = "20" + year
        try:
            month = f"{int(month):02d}"
            return f"{month}/{year}"
        except ValueError:
            return raw


def read_medicine(image_path: str) -> dict:
    """
    Path-based entry point matching the team convention used by
    detect_objects(image_path) / detect_currency(image_path).

    Returns:
        {
            "success": bool,
            "name": str | None,
            "dosage": str | None,
            "expiry": str | None,
            "spoken_text": str
        }
    """
    image = cv2.imread(image_path)
    if image is None:
        message = "Could not read the captured image. Please try again."
        return {"success": False, "name": None, "dosage": None, "expiry": None, "spoken_text": message}

    ocr_result = extract_text(image, preprocess=True)

    if not ocr_result["lines"]:
        message = "No text was detected on this label. Please try again with better lighting."
        return {"success": True, "name": None, "dosage": None, "expiry": None, "spoken_text": message}

    parsed = parse_medicine_label(ocr_result["lines"])
    spoken_text = _build_speech_summary(parsed)

    return {
        "success": True,
        "name": parsed["name"],
        "dosage": parsed["dosage"],
        "expiry": parsed["expiry"],
        "spoken_text": spoken_text
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
    return raw
