from ultralytics import YOLO
# Load ONNX model for optimized inference
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
    return detections
