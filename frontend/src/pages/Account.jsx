import "../App.css";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser, FaTrophy } from "react-icons/fa";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import rainbowPen from "../assets/rainbow-pen.png";
import animalPen from "../assets/animal-pen.png";

// Map badge types to local images
const badgeImages = {
  "colors": rainbowPen,
  "animals": animalPen,
  "rainbow-pen": rainbowPen,
  "animal-pen": animalPen,
};

// Fallback colors for badges without images
const badgeColors = [
  "#FF6B6B",
  "#FFD93D",
  "#FFF3B0",
  "#6BCB77",
  "#A8D8EA",
  "#C9B1FF",
];

export default function Account() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSettings = () => navigate("/settings");
  const handleProgress = () => navigate("/account/progress");

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await apiFetch("/api/me");
        setProfile(user.data);

        const badgeData = await apiFetch("/api/badges");
        setBadges(badgeData.data || []);
      } catch (err) {
        console.error("Failed to load account", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Get badge image based on badge type or name
  const getBadgeImage = (badge) => {
    if (badge.icon_url) return badge.icon_url;
    const key = (badge.badge_type || badge.name || "").toLowerCase();
    return badgeImages[key] || null;
  };

  return (
    <div className="acct-container">
      {/* Header */}
      <h1 className="acct-title">Profile</h1>

      <div className="acct-scroll">
        {/* Profile Info Row */}
        <div className="acct-profileRow">
          <div className="acct-avatarCircle" aria-hidden="true">
            👤
          </div>

          <div className="acct-profileInfo">
            <div className="acct-profileName">
              {loading ? "Loading..." : (
                profile ? `${profile.first_name} ${profile.last_name}` : "Guest"
              )}
            </div>

            <div className="acct-profileAge">
              {profile?.age ? `${profile.age} years old` : ""}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="acct-buttonsContainer">
          <button
            className="acct-actionButton"
            onClick={handleSettings}
          >
            Settings
          </button>

          <button
            className="acct-actionButton"
            onClick={handleProgress}
          >
            Progress
          </button>
        </div>

        {/* Badges Section */}
        <h2 className="acct-sectionTitle">Badges ({badges.length})</h2>

        <div className="acct-badgesGrid">
          {badges.length > 0 ? (
            badges.map((badge, index) => {
              const imgSrc = getBadgeImage(badge);
              return (
                <div
                  key={badge.id || index}
                  className="acct-badgeTile acct-badgeTile--earned"
                  style={{ backgroundColor: badgeColors[index % badgeColors.length] }}
                  title={badge.name}
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt={badge.name} className="acct-badgeImage" />
                  ) : (
                    <FaTrophy className="acct-badgeIcon" />
                  )}
                </div>
              );
            })
          ) : (
            <p className="acct-noBadges">
              {loading ? "Loading badges..." : "Complete lessons to earn badges!"}
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
  );
}