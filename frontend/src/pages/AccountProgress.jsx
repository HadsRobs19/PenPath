import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser, FaCheck, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

// Lesson colors for the tiles
const lessonColors = ["#FFB380", "#C9B1FF", "#A8E6CF", "#FFD93D", "#FF6B6B", "#A8D8EA"];

export default function AccountProgress() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await apiFetch("/api/progress");
        setProgress(response.data);
      } catch (err) {
        console.error("Failed to load progress", err);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  // Generate lesson tiles based on completed count
  const getLessonTiles = () => {
    const completed = progress?.lessons_completed || 0;
    const tiles = [];
    for (let i = 1; i <= Math.max(completed, 3); i++) {
      tiles.push({
        number: i,
        color: lessonColors[(i - 1) % lessonColors.length],
        completed: i <= completed
      });
    }
    return tiles;
  };

  return (
    <div className="acct-container">
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
          {/* Average Accuracy */}
          {progress?.average_accuracy > 0 && (
            <div style={styles.accuracyCard}>
              <span style={styles.accuracyLabel}>Average Accuracy</span>
              <span style={styles.accuracyValue}>
                {Math.round(progress.average_accuracy)}%
              </span>
            </div>
          )}

          {/* Lessons Completed */}
          <h2 style={styles.sectionTitle}>
            Lessons Completed ({progress?.lessons_completed || 0})
          </h2>
          <div style={styles.lessonsRow}>
            {loading ? (
              <p style={styles.loadingText}>Loading...</p>
            ) : (
              getLessonTiles().map((tile) => (
                <div
                  key={tile.number}
                  style={{
                    ...styles.lessonTile,
                    backgroundColor: tile.completed ? tile.color : "#E5E5E5",
                    opacity: tile.completed ? 1 : 0.5
                  }}
                >
                  <span style={styles.lessonNumber}>{tile.number}</span>
                  {tile.completed && (
                    <FaCheck style={styles.checkIcon} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Letters Perfected */}
          <h2 style={styles.sectionTitle}>
            Letters Perfected ({progress?.letters_mastered?.length || 0})
          </h2>
          <div style={styles.lettersRow}>
            {loading ? (
              <p style={styles.loadingText}>Loading...</p>
            ) : progress?.letters_mastered?.length > 0 ? (
              progress.letters_mastered.map((letter) => (
                <div key={letter} style={styles.letterTile}>
                  <span style={styles.letterText}>{letter}</span>
                  <FaCheck style={styles.letterCheckIcon} />
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>Keep practicing to perfect letters!</p>
            )}
          </div>

          {/* Letters that need work */}
          <h2 style={styles.sectionTitle}>
            Letters that need work ({progress?.letters_needing_work?.length || 0})
          </h2>
          <div style={styles.lettersRow}>
            {loading ? (
              <p style={styles.loadingText}>Loading...</p>
            ) : progress?.letters_needing_work?.length > 0 ? (
              progress.letters_needing_work.map((letter) => (
                <div key={letter} style={{ ...styles.letterTile, ...styles.letterTileNeedsWork }}>
                  <span style={styles.letterText}>{letter}</span>
                  <FaTimes style={styles.letterNeedsWorkIcon} />
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>Great job! No letters need extra work.</p>
            )}
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
  accuracyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "#6B7280",
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "#22C55E",
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
    flexWrap: "wrap",
  },
  lessonTile: {
    width: 64,
    height: 64,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    position: "relative",
  },
  lessonNumber: {
    fontSize: 24,
    fontWeight: 800,
    color: "#1A1A1A",
  },
  checkIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    fontSize: 12,
    color: "#22C55E",
  },
  lettersRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  letterTile: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#D1FAE5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  letterTileNeedsWork: {
    backgroundColor: "#FEE2E2",
  },
  letterText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  letterCheckIcon: {
    fontSize: 10,
    color: "#22C55E",
  },
  letterNeedsWorkIcon: {
    fontSize: 10,
    color: "#EF4444",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
};
