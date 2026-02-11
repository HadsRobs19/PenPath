import { useNavigate } from "react-router-dom";

export default function AccountProgress() {
  const navigate = useNavigate();

  const lessonTiles = [
    { number: "1", color: "#FFB380" },
    { number: "2", color: "#C9B1FF" },
    { number: "3", color: "#A8E6CF" },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton} aria-label="Back">
          ‹
        </button>
        <h1 style={styles.title}>Progress</h1>
        <div style={{ width: 36 }} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Lessons Completed</h2>
        <div style={styles.lessonsRow}>
          {lessonTiles.map((tile) => (
            <div key={tile.number} style={{ ...styles.lessonTile, backgroundColor: tile.color }}>
              <span style={styles.lessonNumber}>{tile.number}</span>
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Letters Perfected</h2>
        <div style={styles.emptySection} />

        <h2 style={styles.sectionTitle}>Letters that need work</h2>
        <div style={styles.emptySection} />
      </div>

      {/* Bottom Camera Button (visual placeholder) */}
      <div style={styles.bottomBar}>
        <button
          onClick={() => console.log("Camera button pressed")}
          style={styles.cameraButton}
          aria-label="Camera"
          title="Camera"
        >
          📷
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FDF6EC",
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
    fontSize: 28,
    cursor: "pointer",
    lineHeight: 1,
    padding: 4,
    color: "#1A1A1A",
  },
  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
    color: "#1A1A1A",
  },
  content: {
    flex: 1,
    padding: "0 24px 24px",
  },
  sectionTitle: {
    margin: "20px 0 12px",
    fontSize: 16,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  lessonsRow: {
    display: "flex",
    gap: 12,
  },
  lessonTile: {
    width: 64,
    height: 64,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  lessonNumber: {
    fontSize: 24,
    fontWeight: 800,
    color: "#1A1A1A",
  },
  emptySection: {
    minHeight: 40,
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
    fontSize: 24,
    boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
  },
};
