import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import "../App.css";
import { useNavigate } from "react-router-dom";
import ImageCropper from "../components/ImageCropper";

export default function ScanCamera() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [camError, setCamError] = useState(null);

  const handleBack = () => navigate(-1);
  const handleThumbnail = () => fileInputRef.current?.click();

  // Convert gallery file to base64 then open crop
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setCropImage(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleShutter = useCallback(() => {
    if (capturedImage) {
      setCapturedImage(null);
      return;
    }
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) setCapturedImage(screenshot);
  }, [capturedImage]);

  // Confirm captured photo → open crop
  const handleConfirm = () => setCropImage(capturedImage);

  if (cropImage) {
    return (
      <ImageCropper
        image={cropImage}
        onConfirm={(cropped) => navigate("/scan/results", { state: { image: cropped } })}
        onCancel={() => setCropImage(null)}
      />
    );
  }

  return (
    <div className="cam-container">
      <div className="cam-header">
        <button className="cam-backButton" onClick={handleBack} aria-label="Back">‹</button>
        <h1 className="cam-title">Camera</h1>
      </div>

      <div className="cam-previewContainer">
        <div className="cam-previewPlaceholder">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="cam-capturedImage" />
          ) : camError ? (
            <p className="cam-errorText">{camError}</p>
          ) : (
            <Webcam
              ref={webcamRef}
              className="cam-video"
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              onUserMediaError={(err) => setCamError(err.message || String(err))}
            />
          )}
          <div className="cam-documentOverlay" />
        </div>
      </div>

      <div className="cam-actionBar">
        <button className="cam-thumbnailButton" onClick={handleThumbnail} aria-label="Open gallery">
          <div className="cam-thumbnailPlaceholder" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          className="cam-shutterButton"
          onClick={handleShutter}
          aria-label={capturedImage ? "Retake photo" : "Take photo"}
        >
          {capturedImage ? "↺" : "📷"}
        </button>

        <button
          className="cam-confirmButton"
          onClick={handleConfirm}
          disabled={!capturedImage}
          aria-label="Confirm"
        >
          ✓
        </button>
      </div>
    </div>
  );
}

/*
For the PI (since we decided on not getting a camera for the tablet)!:
  For your Raspberry Pi deployment, create a .env file (or change the
  one already made) with:
  VITE_DISABLE_CAMERA=true

  Then rebuild the app. The camera icon will be hidden from the footer, and the
  "Open Camera" option on the scan page will be removed.
*/
