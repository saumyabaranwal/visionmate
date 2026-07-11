from ultralytics import YOLO

# Load model only once
model = YOLO("yolo11n.pt")


def detect_objects(image_path):
    results = model(image_path)

    detections = []

    for box in results[0].boxes:
        cls = int(box.cls[0])
        confidence = float(box.conf[0])

        detections.append({
            "label": model.names[cls],
            "confidence": round(confidence, 2)
        })

    return detections