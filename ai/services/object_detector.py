from ultralytics import YOLO

model = YOLO("yolo11n.onnx")


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

    # Sort by confidence, take top 2 for spoken summary
    top_detections = sorted(detections, key=lambda d: d["confidence"], reverse=True)[:2]

    if not top_detections:
        spoken_text = "I don't see anything I recognize."
    elif len(top_detections) == 1:
        spoken_text = f"I see a {top_detections[0]['label']}."
    else:
        labels = " and a ".join(d["label"] for d in top_detections)
        spoken_text = f"I see a {labels}."

    return {
        "objects": detections,
        "spoken_text": spoken_text
    }
