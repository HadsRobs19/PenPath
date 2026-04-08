import "../App.css";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";
import { apiFetch } from "../lib/api";
import { useSettings } from "../context/SettingsContext";

export default function ScanResults() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { state } = useLocation();
  const capturedImage = state?.image ?? null;

  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!capturedImage) return;

    async function runScan() {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFetch("/api/scan", {
          method: "POST",
          body: JSON.stringify({ image: capturedImage }),
        });
        setTranscription(result.data?.transcription ?? "No text found.");
      } catch (err) {
        console.error("Scan failed:", err);
        setError("Could not read the handwriting. Please try a clearer image.");
      } finally {
        setLoading(false);
      }
    }

    runScan();
  }, [capturedImage]);

  const handleBack = () => navigate(-1);
  const handleClose = () => navigate("/scan");

  return (
    <div className="res-container">
      {/* Header */}
      <div className="res-header">
        <button className="res-backButton" onClick={handleBack} aria-label="Back">
          ‹
        </button>
        <h1 className="res-title">Result</h1>
        <button className="res-closeButton" onClick={handleClose} aria-label="Close">
          <span className="res-closeCircle">✕</span>
        </button>
      </div>

      {/* Scroll area */}
      <div className="res-scroll">
        {/* Scanned Image Preview */}
        <div className="res-imageContainer">
          {capturedImage ? (
            <img src={capturedImage} alt="Scanned" className="res-scannedImage" />
          ) : (
            <div className="res-imagePlaceholder" aria-hidden="true">
              <div className="res-handwritingLines">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="res-handwritingLine" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Translation Section */}
        <div className="res-translationSection">
          <h2 className="res-sectionTitle">Translation</h2>

          {!capturedImage && (
            <p className="res-translationText" style={{ color: "#9CA3AF", fontStyle: "italic" }}>
              No image provided. Go back and capture or upload one.
            </p>
          )}

          {capturedImage && loading && (
            <div style={styles.statusBox}>
              <div style={styles.spinner} />
              <p style={styles.statusText}>Reading handwriting...</p>
            </div>
          )}

          {capturedImage && error && !loading && (
            <div style={{ ...styles.statusBox, backgroundColor: "#FEE2E2" }}>
              <p style={{ ...styles.statusText, color: "#DC2626" }}>{error}</p>
              <button
                style={styles.retryButton}
                onClick={() => {
                  setError(null);
                  setTranscription(null);
                  const img = capturedImage;
                  setLoading(true);
                  apiFetch("/api/scan", {
                    method: "POST",
                    body: JSON.stringify({ image: img }),
                  })
                    .then((r) => setTranscription(r.data?.transcription ?? "No text found."))
                    .catch(() => setError("Could not read the handwriting. Please try a clearer image."))
                    .finally(() => setLoading(false));
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {capturedImage && transcription && !loading && (
            <p className="res-translationText">{transcription}</p>
          )}
        </div>
      </div>

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
}

const styles = {
  statusBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #E5E7EB",
    borderTop: "3px solid #4B7BE5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  statusText: {
    fontSize: 14,
    color: "#6B7280",
    margin: 0,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 20,
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
