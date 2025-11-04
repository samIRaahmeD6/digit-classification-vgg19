# app.py
import io
import numpy as np
import os
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.vgg19 import preprocess_input

app = Flask(__name__)
CORS(app)

MODEL_PATH = "models/digit_classifier.h5"

# Load model and inspect input shape
model = load_model(MODEL_PATH)
input_shape = model.input_shape  # e.g., (None, 224, 224, 3) or (None, 28, 28, 1)
# print("Model input shape:", input_shape)


def preprocess_image(img: Image.Image):
    """
    Prepares a PIL image to match model input.
    Handles grayscale/RGB, resizing, scaling, and optional VGG19 preprocessing.
    """
    _, *shape = input_shape  # ignore batch dim
    height, width = shape[0], shape[1]
    channels = shape[2] if len(shape) > 2 else 1

    # Convert image mode
    mode = "L" if channels == 1 else "RGB"
    if img.mode != mode:
        img = img.convert(mode)

    # Resize
    img = img.resize((width, height), Image.BILINEAR)

    # Convert to numpy array
    arr = np.array(img).astype("float32")

    # Ensure proper channel dimension
    if channels == 1:
        if arr.ndim == 2:
            arr = np.expand_dims(arr, axis=-1)  # H,W -> H,W,1
    elif channels == 3:
        if arr.ndim == 2:  # grayscale -> RGB
            arr = np.stack([arr, arr, arr], axis=-1)
        elif arr.shape[-1] == 1:
            arr = np.concatenate([arr, arr, arr], axis=-1)

    # Preprocess for VGG19 if model expects RGB 224x224 (common)
    if channels == 3 and height >= 32 and width >= 32:
        arr = preprocess_input(arr)  # scales pixels appropriately for VGG19
    else:
        arr = arr / 255.0  # scale for smaller grayscale CNNs

    arr = np.expand_dims(arr, axis=0)  # add batch dimension
    return arr


@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects a multipart/form-data POST with 'file' field (PNG/JPG).
    Returns JSON: { predicted: int, probabilities: [...], model_input_shape: ... }
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))
        processed = preprocess_image(img)
        preds = model.predict(processed)
        probs = preds[0].tolist()
        predicted_index = int(np.argmax(preds, axis=1)[0])
        return jsonify({
            "predicted": predicted_index,
            "probabilities": probs,
            "model_input_shape": input_shape
        })
    except Exception as e:
        print("Error during prediction:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
