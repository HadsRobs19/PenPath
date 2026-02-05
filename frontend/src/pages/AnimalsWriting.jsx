import "../App.css";
import { useNavigate } from "react-router-dom";
import WritingBox from "../components/WritingBox";
import Button from "../components/Button";
import animalAudio1 from "../assets/audio/meow.mp3";
import animalAudio2 from "../assets/audio/woof.mp3";
import { useAudio } from "../hooks/useAudio";

const AnimalsWriting = () => {
  const navigate = useNavigate();

  const playOne = useAudio(animalAudio1);
  const playTwo = useAudio(animalAudio2);

  return (
    <div className="animals-writing-bg">
      <div className="animals-writing-content">
        <h2 className="animals-writing-header">Write what you hear in cursive!</h2>

        {/* Prompt row */}
        <div className="animals-audio-row">
          <div className="animals-audio-card">
            <span className="animals-number">1.</span>
            <button className="animals-audio-btn" onClick={playOne}>🔊</button>
          </div>

          <div className="animals-audio-card">
            <span className="animals-number">2.</span>
            <button className="animals-audio-btn" onClick={playTwo}>🔊</button>
          </div>
        </div>

        {/* Writing boxes */}
        <div className="animals-writing-boxes">
          <WritingBox />
          <WritingBox />
        </div>

        {/* Buttons */}
        <div className="animals-button-row">
            <Button className="animals-writing-exit" onClick={() => navigate("/home")}>
                Exit
            </Button>
            <Button className="animals-writing-next" onClick={() => navigate("/animals/checkpoint")}>
                Next
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalsWriting;
