import "../App.css";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import logo from "../assets/logo.png";
import { FaHome, FaCamera, FaUser, FaBook, FaScroll } from "react-icons/fa";
import { useEffect, useState } from "react";

const Home = () => {
  const navigate = useNavigate();

  const [lesson1Complete, setLesson1Complete] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("lesson1Complete");
    setLesson1Complete(completed === "true");
  }, []);

  return (
    <div className="home-bg">
      <div className="home-content">
        {/* Logo */}
        <div className="home-logo">
          <img
            src={logo}
            alt="Pen Path logo"
            className="logo"
          />
        </div>

        {/* Lesson Path */}
        <div className="lesson-path">
          <svg
            className="lesson-path-svg"
            viewBox="0 0 300 900"
            preserveAspectRatio="none"
          >
            <path
              d="
                M150 0
                C 50 150, 250 300, 150 450
                C 50 600, 250 750, 150 900
              "
              fill="none"
              stroke="#6b707aff"
              strokeWidth="6"
              strokeDasharray="1 22"
              strokeLinecap="round"
            />
          </svg>

          {/* Lesson 1: Colors */}
          <div className="path-step step-1">
            <Button
              className="lesson-button lesson-rainbow"
              onClick={() => navigate("/lesson/colors")}
            >
              <div className="lesson-title">Lesson 1</div>
              <div className="lesson-subtitle">Colors</div>
            </Button>
          </div>

          {/* Tutorial Button */}
          <div className="path-step step-2">
            <Button
              className="lesson-button lesson-tan"
              onClick={() => navigate("/tutorial")}
            >
              Tutorial
            </Button>
          </div>

          {/* Reading & Writing Path Icons */}
          <div className="path-step step-3 icons-step">
            <button
              className="icon-node"
              onClick={() => navigate("/reading")}
              aria-label="Reading"
            >
              <FaBook />
            </button>

            <button
              className="icon-node"
              onClick={() => navigate("/writing")}
              aria-label="Writing"
            >
              <FaScroll />
            </button>

            <button
              className="icon-node color-pen"
              onClick={() => navigate("/checkpoint")}
            >
              {/* TODO: add the rainbow pen path guy */}
            </button>
          </div>

          {/* Lesson 2: Animals */}
          <div className="path-step step-4">
            <Button
              className="lesson-button lesson-brown path-right"
              disabled={!lesson1Complete}
              onClick={() => navigate("/lesson/2")}
            >
              <div className="lesson-title">Lesson 2</div>
              <div className="lesson-subtitle">
                {lesson1Complete ? "Animals" : "Locked 🔒"}
              </div>
            </Button>
          </div>

          {/* Reading & Writing Path Icons */}
          <div className="path-step step-5 icons-step">
            <button
              className="icon-node"
              onClick={() => navigate("/reading")}
              aria-label="Reading"
            >
              <FaBook />
            </button>

            <button
              className="icon-node"
              onClick={() => navigate("/writing")}
              aria-label="Writing"
            >
              <FaScroll />
            </button>

            <button
              className="icon-node color-pen"
              onClick={() => navigate("/checkpoint")}
            >
              {/* TODO: add the rainbow pen path guy */}
            </button>
          </div>

          {/* TODO: include above icon path class under Animals */}
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="bottom-nav">
        <button onClick={() => navigate("/home")}>
          <FaHome />
        </button>

        <button onClick={() => navigate("/camera")}>
          <FaCamera />
        </button>

        <button onClick={() => navigate("/account")}>
          <FaUser />
        </button>
      </footer>
    </div>
  );
};

export default Home;
