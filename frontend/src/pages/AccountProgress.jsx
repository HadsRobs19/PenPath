import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser, FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

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

  const getLessonTiles = () => {
    const completed = progress?.lessons_completed || 0;
    const total = progress?.total_lessons || Math.max(completed, 3);
    const tiles = [];
    for (let i = 1; i <= Math.max(total, 3); i++) {
      tiles.push({
        number: i,
        color: lessonColors[(i - 1) % lessonColors.length],
        completed: i <= completed,
      });
    }
    return tiles;
  };

  const masteredCount = progress?.letters_mastered?.length || 0;
  const needsWorkCount = progress?.letters_needing_work?.length || 0;
  const totalLettersTouched = masteredCount + needsWorkCount;
  const masteryPercent =
    totalLettersTouched > 0 ? Math.round((masteredCount / totalLettersTouched) * 100) : 0;

  const lessonsCompleted = progress?.lessons_completed || 0;
  const totalLessons = progress?.total_lessons || 0;
  const lessonPercent =
    totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

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
          {/* Overall Progress Bar */}
          {totalLessons > 0 && (
            <div style={styles.card}>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Overall Completion</span>
                <span style={styles.cardValue}>{lessonPercent}%</span>
              </div>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${lessonPercent}%`,
                    backgroundColor: "#4B7BE5",
                  }}
                />
              </div>
              <span style={styles.subLabel}>
                {lessonsCompleted} of {totalLessons} lessons completed
              </span>
            </div>
          )}

          {/* Average Accuracy */}
          {progress?.average_accuracy > 0 && (
            <div style={styles.card}>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Average Accuracy</span>
                <span style={{ ...styles.cardValue, color: "#22C55E" }}>
                  {Math.round(progress.average_accuracy)}%
                </span>
              </div>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.round(progress.average_accuracy)}%`,
                    backgroundColor: "#22C55E",
                  }}
                />
              </div>
            </div>
          )}

          {/* Lessons Completed */}
          <h2 style={styles.sectionTitle}>
            Lessons Completed ({lessonsCompleted})
          </h2>
          <div style={styles.tilesRow}>
            {loading ? (
              <p style={styles.mutedText}>Loading...</p>
            ) : (
              getLessonTiles().map((tile) => (
                <div
                  key={tile.number}
                  style={{
                    ...styles.lessonTile,
                    backgroundColor: tile.completed ? tile.color : "#E5E5E5",
                    opacity: tile.completed ? 1 : 0.45,
                  }}
                >
                  <span style={styles.lessonNumber}>{tile.number}</span>
                  {tile.completed && <FaCheck style={styles.checkIcon} />}
                </div>
              ))
            )}
          </div>

          {/* Letter Mastery */}
          <h2 style={styles.sectionTitle}>Letter Mastery</h2>
          {loading ? (
            <p style={styles.mutedText}>Loading...</p>
          ) : totalLettersTouched > 0 ? (
            <div style={styles.card}>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Letters Perfected</span>
                <span style={styles.cardValue}>{masteryPercent}%</span>
              </div>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${masteryPercent}%`,
                    backgroundColor: "#A8E6CF",
                  }}
                />
              </div>
              <div style={styles.masteryStats}>
                <span style={styles.masteredBadge}>
                  ✓ {masteredCount} mastered
                </span>
                {needsWorkCount > 0 && (
                  <span style={styles.needsWorkBadge}>
                    ✗ {needsWorkCount} need practice
                  </span>
                )}
              </div>
              {/* Letter chips */}
              {masteredCount > 0 && (
                <div style={styles.chipsRow}>
                  {progress.letters_mastered.map((letter) => (
                    <div key={letter} style={styles.chipMastered}>
                      {letter}
                    </div>
                  ))}
                </div>
              )}
              {needsWorkCount > 0 && (
                <div style={{ ...styles.chipsRow, marginTop: 8 }}>
                  {progress.letters_needing_work.map((letter) => (
                    <div key={letter} style={styles.chipNeedsWork}>
                      {letter}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={styles.mutedText}>Complete lessons to track letter mastery.</p>
          )}
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: "14px 18px",
    marginBottom: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: "#4B5563",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "#1A1A1A",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  subLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    display: "block",
  },
  sectionTitle: {
    margin: "20px 0 12px",
    fontSize: 16,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  tilesRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 4,
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
  masteryStats: {
    display: "flex",
    gap: 12,
    marginTop: 10,
  },
  masteredBadge: {
    fontSize: 13,
    fontWeight: 600,
    color: "#16A34A",
  },
  needsWorkBadge: {
    fontSize: 13,
    fontWeight: 600,
    color: "#DC2626",
  },
  chipsRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  chipMastered: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#065F46",
  },
  chipNeedsWork: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#991B1B",
  },
  mutedText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
};
