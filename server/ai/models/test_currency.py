import onnxruntime as ort
import numpy as np
import json
from PIL import Image

session = ort.InferenceSession("models/currency_classifier.onnx", providers=["CPUExecutionProvider"])
input_name = session.get_inputs()[0].name

with open("models/class_names.json") as f:
    class_names = json.load(f)

def preprocess(image_path):
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    img = np.array(img).astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img = (img - mean) / std
    img = img.transpose(2, 0, 1)
    return np.expand_dims(img, 0).astype(np.float32)

import sys
img_path = sys.argv[1]
input_tensor = preprocess(img_path)
outputs = session.run(None, {input_name: input_tensor})
logits = outputs[0][0]
probs = np.exp(logits) / np.sum(np.exp(logits))

for name, p in zip(class_names, probs):
    print(f"{name}: {p:.3f}")
