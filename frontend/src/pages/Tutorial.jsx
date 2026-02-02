import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import demoVideo from '../assets/demo02.mp4';
import logo from '../assets/logo.png';
import { FaHome, FaCamera, FaUser } from "react-icons/fa";

// Tutorial video page: users can choose to view the tutorial on how to work the app before beginning a lesson! PLACEHOLDER video set until we have a app flow screen recording to use
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
                    onClick={() => navigate('/lesson/colors')}
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