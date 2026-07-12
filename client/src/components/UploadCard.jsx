import "./UploadCard.css";
import { useState } from "react";

function UploadCard() {
  const [image, setImage] = useState(null);

  function handleImage(event) {
    const file = event.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  }

  return (
    <section className="upload-section">

      <h2>Upload an Image</h2>

      <p>
        Choose an image from your gallery or capture one using your camera.
      </p>

      <div className="upload-card">

        {image ? (
          <img src={image} alt="Preview" className="preview-image" />
        ) : (
          <div className="placeholder">
            📷
            <span>No image selected</span>
          </div>
        )}

        <div className="buttons">

          <label className="upload-btn">
            Upload from Gallery
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              hidden
            />
          </label>

          <label className="camera-btn">
            Open Camera
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              hidden
            />
          </label>

        </div>

      </div>

    </section>
  );
}

export default UploadCard;