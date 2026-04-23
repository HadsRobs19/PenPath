import "../App.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import rainbowPen from "../assets/rainbow-pen.png";
import { userStorage, STORAGE_KEYS } from "../lib/userStorage";

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
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const lessonComplete =
      userStorage.getItem(STORAGE_KEYS.LESSON1_COMPLETE) === "true";
    // probably better than a quick page change for children
    if (!lessonComplete) {
      setShowToast(true);

      const timer = setTimeout(() => {
        navigate("/home");
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleExit = () => {
    navigate("/home");
  };

  const handleNextLesson = () => {
    userStorage.setItem(STORAGE_KEYS.COLORS_LESSON, "true");
    navigate("/animals/reading");
  };

  return (
    <div className="colors-badge-bg">
        {showToast && (
            <div className="lesson-toast">
                Finish the lesson first!
            </div>
        )}
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
    </div>
  );
};

export default ColorsBadge;
