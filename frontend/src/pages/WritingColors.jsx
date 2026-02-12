import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useState } from 'react';
import F from "../assets/F.png";
import N from "../assets/N.png";

const WritingColors = () => {
    const navigate = useNavigate();

    const [fInput, setFInput] = useState("");
    const [nInput, setNInput] = useState("");

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

                <div className="writing-button-row">
                    <div className="back">
                        <Button className="back-button" onClick={() => navigate('/home')}>
                            Exit
                        </Button>
                    </div>

                    <div className="writing-next">
                        <Button 
                            className="write-next-button"  
                            disabled={!isCorrect}
                            onClick={() => {
                                localStorage.setItem("colors_writingComplete", "true");
                                navigate("/colors/writing");
                            }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WritingColors;