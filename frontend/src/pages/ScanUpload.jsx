import { useRef } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";


const ScanUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    navigate("/scan/results", { state: { image: url } });
  };

  const handleOpenCamera = () => {
    navigate("/scan/camera");
  };

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

      <p className="scan-orText">OR</p>

      <button className="scan-cameraButton" onClick={handleOpenCamera}>
        Open Camera
      </button>
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

      <button onClick={() => navigate("/scan")}>
        <FaCamera />
      </button>

      <button onClick={() => navigate("/account")}>
        <FaUser />
      </button>
    </footer>
  </div>
);

};

export default ScanUpload;

