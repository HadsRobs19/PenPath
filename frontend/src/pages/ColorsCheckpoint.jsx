import "../App.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import colors from "../assets/colors.png";
import WritingBox from "../components/WritingBox";
import Button from '../components/Button';
import { apiFetch } from "../lib/api";
import { userStorage, STORAGE_KEYS } from "../lib/userStorage";

/*
* <summary>
* Colors checkpoint screen for the writing lesson
*   -> displays a reference image of the target letter
*   -> provides a freehand writing box for cursive practice
*   -> allows the learner to retry writing as needed
*   -> includes navigation to return to the lesson or claim a badge
*   -> designed as a progress checkpoint before rewarding the user
* </summary>
*/

const ColorsCheckpoint = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const readingDone = userStorage.getItem(STORAGE_KEYS.COLORS_READING) === "true";
    const writingDone = userStorage.getItem(STORAGE_KEYS.COLORS_WRITING) === "true";

    const canFinish = readingDone && writingDone;

    return (
        <div className="colors-checkpoint-bg">
            <div className="colors-checkpoint-content">
                <h1 className="colors-checkpoint-header">Colors Checkpoint</h1>
                <p className="colors-sentence">Write the following letter in cursive:</p>
                <div className="colors">
                    <img
                        src={colors}
                        alt="The letter B in standard handwriting"
                        className="b-image"
                    />    
                </div>
                <div className="write">
                    <WritingBox />
                </div>

                {/* Error message */}
                {error && <p style={{ color: "#DC2626", textAlign: "center", marginBottom: 12 }}>{error}</p>}

                <div className="colors-button-row">
                    <div className="check-back">
                        <Button className="check-back-button" onClick={() => navigate('/colors/writing')}>
                            Back
                        </Button>
                    </div>
                    <div className="check-claim">
                        <Button
                            className="check-claim-button"
                            disabled={!canFinish || saving}
                            onClick={async () => {
                                setSaving(true);
                                setError(null);

                                try {
                                    await apiFetch("/api/progress/writing", {
                                        method: "POST",
                                        body: JSON.stringify({
                                            lesson_step_id: "colors-checkpoint",
                                            accuracy_percent: 100,
                                            time_spent_seconds: 15,
                                            is_completed: true,
                                            client_event_id: crypto.randomUUID(),
                                            completed_at: new Date().toISOString()
                                        })
                                    });
                                    userStorage.setItem(STORAGE_KEYS.LESSON1_COMPLETE, "true");
                                    navigate("/colors/badge");
                                } catch(err) {
                                    console.error("Checkpoint save failed", err);
                                    setError("Failed to save progress. Please try again.");
                                } finally {
                                    setSaving(false);
                                }
                            }}
                        >
                            {saving ? "Saving..." : "Claim Badge"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ColorsCheckpoint;