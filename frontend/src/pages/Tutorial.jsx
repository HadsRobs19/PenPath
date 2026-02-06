import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import demoVideo from '../assets/videos/demo02.mov';
import logo from '../assets/logo.png';
import { FaHome, FaCamera, FaUser } from "react-icons/fa";

/*
* <summary>
* Front-end tutorial video page for app introduction
*   -> displays centered logo and instructional text above video player
*   -> video element is a placeholder until a full app flow recording is available
*       * supports controls, looping, muted autoplay, and fullscreen on click
*   -> "Begin Lesson" button navigates user to the first lesson (Colors)
*   -> bottom navigation footer includes buttons for Home, Camera, and Account pages
*       * Camera and Account pages are placeholders for future development
*   -> layout uses gradient background and centered content consistent with app design
*/

const Tutorial = () => {
    const navigate = useNavigate();

    return (
        <div className="home-bg">
            <div className="tutorial-content">
                <div className="tutorial-logo">
                    <img 
                        src={logo} 
                        alt="Pen Path logo" 
                        className="logo"
                    />
                </div>
                <div className="tutorial-text">
                    <h1>View the tutorial video below to get started</h1>
                </div>
                <video
                    src={demoVideo}
                    controls
                    onClick={e => e.currentTarget.requestFullscreen()}
                    loop
                    muted
                    playsInline
                    className="tutorial-video-player"
                />

                <Button
                    className="lesson-button lesson-black"
                    onClick={() => navigate('/colors/reading')}
                >
                    Begin Lesson
                </Button>
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

export default Tutorial;