import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";
import animalBadge from "../assets/animal-pen.png";

/*
 * <summary>
 * Animals Badge page (Lesson 2) - Displays a badge reward that users can reveal by clicking
 *   -> Initially shows badge blurred with "Click to reveal!" prompt
 *   -> On click, reveals the badge with a drop shadow animation
 *   -> Exit button returns to home, Next Lesson navigates forward
 *   -> Includes bottom navigation bar
 * </summary>
 */

const AnimalsBadge = () => {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleExit = () => {
    navigate("/home");
  };

  const handleNextLesson = () => {
    // Mark lesson 2 as complete
    localStorage.setItem("lesson2Complete", "true");
    // Navigate to next lesson or home
    navigate("/home");
  };

  return (
    <div className="animals-badge-bg">
      <div className="animals-badge-content">
        {/* Title */}
        <h1 className="animals-badge-title">You received a badge</h1>

        {/* Subtitle - only show when not revealed */}
        {!isRevealed && (
          <p className="animals-badge-subtitle">Click to reveal!</p>
        )}

        {/* Badge Card */}
        <div
          className="animals-badge-card"
          onClick={handleReveal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleReveal()}
          aria-label={isRevealed ? "Badge revealed" : "Click to reveal badge"}
        >
          <img
            src={animalBadge}
            alt="Animals lesson badge"
            className={`animals-badge-image ${
              isRevealed
                ? "animals-badge-image--revealed"
                : "animals-badge-image--hidden"
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="animals-badge-buttons">
          <button className="animals-badge-btn" onClick={handleExit}>
            Exit
          </button>
          <button className="animals-badge-btn" onClick={handleNextLesson}>
            {isRevealed ? "Next Lesson" : "Next"}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="animals-badge-nav">
        <button onClick={() => navigate("/home")} aria-label="Home">
          <FaHome />
        </button>
        <button onClick={() => navigate("/scan")} aria-label="Camera">
          <FaCamera />
        </button>
        <button onClick={() => navigate("/account")} aria-label="Account">
          <FaUser />
        </button>
      </footer>

      {/* Home Indicator */}
      <div className="animals-badge-home-indicator" />
    </div>
  );
};

export default AnimalsBadge;
