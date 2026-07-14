# VisionMate — Technical Architecture

This document describes the technical architecture of VisionMate across all three layers: frontend, backend, and AI/computer vision. For the project pitch, features, and setup instructions, see [README.md](./README.md).

---

## System Overview

```
┌─────────────────┐      HTTP (image upload)      ┌──────────────────┐
│   React Frontend │ ─────────────────────────────▶│  FastAPI Backend │
│   (client/)      │◀───────────────────────────── │  (server/)       │
└─────────────────┘         JSON response          └──────────────────┘
       │                                                     │
       │ Camera capture (MediaDevices API)                  │ calls
       │ Text-to-Speech (Web Speech API)                     ▼
       │                                            ┌──────────────────┐
       └─ Voice/touch navigation                    │   AI Services     │
                                                      │   (ai/)           │
                                                      │  - object_detector│
                                                      │  - currency_detector│
                                                      │  - (OCR, medicine) │
                                                      └──────────────────┘
```

All AI inference runs **locally** via ONNX Runtime — no cloud inference APIs are called for the core object detection or currency recognition features, supporting the project's on-device, privacy-preserving design goal.

---

## 1. Frontend Architecture (`client/`)
# Project Structure
```
visionmate
│
├── ai/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│
└── README.md
```

- **Framework:** React + Vite
- **Routing:** React Router DOM (page-based navigation between features: Read Text, Object Detection, Currency Detection, Surroundings)
- **Camera access:** Browser `MediaDevices.getUserMedia` API, configured to prefer the device's back camera (`facingMode: "environment"`) for real-world scanning use cases
- **Voice interaction:** Web Speech API for speech recognition (voice commands) and Speech Synthesis API for reading results aloud
- **Component structure:** Modular components (`CameraView`, `FeatureCard`, `Navbar`, `Footer`, `UploadCard`) shared across feature pages (`ObjectDetection`, `CurrencyDetection`, `ReadText`, `Surroundings`)
- **Design priority:** Since the primary users are visually impaired, the UI is a secondary interface — voice output (via each backend response's `spoken_text` field) is the primary channel, not visual display.


---

## 2. Backend Architecture (`server/`)
## 📂 Server Structure

```text
server/
│
├── main.py                      # Backend entry point
├── uploads/                     # Uploaded images
│
├── ai/
│   │
│   ├── main.py                  # AI service entry point
│   ├── requirements.txt         # Python dependencies
│   ├── yolo11n.onnx             # YOLO object detection model
│   │
│   ├── models/
│   │   ├── currency_classifier.onnx
│   │   ├── class_names.json
│   │   ├── download_model.py
│   │   └── test_currency.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── scan_routes.py
│   │   └── ocr_routes.py
│   │
│   └── services/
│       ├── object_detector.py
│       ├── currency_detector.py
│       ├── medicine_service.py
│       └── ocr_service.py
```

- **Framework:** FastAPI (Python)
- **Role:** Acts as the integration layer between the frontend and the AI services — receives image uploads from the frontend, saves them temporarily, calls into the appropriate AI service function, and returns a structured JSON response.
- **CORS:** Configured to accept requests from the Vite dev server origin (`http://localhost:5173`)
- **Endpoints (per feature module):**
  - `/object-detection` → calls `detect_objects()`
  - `/currency-detection` → calls `detect_currency()`
  - `/read-text` → OCR pipeline (Moulik's module)
  - `/surroundings` → scene description (future/in-progress)
- **File handling:** Uploaded images are temporarily saved to an `uploads/` directory before being passed to the relevant AI function by file path.

*(Ammar: expand this section with request/response flow details, error handling approach, and any middleware or validation logic.)*

---

## 3. AI / Computer Vision Architecture (`ai/`)


### 3.1 Object Detection

- **Model:** YOLO11 (Ultralytics), pretrained on COCO (80 general object categories)
- **Optimization:** Exported to **ONNX** format for fast, lightweight local inference (`yolo11n.onnx` / `yolo11s.onnx` depending on the accuracy/speed tradeoff chosen)
- **Inference:** Ultralytics' `YOLO()` class loads the `.onnx` file directly and internally handles preprocessing, NMS, and box decoding
- **Output:** List of detected objects (label + confidence), plus a `spoken_text` field summarizing the top 1-2 most confident detections into a natural sentence for voice output
- **Known limitation:** Detection is limited to COCO's 80 categories; objects outside this set, or visually similar small/thin objects (e.g. knives vs. toothbrushes), can be misclassified. This is a known limitation of general-purpose pretrained detectors without task-specific fine-tuning.

### 3.2 Currency Recognition

- **Model:** MobileNetV2 (transfer learning) — pretrained feature extractor frozen, only the final classification head trained
- **Dataset:** Merged from two Roboflow Universe sources (~21,000 images total) plus custom real-world photos taken specifically to close a generalization gap discovered during testing (see below)
- **Class imbalance handling:** Weighted cross-entropy loss, since denominations like ₹200 and ₹2000 had far fewer available training images than common denominations
- **Key engineering finding:** A model trained purely on public dataset images achieved ~98% validation accuracy but performed poorly on real camera photos — a classic **domain shift** problem (training data style didn't match real-world deployment conditions). This was root-caused via systematic isolation testing (same image tested across PyTorch/Colab, ONNX/Colab, and ONNX/local) before being fixed by retraining on a small set of real-world photos matching actual deployment conditions.
- **Optimization:** Exported to ONNX; inference uses `onnxruntime` directly (manual preprocessing: resize to 224×224, ImageNet normalization, softmax over model output)
- **Output:** Predicted denomination + confidence + a `spoken_text` field (with a fallback message for low-confidence predictions, prompting the user to retry with better lighting/framing)

### 3.3 Shared AI Design Principles

- All models run via **ONNX Runtime**, chosen for framework-independent, CPU-friendly local inference
- Every service exposes a single simple function (`detect_objects(image_path)`, `detect_currency(image_path)`) so the backend can call them without needing to know model internals
- Every response includes a pre-formatted `spoken_text` field, shifting natural-language formatting responsibility to the AI layer rather than the frontend

---

## 4. OCR & Accessibility (`ai/services/ocr_service.py`, `medicine_service.py`)

- **Role:** Extracts printed text from images (signboards, documents, labels) and specifically parses medicine packaging for name, dosage, and expiry information, converting both into clean, speech-ready output.

### 4.1 Text Extraction (OCR)

- **Model:** PaddleOCR (PP-OCRv6 pipeline, via PaddleX), with document orientation classification and text-line angle correction enabled — handles signboards/labels photographed at a slight tilt rather than only perfectly flat documents.
- **Preprocessing:** Each frame is cleaned before OCR to improve accuracy on small/blurry/glossy text — grayscale conversion, denoising (`fastNlMeansDenoising`), adaptive thresholding (handles uneven lighting across a label), and deskewing (corrects camera-angle tilt via `minAreaRect` on foreground text pixels).
- **Language:** English only for now (`lang="en"`); PaddleOCR supports swapping this parameter, so multi-language support is a straightforward future extension rather than a rebuild.

### 4.2 Medicine Label Parsing

- **Approach:** Pattern-based heuristics, not a trained classifier — regex extraction for dosage (`\d+(mg|mcg|ml|g|iu)`) and expiry dates (labeled `EXP`/`EXPIRY` patterns, with a bare-date fallback), plus a longest-non-noise-line heuristic to guess the medicine name from OCR output.
- **Known limitation:** The name-detection heuristic works well on clean, simple packaging but can misfire on cluttered or multi-column layouts (e.g. picking an address or pharmacy line over the actual drug name if it happens to be longer/positioned earlier). This mirrors the object detector's "known limitation without task-specific fine-tuning" — a trained field-classifier would be the natural next step rather than pure regex.

### 4.3 Key Engineering Findings

- **PaddleOCR 3.x API drift from documented examples:** Most available tutorials/docs reference PaddleOCR 2.x's API (`PaddleOCR(show_log=False)`, `.ocr(img, cls=True)`, results as `[box, (text, confidence)]` tuples). PaddleOCR 3.7.0 changed all three — `show_log` was removed, `.ocr()` now delegates to `.predict()`, and results come back as dict-like objects with `rec_texts`/`rec_scores`/`rec_polys` keys instead of nested tuples. Required tracing actual runtime errors rather than trusting existing documentation/tutorials.
- **oneDNN/MKLDNN inference crash on Windows CPU:** `PaddleOCR.predict()` raised a `NotImplementedError` from Paddle's newer PIR executor (`ConvertPirAttribute2RuntimeAttribute not support ...`) during text detection specifically on Windows CPU inference. Root-caused to Paddle's oneDNN acceleration path; fixed by disabling it (`enable_mkldnn=False`), trading a small amount of inference speed for stability — acceptable since VisionMate processes single scanned frames, not video streams.

### 4.4 Output Format

Following the same convention as `detect_objects()`/`detect_currency()` — a single path-based function per feature, returning a pre-formatted `spoken_text` field:

- `read_text(image_path)` → `{"success", "text", "spoken_text", "lines"}` — `lines` retains per-line text/confidence/bounding-box for any future use (e.g. confidence-based fallback messaging), while `text`/`spoken_text` carry the same value today for direct consumption by the frontend and Web Speech API.
- `read_medicine(image_path)` → `{"success", "name", "dosage", "expiry", "spoken_text"}` — `spoken_text` is a full natural-language sentence (e.g. *"This appears to be Paracetamol. Dosage: 500mg. Expiry date not found — please check manually."*) rather than raw JSON, since structured fields alone read poorly aloud.

### 4.5 Exposed via

- `POST /api/read-text` — general-purpose text reader (books, signs, menus, documents)
- `POST /api/medicine-reader` — medicine label reader (backend ready; no dedicated frontend page yet)

Both follow the same integration pattern as the other feature endpoints in `server/main.py`: receive upload → save to `uploads/` → call the AI function by path → return its JSON response directly.
