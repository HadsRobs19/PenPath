import "../App.css";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";

const ScanUpload = () => {
  const navigate = useNavigate();

  const handleUploadTap = () => {
    // TODO: Implement file/image picker logic
    console.log("Tap to upload file pressed");
  };

  const handleOpenCamera = () => {
    navigate("/scan/camera");
  };

  const handleUploadButton = () => {
    // TODO: Implement file/image upload logic
    console.log("Upload Image/File pressed");
  };

  return (
    <div className="scan-container">
      <h1 className="scan-title">Scan</h1>

      <div className="scan-card">
        <div className="scan-iconCircle" aria-hidden="true">
          ☁️
        </div>

        <button className="scan-uploadText" onClick={handleUploadTap}>
          Tap to upload file
        </button>

        <p className="scan-orText">OR</p>

        <button className="scan-cameraButton" onClick={handleOpenCamera}>
          Open Camera
        </button>
      </div>

      <div className="scan-bottomSection">
        <button className="scan-uploadButton" onClick={handleUploadButton}>
          Upload Image/File
        </button>
      </div>

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
