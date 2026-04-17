import { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";
import { useSettings } from "../context/SettingsContext";

async function getCroppedImg(imageSrc, croppedAreaPixels) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height
      );
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

const ScanUpload = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const fileInputRef = useRef(null);

  const [rawImage, setRawImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const openPicker = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setRawImage(evt.target.result);
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirmCrop = async () => {
    const cropped = await getCroppedImg(rawImage, croppedAreaPixels);
    navigate("/scan/results", { state: { image: cropped } });
  };

  const handleOpenCamera = () => navigate("/scan/camera");

if (rawImage) {
  return (
    <div style={cropStyles.overlay}>
      <div style={cropStyles.header}>
        <button style={cropStyles.cancelBtn} onClick={() => setRawImage(null)}>Cancel</button>
        <span style={cropStyles.headerTitle}>Crop & Resize</span>
        <button style={cropStyles.confirmBtn} onClick={handleConfirmCrop}>Scan</button>
      </div>
      <div style={cropStyles.cropArea}>
        <Cropper
          image={rawImage}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div style={cropStyles.controls}>
        <span style={cropStyles.zoomLabel}>Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={cropStyles.slider}
        />
      </div>
    </div>
  );
}

return (
  <div className="scan-container">
    <h1 className="scan-title">Scan</h1>

    <div className="scan-card">
      <div className="scan-iconCircle" aria-hidden="true">
        ☁️
      </div>

      <button className="scan-uploadText" onClick={openPicker}>
        Tap to upload file
      </button>

      {settings.cameraEnabled && (
        <>
          <p className="scan-orText">OR</p>

          <button className="scan-cameraButton" onClick={handleOpenCamera}>
            Open Camera
          </button>
        </>
      )}
    </div>

    <div className="scan-bottomSection">
      <button className="scan-uploadButton" onClick={openPicker}>
        Upload Image/File
      </button>
    </div>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={handleFileChange}
    />

    {/* Footer Navigation */}
    <footer className="bottom-nav">
      <button onClick={() => navigate("/home")}>
        <FaHome />
      </button>

      {settings.cameraEnabled && (
        <button onClick={() => navigate("/scan")}>
          <FaCamera />
        </button>
      )}

      <button onClick={() => navigate("/account")}>
        <FaUser />
      </button>
    </footer>
  </div>
);

};

const cropStyles = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "#000",
    display: "flex", flexDirection: "column",
    zIndex: 100,
  },
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#111",
  },
  headerTitle: { color: "#fff", fontWeight: 700, fontSize: 16 },
  cancelBtn: {
    background: "transparent", border: "none",
    color: "#aaa", fontSize: 15, cursor: "pointer",
  },
  confirmBtn: {
    background: "#2563EB", border: "none",
    color: "#fff", fontSize: 15, fontWeight: 700,
    borderRadius: 20, padding: "6px 20px", cursor: "pointer",
  },
  cropArea: { flex: 1, position: "relative" },
  controls: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px 24px", backgroundColor: "#111",
  },
  zoomLabel: { color: "#fff", fontSize: 13, flexShrink: 0 },
  slider: { flex: 1 },
};

export default ScanUpload;

