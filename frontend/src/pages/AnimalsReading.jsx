import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const TARGET_SENTENCE = "a bug hid in the big rug. the bug loved to be snug.";

const AnimalsReading = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const isCorrect =
    input.trim().toLowerCase() === TARGET_SENTENCE;

  return (
    <div className="animals-reading-bg">
      <div className="animals-reading-content">
        <h2 className="animals-reading-header">Type what you see!</h2>

        <div className="animals-reading-card">
          <p className="animals-reading-instruction">
            Read the following cursive sentence and type it in the text box below:
          </p>

          <p className="animals-cursive-sample">
            A bug hid in the big rug. The bug loved to be snug.
          </p>
        </div>

        <textarea
          className="animals-reading-input"
          placeholder="Type what you see!"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="animals-button-row">
          <Button className="animals-reading-back" onClick={() => navigate("/animals/writing")}>
            Back
          </Button>

          <Button
            className="animals-reading-next"
            disabled={!isCorrect}
            onClick={() => navigate("/animals/writing")}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalsReading;
