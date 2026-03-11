import "../App.css";
import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: { ideal: "environment" },
};

export default function ScanCamera() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const handleBack = () => navigate(-1);

  const handleThumbnail = () => {
    // TODO: open gallery
    console.log("Thumbnail pressed - open gallery");
  };

  const handleShutter = useCallback(() => {
    const dataUrl = webcamRef.current?.getScreenshot();
    if (dataUrl) setCapturedImage(dataUrl);
  }, []);

  const handleRetake = () => setCapturedImage(null);

  const handleConfirm = () => {
    navigate("/scan/results", { state: { image: capturedImage } });
  };

  const handleCameraError = (error) => {
    console.error("Camera error:", error);
    setCameraError("Camera access denied or unavailable. Please check your browser permissions.");
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
        {cameraError ? (
          <div className="cam-previewPlaceholder">
            <p style={{ color: "#c0392b", textAlign: "center", padding: "16px" }}>{cameraError}</p>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured document" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={handleCameraError}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div className="cam-documentOverlay" />
      </div>

      {/* Bottom Action Bar */}
      <div className="cam-actionBar">
        <button className="cam-thumbnailButton" onClick={handleThumbnail} aria-label="Open gallery">
          <div className="cam-thumbnailPlaceholder" />
        </button>

        {capturedImage ? (
          <button className="cam-shutterButton" onClick={handleRetake} aria-label="Retake photo">
            ↺
          </button>
        ) : (
          <button className="cam-shutterButton" onClick={handleShutter} aria-label="Take photo">
            📷
          </button>
        )}

        <button className="cam-confirmButton" onClick={handleConfirm} aria-label="Confirm" disabled={!capturedImage}>
          ✓
        </button>
      </div>
    </div>
  );
}
