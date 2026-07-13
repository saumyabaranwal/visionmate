# VisionMate 👁️

## Overview

VisionMate is an AI-powered assistive web application designed to enhance the independence of visually impaired individuals by providing voice-guided assistance for everyday tasks. The application combines an intuitive user interface with accessibility-focused features, allowing users to interact through voice commands or touch-based navigation.

VisionMate aims to simplify daily activities such as reading printed text, identifying objects, recognizing currency, and understanding surroundings through an accessible, mobile-friendly platform.

---

# Problem Statement

Millions of visually impaired individuals face challenges while performing simple everyday tasks such as reading printed documents, identifying objects, recognizing currency notes, and navigating unfamiliar environments. Existing solutions are often expensive, require specialized hardware, or are difficult to use.

VisionMate addresses these challenges by providing an accessible web application that enables users to perform these tasks independently using voice interaction, camera integration, and intelligent backend services.

---

# Our Solution

VisionMate provides an easy-to-use, voice-assisted platform that enables users to:

- Read printed text aloud
- Identify surrounding objects
- Recognize currency notes
- Describe nearby surroundings
- Navigate the application using either voice commands or touch gestures
- Receive spoken feedback through Text-to-Speech

The application has been designed with accessibility as the primary focus, ensuring a simple, responsive, and user-friendly experience across mobile devices.

---

# Features

### Voice Assisted Navigation

- Voice-guided welcome message
- Automatic voice command activation
- Hands-free navigation
- Speech recognition support

### Accessibility

- Large touch-friendly interface
- Responsive mobile design
- Voice feedback for every interaction
- Simple and intuitive workflow

### Functional Modules

- Read Text
- Object Detection
- Currency Identification
- Describe Surroundings

Each module captures an image using the device camera, sends it to the backend for processing, and presents the result both visually and through speech synthesis.

---

# User Workflow

1. Launch VisionMate.
2. The application welcomes the user through voice.
3. Voice recognition automatically starts listening for commands.
4. The user can:
   - Tap anywhere on the screen, or
   - Speak one of the available commands.
5. The application navigates to the selected feature.
6. The device camera opens.
7. An image is captured.
8. The image is sent to the backend.
9. The processed result is displayed.
10. The result is read aloud to the user.

---

# Frontend Technologies Used

## Programming Languages

- JavaScript
- HTML5
- CSS3

## Frameworks & Libraries

- React
- Vite
- React Router DOM
- React Icons

## Browser APIs

- Web Speech API
- Speech Synthesis API
- MediaDevices API

---

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

---

# Frontend Highlights

The frontend has been developed with accessibility and ease of use as the primary design goals.

Key implementations include:

- Responsive user interface
- Camera integration
- Voice-guided onboarding
- Automatic speech recognition
- Touch and voice-based navigation
- Text-to-Speech output
- Modular React component architecture
- Mobile-first design approach

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/saumyabaranwal/visionmate.git
```

## Navigate to the Project

```bash
cd visionmate
```

## Install Frontend Dependencies

```bash
cd client
npm install
```

## Run the Frontend

```bash
npm run dev
```

The application will start on the local development server.

---

# Accessibility Features

VisionMate has been designed with accessibility at its core.

Implemented accessibility features include:

- Voice-guided user interaction
- Automatic speech recognition
- Audio feedback through Text-to-Speech
- Large and easily accessible controls
- Responsive interface for mobile devices
- Camera-based interaction
- Minimal user input requirement

---

# Challenges Faced

Throughout the development process, several challenges were encountered while implementing a seamless user experience.

Major challenges included:

- Building an accessible interface suitable for visually impaired users.
- Integrating browser-based speech recognition and speech synthesis.
- Managing camera permissions across different devices.
- Designing responsive layouts optimized for smartphones.
- Connecting frontend components with backend APIs.
- Collaborating efficiently using Git and GitHub.

These challenges helped strengthen our understanding of frontend architecture, accessibility principles, and collaborative software development.

---

# Learnings

Working on VisionMate provided valuable experience in:

- React application development
- Component-based architecture
- Client-side routing
- Browser APIs
- Voice-based user interaction
- Camera integration
- Responsive UI design
- Git and GitHub collaboration
- Team-based software development

---

# Future Enhancements

Potential improvements include:

- Multi-language support
- Offline functionality
- Emergency SOS feature
- Wearable device support
- Indoor navigation assistance
- Personalized accessibility settings

---

# Computer Vision & AI

>

# Contributors

- **Esha Jindal** — Frontend Development
- **Ammar Rizvi** — Backend
- **Saumya Baranwal** — Computer Vision
- **Moulik Satija** — OCR &Accessibility

---

# License

This project was developed as part of a hackathon to promote accessible technology solutions for visually impaired individuals.