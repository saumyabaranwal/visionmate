# VisionMate — Technical Architecture

This document describes the technical architecture of VisionMate across all three layers: frontend, backend, and AI/computer vision. For the project pitch, features, and setup instructions, see [README.md](./README.md).

---

## System Overview

```
┌─────────────────┐      HTTPS (image upload)      ┌──────────────────┐
│   React Frontend │ ─────────────────────────────▶│  FastAPI Backend │
│   (client/)      │◀───────────────────────────── │  (server/)       │
└─────────────────┘         JSON response          └──────────────────┘
       │                                                     │
       │ Camera capture (MediaDevices API)                   │ calls
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
### 📂 Client Structure
```
visionmate
│
|
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
### 📂 Server Structure

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
- **CORS:** Configured to accept requests from the Vite dev server origin (`https://localhost:5173/`)
- **Endpoints (per feature module):**
  - `/object-detection` → calls `detect_objects()`
  - `/currency-detection` → calls `detect_currency()`
  - `/read-text` → calls `read_text( )`
  - `/surroundings` → scene description (future/in-progress)
- **File handling:** Uploaded images are temporarily saved to an `uploads/` directory before being passed to the relevant AI function by file path.

---

## 3. Frontend-Backend Communication

- The frontend is built with **React + Vite**, while the backend uses **FastAPI**.
- To enable browser access to the **camera** and **microphone**, the frontend is served over **HTTPS** during development using Vite's `basicSsl` plugin.
- The backend continues to run over **HTTP** on port `8000`.
- API requests are made to `/api/*` endpoints, which are forwarded to the FastAPI server using Vite's development proxy. This avoids hardcoding backend URLs and simplifies switching between local and deployed environments.
- The application was tested on both **desktop browsers** and **mobile devices** over the same local Wi-Fi network to verify camera capture, speech recognition, text-to-speech, and backend communication.
- The frontend can be run on your mobile device if it is connected to the same wifi as your laptop using (`https://YOUR_IP_ADDRESS:5173/`)
- Each feature provides **voice guidance**, supports **hands-free voice commands**, and delivers **spoken feedback** to improve accessibility for visually impaired users.
---

## 4. AI / Computer Vision Architecture (`ai/`)


### 4.1 Object Detection

- **Model:** YOLO11 (Ultralytics), pretrained on COCO (80 general object categories)
- **Optimization:** Exported to **ONNX** format for fast, lightweight local inference (`yolo11n.onnx` / `yolo11s.onnx` depending on the accuracy/speed tradeoff chosen)
- **Inference:** Ultralytics' `YOLO()` class loads the `.onnx` file directly and internally handles preprocessing, NMS, and box decoding
- **Output:** List of detected objects (label + confidence), plus a `spoken_text` field summarizing the top 1-2 most confident detections into a natural sentence for voice output
- **Known limitation:** Detection is limited to COCO's 80 categories; objects outside this set, or visually similar small/thin objects (e.g. knives vs. toothbrushes), can be misclassified. This is a known limitation of general-purpose pretrained detectors without task-specific fine-tuning.

### 4.2 Currency Recognition

