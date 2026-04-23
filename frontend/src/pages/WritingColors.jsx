import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useState } from 'react';
import F from "../assets/F.png";
import N from "../assets/N.png";
import { apiFetch } from "../lib/api";
import { userStorage, STORAGE_KEYS } from "../lib/userStorage";

const WritingColors = () => {
    const navigate = useNavigate();

    const [fInput, setFInput] = useState("");
    const [nInput, setNInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const isCorrect =
        fInput.toLowerCase() === "f" &&
        nInput.toLowerCase() === "n";

    return (
        <div className="writing1-bg">
            <div className="writing1-content">
                <h2 className="writing1-heading">Read & Reveal!</h2>
                <div className="letter-row">
                    <div className="letter-card">
                        <img  
                            src={F}
                            alt="Cursive lowercase F"
                        />
                        <input
                            type="text"
                            maxLength={1}
                            value={fInput}
                            onChange={(e) => setFInput(e.target.value)}
                            placeholder="Type here"
                        />
                    </div>
                    <div className="letter-card">
                        <img
                            src={N}
                            alt="Cursive lowercase N"
                        />
                        <input 
                            type="text"
                            maxLength={1}
                            value={nInput}
                            onChange={(e) => setNInput(e.target.value)}
                        />  
                    </div>
                </div>

                {/* Error message */}
                {error && <p style={{ color: "#DC2626", textAlign: "center", marginBottom: 12 }}>{error}</p>}

                <div className="writing-button-row">
                    <div className="back">
                        <Button className="back-button" onClick={() => navigate('/home')}>
                            Exit
                        </Button>
                    </div>

                    <div className="writing-next">
                        <Button
                            className="write-next-button"
                            disabled={!isCorrect || saving}
                            onClick={async () => {
                                setSaving(true);
                                setError(null);

                                try {
                                    await apiFetch("/api/progress/writing", {
                                        method: "POST",
                                        body: JSON.stringify({
                                            lesson_step_id: "colors-writing-step",
                                            accuracy_percent: 100,
                                            time_spent_seconds: 10,
                                            is_completed: true,
                                            client_event_id: crypto.randomUUID(),
                                            completed_at: new Date().toISOString()
                                        })
                                    });

                                    userStorage.setItem(STORAGE_KEYS.COLORS_WRITING, "true");
                                    navigate("/colors/checkpoint");
                                } catch (err) {
                                    console.error("Progress save failed:", err);
                                    setError("Failed to save progress. Please try again.");
                                } finally {
                                    setSaving(false);
                                }
                            }}
                        >
                            {saving ? "Saving..." : "Next"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WritingColors;