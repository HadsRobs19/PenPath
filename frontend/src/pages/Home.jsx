import "../App.css";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import logo from "../assets/logo.png";
import { FaHome, FaCamera, FaUser, FaBook, FaScroll } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

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
          {/* Lesson 1: Colors */}
          <Button
            className="lesson-button lesson-rainbow"
            onClick={() => navigate("/lesson/colors")}
          >
            <div className="lesson-title">Lesson 1</div>
            <div className="lesson-subtitle">Colors</div>
          </Button>

          {/* Tutorial Button */}
          <div className="tutorial-path">
            <Button
              className="lesson-button lesson-tan"
              onClick={() => navigate("/tutorial")}
            >
              Tutorial
            </Button>
          </div>

          {/* Reading & Writing Path Icons */}
          <div className="icon-path">
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
                {/*TODO: add the rainbow pen path guy; probably not in icon-node div to make it just a clean image with no background */}
            </button>
          </div>

          {/* Lesson 2: Animals */}
          <Button
            className="lesson-button lesson-brown"
            onClick={() => navigate("/lesson/2")}
          >
            <div className="lesson-title">Lesson 2</div>
            <div className="lesson-subtitle">Animals</div>
          </Button>

          {/*TODO: include above icon path class under Animals and give Animals checkpoint a different path name */}
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="bottom-nav">
        <button onClick={() => navigate("/home")}>
          <FaHome />
        </button>

        {/*TODO: work on front end camera page */}
        <button onClick={() => navigate("/camera")}>
          <FaCamera />
        </button>

        {/*TODO: work on front end user account page */}
        <button onClick={() => navigate("/account")}>
          <FaUser />
        </button>
      </footer>
    </div>
  );
};

export default Home;
