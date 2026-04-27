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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const playCheckpoint = useAudio(checkpointAudio);

    const handleClaim = async () => {
        setSaving(true);
        setError(null);

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
            const errorMsg = err.message || "Unknown error";
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
                setError("Cannot connect to server. Check if the backend is running.");
            } else {
                setError(`Failed to save progress: ${errorMsg}`);
            }
        } finally {
            setSaving(false);
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

                {/* Error message */}
                {error && <p style={{ color: "#DC2626", textAlign: "center", marginBottom: 12 }}>{error}</p>}

                <div className="animals-button-row">
                <Button className="animals-checkpoint-back" onClick={() => navigate("/animals/reading")}>
                    Back
                </Button>

                <Button
                    className="animals-checkpoint-claim"
                    disabled={!attempted || saving}
                    onClick={handleClaim}
                >
                    {saving ? "Saving..." : "Claim Badge"}
                </Button>
                </div>
            </div>
        </div>
    );
};

export default AnimalsCheckpoint;
