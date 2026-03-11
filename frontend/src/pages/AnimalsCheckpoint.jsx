import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WritingBox from "../components/WritingBox";
import Button from "../components/Button";
import checkpointAudio from "../assets/audio/moo.mp3";
import { useAudio } from "../hooks/useAudio";
import { apiFetch } from "../lib/api";

const AnimalsCheckpoint = () => {
    const navigate = useNavigate();
    const [attempted, setAttempted] = useState(false);
    const playCheckpoint = useAudio(checkpointAudio);

    const handleClaim = async () => {

    try {
        await apiFetch("/api/progress/writing", {
        method: "POST",
        body: JSON.stringify({
            lesson_step_id: "animals-checkpoint",
            accuracy_percent: 100,
            time_spent_seconds: 15,
            is_completed: true,
            client_event_id: crypto.randomUUID(),
            completed_at: new Date().toISOString()
        })
        });

    navigate("/animals/badge");

  } catch(err) {

    console.error("Checkpoint save failed:", err);
  }

};

    return (
        <div className="animals-checkpoint-bg">
            <div className="animals-checkpoint-content">
                <h2 className="animals-checkpoint-header">
                Animals Checkpoint
                </h2>

                <div className="animals-checkpoint-card">
                <p>
                    Listen to the sound, then write the sentence you hear in cursive!
                </p>

                <button
                    className="animals-audio-btn large"
                    onClick={() => {
                        playCheckpoint();
                        setAttempted(true);
                    }}
                >
                        🔊
                </button>
            </div>
                <div className="animals-checkpoint-write">
                    <WritingBox />
                </div>

                <div className="animals-button-row">
                <Button className="animals-checkpoint-back"onClick={() => navigate("/animals/reading")}>
                    Back
                </Button>

                <Button
                    className="animals-checkpoint-claim"
                    disabled={!attempted}
                    onClick={handleClaim}
                >
                    Claim Badge
                </Button>
                </div>
            </div>
        </div>
    );
};

export default AnimalsCheckpoint;
