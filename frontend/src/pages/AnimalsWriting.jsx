import "../App.css";
import { useNavigate } from "react-router-dom";
import WritingBox from "../components/WritingBox";
import Button from "../components/Button";
import animalAudio1 from "../assets/audio/meow.mp3";
import animalAudio2 from "../assets/audio/woof.mp3";
import { useAudio } from "../hooks/useAudio";
import { useRef } from "react";
import { supabase } from "../lib/Client";
import { apiFetch } from "../lib/api";

const AnimalsWriting = () => {
  const navigate = useNavigate();

  const playOne = useAudio(animalAudio1);
  const playTwo = useAudio(animalAudio2);

  const box1Ref = useRef(null);
  const box2Ref = useRef(null);

  const uploadDrawing = async (blob, lessonId, stepId, attempt) => {
    if (!blob) return null;

    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        console.error("User not authenticated");
        return null;
      }

      const path = `${user.id}/${lessonId}/${stepId}/${attempt}.png`;

      const { error } = await supabase.storage
        .from("user-drawings-production")
        .upload(path, blob, {
          contentType: "image/png",
          upsert: true
        });

      if (error) {
        console.error("Upload failed:", error);
        return null;
      }

      const { data: urlData } = await supabase.storage
        .from("user-drawings-production")
        .createSignedUrl(path, 60 * 60 * 24);

      return urlData?.signedUrl || null;

    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  return (
    <div className="animals-writing-bg">
      <div className="animals-writing-content">
        <h2 className="animals-writing-header">
          Write what you hear in cursive!
        </h2>

        {/* Prompt row */}
        <div className="animals-audio-row">
          <div className="animals-audio-card">
            <span className="animals-number">1.</span>
            <button className="animals-audio-btn" onClick={playOne}>
              🔊
            </button>
          </div>

          <div className="animals-audio-card">
            <span className="animals-number">2.</span>
            <button className="animals-audio-btn" onClick={playTwo}>
              🔊
            </button>
          </div>
        </div>

        {/* Writing boxes */}
        <div className="animals-writing-boxes">
          <WritingBox ref={box1Ref} />
          <WritingBox ref={box2Ref} />
        </div>

        {/* Buttons */}
        <div className="animals-button-row">
          <Button
            className="animals-writing-exit"
            onClick={() => navigate("/home")}
          >
            Exit
          </Button>

          <Button
            className="animals-writing-next"
            onClick={async () => {

              const blob1 = await box1Ref.current?.exportDrawing();
              const blob2 = await box2Ref.current?.exportDrawing();

              const url1 = await uploadDrawing(blob1, "animals", "step1", Date.now());
              const url2 = await uploadDrawing(blob2, "animals", "step2", Date.now());

              console.log("Drawing URLs:", url1, url2);

              await apiFetch("/api/progress/writing", {
                method: "POST",
                body: JSON.stringify({
                  lesson_step_id: "animals-writing",
                  accuracy_percent: 100,
                  time_spent_seconds: 20,
                  is_completed: true,
                  client_event_id: crypto.randomUUID(),
                  completed_at: new Date().toISOString()
                })
              });

              navigate("/animals/checkpoint");
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalsWriting;