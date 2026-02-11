import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const [selectedTheme, setSelectedTheme] = useState("blue");
  const [selectedFontSize, setSelectedFontSize] = useState(2);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0.3);

  const themeColors = [
    { key: "blue", color: "#A8D8EA" },
    { key: "pink", color: "#F5C1D0" },
    { key: "green", color: "#C8E6C9" },
  ];

  const fontSizes = [14, 18, 22, 26, 30];

  const sliderValue = useMemo(
    () => Math.round(sliderPosition * 100),
    [sliderPosition]
  );

  const handleLogOut = () => {
    console.log("Log Out pressed");
  };

  const handleInkColorPress = () => {
    console.log("Ink Color selector pressed");
  };

  const handleCameraPress = () => {
    console.log("Camera button pressed");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ←
        </button>

        <h1 style={styles.title}>Settings</h1>

        <div style={styles.headerSpacer} />
      </div>

      <div style={styles.scrollContent}>
        {/* Themes Section */}
        <div style={styles.sectionTitle}>Themes</div>
        <div style={styles.themesRow}>
          {themeColors.map((theme) => (
            <button
              key={theme.key}
              onClick={() => setSelectedTheme(theme.key)}
              style={{
                ...styles.themeBox,
                backgroundColor: theme.color,
                borderColor:
                  selectedTheme === theme.key ? "#1A1A1A" : "transparent",
              }}
              aria-label={`Theme ${theme.key}`}
            />
          ))}
        </div>

        {/* Font Size Section */}
        <div style={styles.sectionTitle}>Font Size</div>
        <div style={styles.fontSizeRow}>
          {fontSizes.map((size, index) => (
            <button
              key={index}
              onClick={() => setSelectedFontSize(index)}
              style={styles.fontSizeItem}
              aria-label={`Font size ${index}`}
            >
              <span
                style={{
                  ...styles.fontSizeLetter,
                  fontSize: size,
                  color: selectedFontSize === index ? "#1A1A1A" : "#6B7280",
                }}
              >
                B
              </span>
            </button>
          ))}
        </div>

        {/* Ink Row */}
        <div style={styles.inkRow}>
          <div style={styles.inkColumn}>
            <div style={styles.inkLabel}>Ink Color</div>
            <button onClick={handleInkColorPress} style={styles.inkColorPicker}>
              <span style={styles.inkColorText}>Please Select...</span>
            </button>
          </div>

          <div style={styles.inkColumn}>
            <div style={styles.inkLabel}>Ink Thickness</div>

            <div style={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderPosition(Number(e.target.value) / 100)}
                style={styles.slider}
              />
            </div>
          </div>
        </div>

        {/* Notifications Section (placeholder) */}
        <div style={styles.sectionTitle}>Notifications</div>

        {/* Action Buttons */}
        <div style={styles.buttonsContainer}>
          <button onClick={handleLogOut} style={styles.actionButton}>
            Log Out
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            style={styles.actionButton}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Bottom Camera Button */}
      <div style={styles.bottomBar}>
        <button onClick={handleCameraPress} style={styles.cameraButton}>
          📷
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalText}>
              Are you sure you want to delete your account?
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => {
                  console.log("Account deletion confirmed");
                  setShowDeleteModal(false);
                }}
                style={styles.modalButton}
              >
                Yes
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                style={styles.modalButton}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F7EEDC",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
  },
  backButton: {
    border: "none",
    background: "transparent",
    fontSize: 24,
    cursor: "pointer",
    padding: 4,
  },
  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
    color: "#1A1A1A",
  },
  headerSpacer: { width: 36 },

  scrollContent: {
    padding: "0 24px 24px",
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 12,
  },

  themesRow: {
    display: "flex",
    gap: 12,
    marginBottom: 8,
  },
  themeBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    cursor: "pointer",
  },

  fontSizeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  fontSizeItem: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    minWidth: 40,
    height: 50,
    padding: 0,
  },
  fontSizeLetter: {
    fontWeight: 800,
  },

  inkRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  inkColumn: { flex: 1 },
  inkLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  inkColorPicker: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: "10px 12px",
    border: "1px solid #E5E5E5",
    cursor: "pointer",
    textAlign: "left",
  },
  inkColorText: { fontSize: 14, color: "#9CA3AF" },

  sliderContainer: { height: 40, display: "flex", alignItems: "center" },
  slider: { width: "100%" },

  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    borderRadius: 24,
    padding: "14px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },

  bottomBar: {
    display: "flex",
    justifyContent: "center",
    padding: "16px 0 24px",
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    border: "2px solid #E5E5E5",
    cursor: "pointer",
    fontSize: 22,
    boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "min(520px, 100%)",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 20,
    lineHeight: "24px",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "center",
    gap: 24,
  },
  modalButton: {
    border: "none",
    background: "transparent",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    padding: "8px 24px",
  },
};
