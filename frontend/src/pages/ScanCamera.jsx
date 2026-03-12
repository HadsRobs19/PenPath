import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import "../App.css";
import { useNavigate } from "react-router-dom";

export default function ScanCamera() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [camError, setCamError] = useState(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleThumbnail = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedImage(url);
  };

  const handleShutter = useCallback(() => {
    if (capturedImage) {
      setCapturedImage(null);
      return;
    }
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) setCapturedImage(screenshot);
  }, [capturedImage]);

  const handleConfirm = () => {
    navigate("/scan/results", { state: { image: capturedImage } });
  };

  return (
    <div className="cam-container">
      {/* Header */}
      <div className="cam-header">
        <button className="cam-backButton" onClick={handleBack} aria-label="Back">
          ‹
        </button>
        <h1 className="cam-title">Camera</h1>
      </div>

      {/* Camera Preview */}
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

      {/* Bottom Action Bar */}
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
