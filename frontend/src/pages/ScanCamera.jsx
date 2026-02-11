import "../App.css";
import { useNavigate } from "react-router-dom";

export default function ScanCamera() {
  const navigate = useNavigate();

  const handleBack = () => {
    // web version of router.back()
    navigate(-1);
  };

  const handleThumbnail = () => {
    // TODO: open gallery
    console.log("Thumbnail pressed - open gallery");
  };

  const handleShutter = () => {
    // TODO: take picture
    console.log("Shutter pressed - take picture");
  };

  const handleConfirm = () => {
    // native: router.push('/scan/result')
    // web routes: you use /scan/results (based on your App.jsx)
    navigate("/scan/results");
  };

  return (
    <div className="cam-container">
      {/* Header */}
      <div className="cam-header">
        <button className="cam-backButton" onClick={handleBack} aria-label="Back">
          ←
        </button>

        <h1 className="cam-title">Camera</h1>
      </div>

      {/* Camera Preview Placeholder */}
      <div className="cam-previewContainer">
        <div className="cam-previewPlaceholder">
          <div className="cam-documentOverlay" />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="cam-actionBar">
        <button className="cam-thumbnailButton" onClick={handleThumbnail} aria-label="Open gallery">
          <div className="cam-thumbnailPlaceholder" />
        </button>

        <button className="cam-shutterButton" onClick={handleShutter} aria-label="Take photo">
          📷
        </button>

        <button className="cam-confirmButton" onClick={handleConfirm} aria-label="Confirm">
          ✓
        </button>
      </div>
    </div>
  );
}
