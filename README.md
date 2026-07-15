# VisionMate 👁️

## AI-Powered On-Device Accessibility Assistant for the Visually Impaired

VisionMate is an AI-powered, voice-guided web application that helps visually impaired individuals perform everyday tasks — reading printed text, identifying objects, recognizing currency, and reading medicine labels — using efficient, privacy-preserving computer vision models that run **entirely on local hardware**.

> 📄 For a detailed technical deep-dive into the AI/backend/frontend architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Problem Statement

Visually impaired individuals often rely on others for everyday tasks such as reading medicine labels, identifying currency notes, recognizing common household objects, and reading printed text. Existing solutions often depend on cloud connectivity or aren't built for lightweight, privacy-preserving, on-device inference.

---

### Objective
Build an offline-first, on-device AI assistant that enables visually impaired users to:
- Read printed text aloud
- Identify common objects
- Recognize Indian currency
- Read medicine labels
- Receive instant voice feedback

---

## On-Device AI

VisionMate's core AI functionality — object detection and currency recognition — runs **entirely on local hardware** via **ONNX Runtime**. No cloud inference APIs are used for these features.

- **No internet dependency** for core AI features to function
- **No user images or data sent to third-party services** — everything is processed locally
- **Lightweight, CPU-friendly models** — chosen specifically to run without requiring a GPU

All AI models/pipelines run locally for optimized, offline-capable inference:
- **Object Detection:** YOLO11 (nano/small variant), exported to **ONNX** — pretrained on COCO, ~2.6M–9.4M parameters, achieving ~39.5–47% mAP on the standard COCO benchmark
- **Currency Recognition:** A custom-trained MobileNetV2 classifier, exported to **ONNX** — fine-tuned on a merged dataset of ~21,000 public images plus our own real-world photos, to specifically improve accuracy under real camera conditions
- **Text Reading:** PaddleOCR (English model) performs local optical character recognition (OCR) with document orientation classification and text-angle correction enabled. Images undergo grayscale conversion, denoising, adaptive thresholding, and deskewing before inference to improve recognition under uneven lighting and slight camera rotation. The extracted text is returned with per-line confidence scores and bounding boxes, enabling lightweight, CPU-friendly offline text reading without relying on any cloud OCR API.
- **Medicine Label Reading:** Built on the same PaddleOCR pipeline, a custom rule-based parser extracts structured information from medicine packaging, including the medicine name, dosage, and expiry date. Dosages and expiry dates are identified using regex-based pattern matching, while medicine names are inferred using heuristics on the OCR output, producing structured, speech-ready results entirely on-device without transmitting user data to third-party services.

While inference currently runs via a local FastAPI backend (rather than fully in-browser), all processing stays on the local machine — satisfying the core on-device requirement of no cloud dependency for AI functionality, with full browser-based inference (via ONNX Runtime Web) noted as a future goal below.

---

## Engineering Details

**Target Hardware:** Built and optimized to run locally on a standard laptop CPU via ONNX Runtime — no GPU or specialized hardware required, and no cloud inference dependency.

**Model Footprint:** Our fine-tuned currency classifier (MobileNetV2-based) exports to an ONNX file of ~8.9MB — small enough to load instantly and run comfortably within local memory alongside the YOLO11 object detector.

**Text Reading:** PaddleOCR 3.7.0 (PP-OCRv5 English) performs local optical character recognition using lightweight detection and recognition models (~7–16 MB combined). The PP-OCRv5 recognition model achieves up to 13% higher recognition accuracy than the previous generation while remaining optimized for CPU inference. 

**Medicine Label Reading:** Built on the same PP-OCRv5 pipeline, medicine packaging is processed entirely on-device before a custom parser extracts the **medicine name**, **dosage**, and **expiry date**.

**Performance Metrics:** Currency recognition completes in ~100ms per image. Object detection (YOLO11m) completes in ~440ms per image on a standard laptop CPU, steady-state after initial model load (~9ms preprocessing, ~380ms inference, ~7ms postprocessing) — measured locally via ONNX Runtime, no GPU used.

**Customization:** We fine-tuned a MobileNetV2 classifier on a merged dataset of ~21,000 currency images from two Roboflow Universe sources. During testing, we discovered the model — despite ~98% validation accuracy — failed to generalize to real camera photos due to a domain gap between the clean training images and real-world conditions. We root-caused this through systematic isolation testing, then fixed it by retraining specifically on a small set of our own real-world photos, improving real-world reliability. A held-out confusion matrix on real photos confirmed ~78% accuracy on this final model.

---

## User Workflow

