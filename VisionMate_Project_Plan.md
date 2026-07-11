# VisionMate

## AI-Powered On-Device Accessibility Assistant for the Visually Impaired

## Problem Statement

Visually impaired individuals often rely on others for everyday tasks
such as reading medicine labels, identifying currency notes, recognizing
common household objects, and reading printed text. Existing solutions
may depend on cloud connectivity or are not tailored for lightweight,
privacy-preserving on-device inference.

**VisionMate** aims to provide an accessible AI-powered web application
that performs these tasks locally using efficient computer vision
models.

------------------------------------------------------------------------

# Objective

Build an offline-first, on-device AI assistant that enables visually
impaired users to:

-   Read printed text aloud
-   Identify common objects
-   Recognize Indian currency
-   Read medicine labels
-   Receive instant voice feedback

------------------------------------------------------------------------

# Core Features

## 📖 Text Reader

Reads printed text from books, labels, menus, documents and signboards
using OCR.

## 📦 Object Recognition

Recognizes common everyday objects using YOLO.

## 💊 Medicine Reader

Extracts medicine name, dosage and expiry information from packaging.

## 💵 Currency Recognition

Recognizes Indian currency denominations.

## 🔊 Voice Feedback

Speaks the detected information using browser Text-to-Speech.

------------------------------------------------------------------------

# User Workflow

1.  User opens the web application.
2.  Webcam starts.
3.  User points the camera at an object.
4.  User presses **Scan**.
5.  Image is sent to the local AI backend.
6.  YOLO detects objects.
7.  PaddleOCR extracts any text.
8.  Backend combines the results.
9.  Browser reads the response aloud.

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   React.js
-   Vite
-   JavaScript
-   Tailwind CSS

## Camera

-   WebRTC (`getUserMedia`)

## Backend

-   FastAPI

## AI

-   Python
-   YOLOv11n (or YOLOv8n)
-   PaddleOCR
-   OpenCV (optional)

## Runtime

-   ONNX Runtime

## Training

-   Google Colab
-   Ultralytics YOLO

## Dataset

-   COCO
-   Roboflow
-   Custom Indian Currency Images

## Voice

-   Web Speech API

## Version Control

-   Git
-   GitHub

------------------------------------------------------------------------

# System Architecture

``` text
User
  │
  ▼
React Web App
  │
  ▼
FastAPI
  │
  ├── YOLO Object Detection
  ├── PaddleOCR
  ├── Currency Recognition
  └── Medicine Text Extraction
  │
  ▼
Combined Response
  │
  ▼
Web Speech API
```

------------------------------------------------------------------------

# Suggested Project Structure

``` text
visionmate/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── ai/
│   ├── app/
│   ├── models/
│   ├── services/
│   ├── routes/
│   └── requirements.txt
│
├── docs/
├── README.md
└── .gitignore
```

------------------------------------------------------------------------

# Team Division

## Esha --- Frontend

-   React UI
-   Tailwind CSS
-   Camera integration
-   Voice output
-   Display results

## Ammar --- Backend

-   FastAPI
-   API endpoints
-   Frontend integration
-   Response formatting

## Saumya --- Computer Vision

-   YOLO integration
-   Object detection
-   Currency recognition
-   ONNX Runtime
-   Model optimization

## Moulik --- OCR & Accessibility

-   PaddleOCR
-   Medicine reader
-   OCR preprocessing
-   Accessibility improvements

------------------------------------------------------------------------

# Development Timeline

## Day 1

-   Member 1: Build React UI and camera access.
-   Member 2: Set up FastAPI and basic API routes.
-   Member 3: Integrate YOLO and test object detection.
-   Member 4: Integrate PaddleOCR and test text extraction.

## Day 2

-   Connect frontend and backend
-   Object detection working
-   OCR working
-   Voice output

## Day 3

-   Currency recognition
-   Medicine reader
-   Unified scan endpoint

## Day 4

-   Model optimization
-   UI polish
-   Testing

## Day 5

-   Bug fixing
-   Demo preparation
-   README
-   Presentation

------------------------------------------------------------------------

# Demo Flow

1.  Open VisionMate
2.  Camera starts
3.  Point camera
4.  Click **Scan**
5.  AI processes locally
6.  Result appears on screen
7.  Result is spoken aloud

------------------------------------------------------------------------

# Future Scope

-   Voice commands
-   Continuous scanning mode
-   Multi-language OCR
-   Scene description
-   Better medicine recognition
-   PWA support
-   Browser-based ONNX inference (no backend)

------------------------------------------------------------------------

# Hackathon Highlights

-   On-device AI
-   Offline-first inference
-   Lightweight models
-   Accessibility-focused
-   Privacy preserving
-   Real-world impact
