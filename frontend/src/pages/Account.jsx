import "../App.css";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function Account() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);

  const handleSettings = () => navigate("/settings");
  const handleProgress = () => navigate("/account/progress");

  const handleCameraPress = () => {
    console.log("Camera button pressed");
    // optional: navigate("/scan/camera");
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await apiFetch("/me");
        setProfile(user.data);

        const badgeData = await apiFetch("/api/badges");
        setBadges(badgeData.data);
      } catch (err) {
        console.error("Failed to load account", err);
      }
    }

    loadProfile();
  }, []);

  const badgeColors = [
    "#FF6B6B",
    "#FFD93D",
    "#FFF3B0",
    "#6BCB77",
    "#A8D8EA",
    "#C9B1FF",
  ];

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
              {profile?.first_name} {profile?.last_name}
            </div>

            <div className="acct-profileAge">
              {profile?.age} years old
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
        <h2 className="acct-sectionTitle">Badges</h2>

        <div className="acct-badgesGrid">
          {badgeColors.map((color, index) => (
            <div
              key={index}
              className="acct-badgeTile"
              style={{ backgroundColor: color }}
            />
          ))}
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