1. User opens the web application.
2. The app welcomes the user through voice and begins listening for voice commands.
3. User points the camera at an object, or navigates via touch/voice.
4. User presses **Scan** (or gives a voice command).
5. The image is sent to the local AI backend.
6. YOLO detects objects / the currency classifier identifies denominations / PaddleOCR extracts text, depending on the selected feature.
7. The backend combines and formats the result.
8. The result is displayed on screen **and** read aloud via Text-to-Speech.

---

## Tech Stack

### Frontend
- React.js + Vite
- JavaScript, HTML5, CSS3
- React Router DOM
- Web Speech API (recognition + synthesis)
- MediaDevices API (`getUserMedia`) for camera access

### Backend
- FastAPI (Python)
- Uvicorn

### AI / Computer Vision
- Python
- Ultralytics YOLO11 (object detection)
- PyTorch + MobileNetV2 (currency recognition, transfer learning)
- ONNX / ONNX Runtime (optimized local inference)
- PaddleOCR (text and medicine label reading)
- OpenCV (image preprocessing)

### Training & Data
- Google Colab (GPU-based model training)
- Roboflow Universe (currency datasets)
- COCO (object detection benchmark/pretraining)
- Custom-collected real-world currency photos

### Version Control
- Git, GitHub

---

## System Architecture

see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Project Structure

see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/saumyabaranwal/visionmate.git
cd ./visionmate
```

### 2. Frontend Setup
```bash
cd ./client
npm install
npm run dev
```
The frontend runs at `https://localhost:5173/` by default.

### 3. Backend + AI Setup
```bash
cd ./server
python -m venv venv
source venv/Scripts/activate    # On Windows (Git Bash)
venv\Scripts\activate.bat       # cmd
venv\Scripts\Activate.ps1       # powershell
source venv/bin/activate        # On Mac/Linux

pip install -r ai/requirements.txt
uvicorn main:app --reload --host 0.0.0.0
```
The backend runs at `http://127.0.0.1:8000` by default.

> **Note:** Trained model files (`.onnx`) are not included in version control due to file size. Contact the team for the model files, or retrain using the instructions in `ARCHITECTURE.md`.

**Both frontend and backend must be running simultaneously** for the app to function.

---

## Usage Instructions

1. Start both the frontend and backend servers (see Setup above).
2. Open `https://localhost:5173/` in your browser.
3. Allow camera and microphone permissions when prompted.
4. Choose a feature (Read Text, Object Detection, Currency Detection, Surroundings) via touch or voice command.
5. Point the camera at the object/note/text and tap **Scan** or use **Voice Commands**.
6. The result will be displayed on screen and read aloud automatically.

---

## Demo

📹 **Demo Video:** *[Add link here before submission]*

---

## Screenshots

*[Add screenshots of Home, Object Detection, Currency Detection, and Read Text pages before submission]*

---

## Privacy & Safety

• Camera and microphone permissions are requested only to enable accessibility features.
• Images are processed locally and are not permanently stored.
• No user data is uploaded to external servers.
• Incorrect detections may occur under poor lighting or occlusion, so results should not be treated as professional medical advice.

## Team

| Name | Role |
|---|---|
| **Esha Jindal** | Frontend |
| **Ammar Rizvi** | Backend |
| **Saumya Baranwal** | Computer Vision |
| **Moulik Satija** | OCR & Accessibility |

---

## Known Limitations

- **Currency recognition** performs best when the note is held flat, well-lit, and filling most of the frame. Accuracy on casually-angled or poorly-lit photos is lower — this stems from a real-world data generalization gap identified and partially addressed during development (see `ARCHITECTURE.md` for details).
- **Object detection** uses a general-purpose pretrained model (COCO's 80 categories); visually similar small objects (e.g. a knife vs. a toothbrush) may occasionally be misclassified — a known limitation of general object detectors without task-specific fine-tuning.
- **Inference currently runs via a local backend server**, not fully in-browser. This still satisfies the on-device/offline/privacy-preserving goal (no cloud APIs, no data leaves the local machine), but is not yet a zero-backend, purely browser-based implementation.

---

## Future Scope

- Fine-tuning object detection on task-specific photos to resolve small-object confusion
- Expanding currency recognition to include international currencies
- Voice commands and continuous scanning mode
- Multi-language OCR support
- Scene description ("Surroundings" feature)
- Browser-based ONNX inference (removing the backend dependency entirely, via ONNX Runtime Web)
- Progressive Web App (PWA) support for installable, app-like usage
- SAHI (Slicing Aided Hyper Inference) for improved detection of small/distant objects

---

## Hackathon Highlights

- ✅ On-device AI — no cloud inference APIs
- ✅ Offline-first inference
- ✅ Lightweight, CPU-friendly models (ONNX Runtime)
- ✅ Accessibility-first design
- ✅ Privacy-preserving — no data leaves the local machine
- ✅ Real-world impact for visually impaired users

---

## License

This project was developed as part of a hackathon to promote accessible technology solutions for visually impaired individuals.
