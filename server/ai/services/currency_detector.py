import onnxruntime as ort
import numpy as np
import json
from PIL import Image

session = ort.InferenceSession("models/currency_classifier.onnx", providers=["CPUExecutionProvider"])
input_name = session.get_inputs()[0].name

with open("models/class_names.json", "r") as f:
    class_names = json.load(f)

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def preprocess(image_path, img_size=224):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((img_size, img_size))
    img = np.array(img).astype(np.float32) / 255.0
    img = (img - MEAN) / STD
    img = img.transpose(2, 0, 1)
    img = np.expand_dims(img, axis=0).astype(np.float32)
    return img


def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()


def detect_currency(image_path):
    input_tensor = preprocess(image_path)
    outputs = session.run(None, {input_name: input_tensor})
    logits = outputs[0][0]
    probs = softmax(logits)

    predicted_idx = int(np.argmax(probs))
    denomination = class_names[predicted_idx]
    confidence = float(probs[predicted_idx])

    if confidence < 0.5:
        spoken_text = "I'm not sure. Please try again with better lighting and hold the note flat."
    else:
        spoken_text = f"This is a {denomination} rupee note."

    return {
        "denomination": f"₹{denomination}",
        "confidence": round(confidence, 2),
        "status": "ok",
        "spoken_text": spoken_text
    }