- **Model:** MobileNetV2 (transfer learning) — pretrained feature extractor frozen, only the final classification head trained
- **Dataset:** Merged from two Roboflow Universe sources (~21,000 images total) plus custom real-world photos taken specifically to close a generalization gap discovered during testing (see below)
- **Class imbalance handling:** Weighted cross-entropy loss, since denominations like ₹200 and ₹2000 had far fewer available training images than common denominations
- **Key engineering finding:** A model trained purely on public dataset images achieved ~98% validation accuracy but performed poorly on real camera photos — a classic **domain shift** problem (training data style didn't match real-world deployment conditions). This was root-caused via systematic isolation testing (same image tested across PyTorch/Colab, ONNX/Colab, and ONNX/local) before being fixed by retraining on a small set of real-world photos matching actual deployment conditions.
- <img width="997" height="974" alt="confusion_matrix" src="https://github.com/user-attachments/assets/865daed6-a49f-4f0d-896d-d39ad9e674ad" />

- **Optimization:** Exported to ONNX; inference uses `onnxruntime` directly (manual preprocessing: resize to 224×224, ImageNet normalization, softmax over model output)
- **Output:** Predicted denomination + confidence + a `spoken_text` field (with a fallback message for low-confidence predictions, prompting the user to retry with better lighting/framing)

### 4.3 Shared AI Design Principles

- All models run via **ONNX Runtime**, chosen for framework-independent, CPU-friendly local inference
- Every service exposes a single simple function (`detect_objects(image_path)`, `detect_currency(image_path)`) so the backend can call them without needing to know model internals
- Every response includes a pre-formatted `spoken_text` field, shifting natural-language formatting responsibility to the AI layer rather than the frontend

---

## 5. OCR & Accessibility (`ai/services/ocr_service.py`, `medicine_service.py`)

- **Role:** Extracts printed text from images such as signboards, documents, labels, and medicine packaging. The extracted text is then converted into clean, structured, speech-ready output for the user.

### 5.1 Text Extraction (OCR)

- **Model:** PaddleOCR (PP-OCRv6 pipeline, via PaddleX) with document orientation classification and text-angle correction enabled. This allows accurate text recognition even when images are slightly tilted instead of perfectly aligned.
- **Preprocessing:** Before OCR, each image is enhanced using grayscale conversion, denoising (`fastNlMeansDenoising`), adaptive thresholding (to handle uneven lighting), and deskewing (using `minAreaRect`) to improve recognition on small, blurry, or glossy text.
- **Language:** Currently supports English (`lang="en"`). Since PaddleOCR supports multiple languages, extending to multilingual OCR only requires changing the language model rather than redesigning the pipeline.

### 5.2 Medicine Label Parsing

- **Approach:** Uses pattern-based heuristics instead of a trained classifier. Dosages are extracted using regex (`\d+(mg|mcg|ml|g|iu)`), expiry dates are detected from `EXP`/`EXPIRY` patterns (with a date fallback), and the medicine name is inferred by selecting the longest meaningful text line from the OCR output.
- **Known limitation:** This heuristic performs well on clean packaging but may incorrectly identify the medicine name on cluttered or multi-column labels (e.g., selecting an address instead of the medicine name). A dedicated trained field-classifier would improve accuracy in future versions.

### 5.3 Key Engineering Findings

- **PaddleOCR 3.x API changes:** Most tutorials reference PaddleOCR 2.x (`PaddleOCR(show_log=False)`, `.ocr(img, cls=True)`, returning `[box, (text, confidence)]`). In PaddleOCR 3.7.0, `show_log` was removed, `.ocr()` now delegates to `.predict()`, and results are returned as dictionary-like objects (`rec_texts`, `rec_scores`, `rec_polys`). This required debugging the runtime behavior instead of relying solely on existing documentation.
- **oneDNN/MKLDNN issue on Windows:** During CPU inference, `PaddleOCR.predict()` raised a `NotImplementedError` related to Paddle's newer PIR executor. The issue was traced to the oneDNN acceleration path and resolved by disabling MKLDNN (`enable_mkldnn=False`). This slightly reduced inference speed but provided stable execution, which is acceptable for VisionMate's single-image processing workflow.

### 5.4 Output Format

Following the same design as `detect_objects()` and `detect_currency()`, each OCR service returns structured JSON along with a pre-formatted `spoken_text` field.

- `read_text(image_path)` → `{"success", "text", "spoken_text", "lines"}`  
  `lines` contains per-line text, confidence scores, and bounding boxes for future use, while `text` and `spoken_text` are used directly by the frontend and Web Speech API.

- `read_medicine(image_path)` → `{"success", "name", "dosage", "expiry", "spoken_text"}`  
  `spoken_text` is returned as a complete natural-language sentence (e.g., *"This appears to be Paracetamol. Dosage: 500mg. Expiry date not found—please check manually."*) to provide a better voice experience than raw JSON fields.

### 5.5 Exposed via

- `POST /api/read-text` — General-purpose text reader for books, signs, menus, and documents.
- `POST /api/medicine-reader` — Medicine label reader (backend ready; no dedicated frontend page yet).

Both endpoints follow the same workflow as the other AI features: receive an uploaded image, save it temporarily to `uploads/`, process it using the appropriate AI service, and return the resulting JSON response to the frontend.
