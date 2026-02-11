import "../App.css";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const navigate = useNavigate();

  const handleSettings = () => navigate("/settings");
  const handleProgress = () => navigate("/account/progress"); // you’ll add this route later
  const handleCameraPress = () => {
    console.log("Camera button pressed");
    // optional: navigate("/scan/camera");
  };

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
            <div className="acct-profileName">Daniel Jones</div>
            <div className="acct-profileAge">8 years old</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="acct-buttonsContainer">
          <button className="acct-actionButton" onClick={handleSettings}>
            Settings
          </button>

          <button className="acct-actionButton" onClick={handleProgress}>
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

      {/* Bottom Camera Button */}
      <div className="acct-bottomBar">
        <button className="acct-cameraButton" onClick={handleCameraPress} aria-label="Camera">
          📷
        </button>
      </div>
    </div>
  );
}
