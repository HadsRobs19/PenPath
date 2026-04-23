import "../App.css";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser, FaTrophy } from "react-icons/fa";
import { useEffect, useState } from "react";
import { supabase } from "../lib/Client";
import { useSettings } from "../context/SettingsContext";
import { userStorage, STORAGE_KEYS } from "../lib/userStorage";
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

// Get earned badges from user-scoped storage
function getEarnedBadges() {
  const badges = [];
  if (userStorage.getItem(STORAGE_KEYS.COLORS_LESSON) === "true" ||
      userStorage.getItem(STORAGE_KEYS.LESSON1_COMPLETE) === "true") {
    badges.push({
      id: "colors-badge",
      name: "Colors Master",
      badge_type: "colors",
      description: "Completed the Colors lesson",
    });
  }
  if (userStorage.getItem(STORAGE_KEYS.LESSON2_COMPLETE) === "true" ||
      userStorage.getItem(STORAGE_KEYS.ANIMALS_LESSON) === "true") {
    badges.push({
      id: "animals-badge",
      name: "Animals Expert",
      badge_type: "animals",
      description: "Completed the Animals lesson",
    });
  }
  return badges;
}

export default function Account() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSettings = () => navigate("/settings");
  const handleProgress = () => navigate("/account/progress");

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get user data from Supabase Auth (where it's actually stored)
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
        const cachedAvatar = userStorage.getItem(STORAGE_KEYS.AVATAR_URL);
        if (cachedAvatar) {
          setAvatarUrl(`${cachedAvatar}?t=${Date.now()}`);
        } else if (avatarFromMeta) {
          userStorage.setItem(STORAGE_KEYS.AVATAR_URL, avatarFromMeta);
          setAvatarUrl(`${avatarFromMeta}?t=${Date.now()}`);
        }

        // Parse name - could be "First Last" or just stored as "name"
        let firstName = metadata.first_name || "";
        let lastName = metadata.last_name || "";

        // If name is stored as a single field, split it
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
          email: user.email,
        });

        // Load badges from localStorage (earned through lesson completion)
        const earnedBadges = getEarnedBadges();
        setBadges(earnedBadges);

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
          <div className="acct-avatarCircle">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{ width: "100%", height: "100%", borderRadius: "999px", objectFit: "cover" }}
              />
            ) : (
              <FaUser size={26} color="#9CA3AF" />
            )}
          </div>

          <div className="acct-profileInfo">
            <div className="acct-profileName">
              {loading ? "Loading..." : (
                profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Guest" : "Guest"
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