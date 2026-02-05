import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCamera, FaUser } from "react-icons/fa";
import rainbowPen from "../assets/rainbow-pen.png";

/*
 * <summary>
 * Colors Badge page (Colors Lesson)
 *   -> Displays a rainbow pen badge reward
 *   -> Badge starts blurred with "Click to reveal!" prompt
 *   -> Clicking reveals badge with animation
 *   -> Exit returns home, Next marks lesson complete
 *   -> Includes bottom navigation bar
 */

const ColorsBadge = () => {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleExit = () => {
    navigate("/home");
  };

  const handleNextLesson = () => {
    localStorage.setItem("colorsLessonComplete", "true");
    navigate("/home");
  };

  return (
    <div className="colors-badge-bg">
      <div className="colors-badge-content">
     
        <h1 className="colors-badge-header">You earned a badge!</h1>

        {!isRevealed && (
          <p className="colors-badge-subtitle">Click to reveal!</p>
        )}

        <div
          className="colors-badge-card"
          onClick={handleReveal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleReveal()}
          aria-label={isRevealed ? "Badge revealed" : "Click to reveal badge"}
        >
          <img
            src={rainbowPen}
            alt="Colors lesson rainbow pen badge"
            className={`colors-badge-image ${
              isRevealed
                ? "colors-badge-image--revealed"
                : "colors-badge-image--hidden"
            }`}
          />
        </div>

        <div className="colors-badge-buttons">
          <button className="colors-badge-btn" onClick={handleExit}>
            Exit
          </button>
          <button className="colors-badge-btn" onClick={handleNextLesson}>
            {isRevealed ? "Next Lesson" : "Next"}
          </button>
        </div>
      </div>

      <footer className="colors-badge-nav">
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

      <div className="colors-badge-home-indicator" />
    </div>
  );
};

export default ColorsBadge;
