import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";
import { supabase } from "../lib/Client";
import { useSettings, FONT_SIZES } from "../context/SettingsContext";

const themeColors = [
  { key: "blue",  color: "#A8D8EA", label: "Blue" },
  { key: "pink",  color: "#F5C1D0", label: "Pink" },
  { key: "green", color: "#C8E6C9", label: "Green" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  useEffect(() => {
    const cached = localStorage.getItem("penpath_avatar_url");
    if (cached) {
      setAvatarUrl(`${cached}?t=${Date.now()}`);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        const url = data?.user?.user_metadata?.avatar_url;
        if (url) {
          localStorage.setItem("penpath_avatar_url", url);
          setAvatarUrl(`${url}?t=${Date.now()}`);
        }
      });
    }
  }, []);

  const handleLogOut = () => {
    navigate("/welcome");
  };

  const handleCameraPress = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? "anonymous";

    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("penpath-handwriting")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload failed:", uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("penpath-handwriting")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    await supabase.auth.refreshSession();
    localStorage.setItem("penpath_avatar_url", publicUrl);
    setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    setUploading(false);
  };

  const handleRemovePhoto = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? "anonymous";
    const ext = avatarUrl?.split(".").pop();
    await supabase.storage
      .from("penpath-handwriting")
      .remove([`avatars/${userId}/profile.${ext}`]);
    await supabase.auth.updateUser({ data: { avatar_url: null } });
    await supabase.auth.refreshSession();
    localStorage.removeItem("penpath_avatar_url");
    setAvatarUrl(null);
  };

  return (
    <div className="Settings">
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            ‹
          </button>
          <h1 style={styles.title}>Settings</h1>
          <div style={styles.headerSpacer} />
        </div>

        {/* Profile Picture */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarWrapper}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" style={styles.avatarImage} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <FaUser size={36} color="#9CA3AF" />
              </div>
            )}
            <button
              onClick={handleCameraPress}
              style={styles.avatarCameraBtn}
              aria-label="Upload photo"
            >
              <FaCamera size={13} color="#FFFFFF" />
            </button>
          </div>
          {avatarUrl && (
            <button onClick={handleRemovePhoto} style={styles.removePhotoBtn}>
              Remove Photo
            </button>
          )}
          {uploading && <span style={styles.uploadingText}>Uploading...</span>}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <div style={styles.scrollContent}>
          {/* Themes */}
          <div style={styles.sectionTitle}>Theme</div>
          <div style={styles.themesRow}>
            {themeColors.map((theme) => (
              <button
                key={theme.key}
                onClick={() => update("theme", theme.key)}
                style={{
                  ...styles.themeBox,
                  backgroundColor: theme.color,
                  borderColor:
                    settings.theme === theme.key ? "#1A1A1A" : "transparent",
                }}
                aria-label={`Theme ${theme.label}`}
              />
            ))}
          </div>

          {/* Font Size */}
          <div style={styles.sectionTitle}>Font Size</div>
          <div style={styles.fontSizeRow}>
            {FONT_SIZES.map((size, index) => (
              <button
                key={index}
                onClick={() => update("fontSize", index)}
                style={styles.fontSizeItem}
                aria-label={`Font size ${size}px`}
              >
                <span
                  style={{
                    ...styles.fontSizeLetter,
                    fontSize: size,
                    color: settings.fontSize === index ? "#1A1A1A" : "#6B7280",
                    textDecoration:
                      settings.fontSize === index ? "underline" : "none",
                  }}
                >
                  A
                </span>
              </button>
            ))}
          </div>

          {/* Ink Row */}
          <div style={styles.inkRow}>
            {/* Ink Color */}
            <div style={styles.inkColumn}>
              <div style={styles.inkLabel}>Ink Color</div>
              <button
                onClick={() => colorInputRef.current?.click()}
                style={{
                  ...styles.inkColorSwatch,
                  backgroundColor: settings.inkColor,
                  borderColor:
                    settings.inkColor === "#FFFFFF" ? "#D1D5DB" : settings.inkColor,
                }}
                aria-label="Choose ink color"
              >
                <span
                  style={{
                    ...styles.inkColorHex,
                    color:
                      isLight(settings.inkColor) ? "#374151" : "#FFFFFF",
                  }}
                >
                  {settings.inkColor.toUpperCase()}
                </span>
              </button>
              <input
                ref={colorInputRef}
                type="color"
                value={settings.inkColor}
                onChange={(e) => update("inkColor", e.target.value)}
                style={styles.hiddenColorInput}
                aria-label="Ink color picker"
              />
            </div>

            {/* Ink Thickness */}
            <div style={styles.inkColumn}>
              <div style={styles.inkLabel}>
                Ink Thickness
                <span style={styles.thicknessValue}>{settings.inkThickness}</span>
              </div>
              <div style={styles.sliderWrapper}>
                <div
                  style={{
                    ...styles.thicknessPreview,
                    height: Math.max(2, (settings.inkThickness / 100) * 18),
                    backgroundColor: settings.inkColor,
                  }}
                />
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.inkThickness}
                  onChange={(e) => update("inkThickness", Number(e.target.value))}
                  style={styles.slider}
                  aria-label="Ink thickness"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div style={styles.sectionTitle}>Notifications</div>
          <div style={styles.notificationsRow}>
            <span style={styles.notificationsLabel}>
              Push Notifications
            </span>
            <button
              role="switch"
              aria-checked={settings.notifications}
              onClick={() => update("notifications", !settings.notifications)}
              style={{
                ...styles.toggle,
                backgroundColor: settings.notifications ? "#22C55E" : "#D1D5DB",
              }}
            >
              <span
                style={{
                  ...styles.toggleThumb,
                  transform: settings.notifications
                    ? "translateX(22px)"
                    : "translateX(2px)",
                }}
              />
            </button>
          </div>
          <p style={styles.notificationsHint}>
            {settings.notifications
              ? "You will receive lesson reminders and progress updates."
              : "Notifications are turned off."}
          </p>

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

        {/* Delete Modal */}
        {showDeleteModal && (
          <div
            style={styles.modalOverlay}
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalText}>
                Are you sure you want to delete your account?
              </div>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => {
                    // TODO: Implement actual account deletion via API
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
    </div>
  );
}

function isLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F7EEDC",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
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
    fontFamily: "'PlayKiddo', sans-serif",
  },
  headerSpacer: { width: 36 },

  scrollContent: {
    padding: "0 24px 24px",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1A1A1A",
    marginTop: 20,
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
    borderStyle: "solid",
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
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  fontSizeLetter: {
    fontWeight: 800,
  },

  inkRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 8,
  },
  inkColumn: { flex: 1 },
  inkLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  inkColorSwatch: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "solid",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inkColorHex: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  hiddenColorInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: "none",
  },
  sliderWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  thicknessPreview: {
    width: "100%",
    borderRadius: 99,
    transition: "height 0.15s ease, background-color 0.15s ease",
  },
  thicknessValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  slider: { width: "100%" },

  notificationsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "12px 16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  notificationsLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1A1A1A",
  },
  toggle: {
    position: "relative",
    width: 48,
    height: 26,
    borderRadius: 99,
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "background-color 0.2s ease",
    flexShrink: 0,
  },
  toggleThumb: {
    position: "absolute",
    top: 3,
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease",
  },
  notificationsHint: {
    fontSize: 13,
    color: "#9CA3AF",
    margin: "8px 0 0",
  },

  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 28,
    paddingBottom: 80,
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

  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  avatarWrapper: {
    position: "relative",
    width: 90,
    height: 90,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    objectFit: "cover",
    border: "2px solid #E5E5E5",
  },
  avatarCameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoBtn: {
    background: "transparent",
    border: "none",
    color: "#EF4444",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  uploadingText: {
    fontSize: 12,
    color: "#6B7280",
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
