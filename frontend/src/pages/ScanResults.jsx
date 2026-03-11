import "../App.css";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";

export default function ScanResults() {
  const navigate = useNavigate();
  const [selectedAI, setSelectedAI] = useState("penpath");

  const aiOptions = useMemo(
    () => [
      { key: "penpath", label: "PenPath AI" },
      { key: "penpath-pro", label: "PenPath AI Pro" },
      { key: "gpt5-pro", label: "GPT -5 Pro" },
    ],
    []
  );

  const location = useLocation();
  const capturedImage = location.state?.image;

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
            <img src={capturedImage} alt="Scanned document" style={{ width: "100%", borderRadius: "8px", objectFit: "contain" }} />
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

        {/* AI Assistant Card */}
        <div className="res-aiCard">
          <div className="res-aiTitle">AI Assistant</div>

          <div className="res-pillContainer">
            {aiOptions.map((option) => {
              const selected = selectedAI === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setSelectedAI(option.key)}
                  className={`res-pill ${selected ? "res-pillSelected" : ""}`}
                >
                  <span className={`res-pillText ${selected ? "res-pillTextSelected" : ""}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Translation Section */}
        <div className="res-translationSection">
          <h2 className="res-sectionTitle">Translation</h2>
          <p className="res-translationText">
            Don&apos;t talk me down. Don&apos;t fill my head with doubt. Don&apos;t call me late at night,
            knowing what I&apos;m like. Don&apos;t trust myself when you walk out. Don&apos;t turn around.
            Don&apos;t talk me down. Don&apos;t talk me down.
          </p>
        </div>
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
}
