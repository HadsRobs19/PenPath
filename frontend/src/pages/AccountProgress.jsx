import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser, FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { supabase } from "../lib/Client";

const lessonColors = ["#FFB380", "#C9B1FF", "#A8E6CF", "#FFD93D", "#FF6B6B", "#A8D8EA"];

// Total available lessons
const TOTAL_LESSONS = 3;

// Calculate age from birthday string
function calculateAge(birthday) {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Get completed lessons count from localStorage
function getCompletedLessonsCount() {
  let count = 0;
  if (localStorage.getItem("colorsLessonComplete") === "true" ||
      localStorage.getItem("lesson1Complete") === "true") {
    count++;
  }
  if (localStorage.getItem("lesson2Complete") === "true" ||
      localStorage.getItem("animalsLessonComplete") === "true") {
    count++;
  }
  return count;
}

// Circular Progress Bar Component
function CircularProgress({ percent, size = 120, strokeWidth = 10, color = "#4B7BE5" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 800, color: "#1A1A1A", fontFamily: "'Comfortaa', sans-serif" }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function AccountProgress() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        // Get user data from Supabase Auth
        const { data: authData, error } = await supabase.auth.getUser();

        if (error || !authData?.user) {
          console.error("Failed to get user:", error);
          setLoading(false);
          return;
        }

        const user = authData.user;
        const metadata = user.user_metadata || {};

        // Set avatar URL
        const avatarFromMeta = metadata.avatar_url;
        const cachedAvatar = localStorage.getItem("penpath_avatar_url");
        if (cachedAvatar) {
          setAvatarUrl(`${cachedAvatar}?t=${Date.now()}`);
        } else if (avatarFromMeta) {
          localStorage.setItem("penpath_avatar_url", avatarFromMeta);
          setAvatarUrl(`${avatarFromMeta}?t=${Date.now()}`);
        }

        // Parse name
        let firstName = metadata.first_name || "";
        let lastName = metadata.last_name || "";
        if (!firstName && metadata.name) {
          const nameParts = metadata.name.trim().split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }

        // Calculate age from birthday
        const age = calculateAge(metadata.birthday);

        setProfile({
          first_name: firstName,
          last_name: lastName,
          age: age,
        });

        // Get completed lessons from localStorage
        setLessonsCompleted(getCompletedLessonsCount());

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const progressPercent = Math.round((lessonsCompleted / TOTAL_LESSONS) * 100);

  const getLessonTiles = () => {
    const tiles = [];
    for (let i = 1; i <= TOTAL_LESSONS; i++) {
      tiles.push({
        number: i,
        name: i === 1 ? "Colors" : i === 2 ? "Animals" : "Foods",
        color: lessonColors[(i - 1) % lessonColors.length],
        completed: i <= lessonsCompleted,
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

        {/* Profile Info */}
        <div style={styles.profileRow}>
          <div style={styles.avatarCircle}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{ width: "100%", height: "100%", borderRadius: "999px", objectFit: "cover" }}
              />
            ) : (
              <FaUser size={20} color="#9CA3AF" />
            )}
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>
              {loading ? "Loading..." : (
                profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Guest" : "Guest"
              )}
            </div>
            <div style={styles.profileAge}>
              {profile?.age ? `${profile.age} years old` : ""}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Lessons Completed */}
          <h2 style={styles.sectionTitle}>Lessons Completed</h2>
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
                  <span style={styles.lessonName}>{tile.name}</span>
                  {tile.completed && <FaCheck style={styles.checkIcon} />}
                </div>
              ))
            )}
          </div>

          {/* Circular Progress */}
          <div style={styles.circularProgressSection}>
            <CircularProgress
              percent={progressPercent}
              size={140}
              strokeWidth={12}
              color="#4B7BE5"
            />
            <div style={styles.progressLabel}>
              <span style={styles.progressText}>Overall Progress</span>
              <span style={styles.progressSubtext}>
                {lessonsCompleted} of {TOTAL_LESSONS} lessons completed
              </span>
            </div>
          </div>

          {/* Encouragement Message */}
          <div style={styles.encouragementCard}>
            {lessonsCompleted === 0 ? (
              <p style={styles.encouragementText}>
                Start your first lesson to begin tracking your progress!
              </p>
            ) : lessonsCompleted < TOTAL_LESSONS ? (
              <p style={styles.encouragementText}>
                Great job! Keep going to complete all lessons!
              </p>
            ) : (
              <p style={styles.encouragementText}>
                Amazing! You've completed all available lessons!
              </p>
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
  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 24px 16px",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
  },
  profileName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  profileAge: {
    fontSize: 13,
    color: "#6B7280",
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
    fontFamily: "'PlayKiddo', sans-serif",
  },
  content: {
    flex: 1,
    padding: "0 24px 24px",
  },
  circularProgressSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: "24px",
    marginTop: 20,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  progressLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1A1A1A",
    fontFamily: "'Comfortaa', sans-serif",
  },
  progressSubtext: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "'Comfortaa', sans-serif",
  },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: 16,
    fontWeight: 700,
    color: "#1A1A1A",
  },
  tilesRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  lessonTile: {
    width: 90,
    height: 90,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    position: "relative",
    gap: 4,
  },
  lessonNumber: {
    fontSize: 24,
    fontWeight: 800,
    color: "#1A1A1A",
  },
  lessonName: {
    fontSize: 11,
    fontWeight: 600,
    color: "#4B5563",
  },
  checkIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    fontSize: 14,
    color: "#22C55E",
  },
  encouragementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: "16px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  encouragementText: {
    fontSize: 15,
    color: "#4B5563",
    margin: 0,
    textAlign: "center",
  },
  mutedText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
};
