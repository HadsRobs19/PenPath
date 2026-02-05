import "../App.css";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import TracingBox from "../components/TracingBox";
import { letterPaths } from "../components/letterPaths";
import Button from '../components/Button';

/*
* <summary>
* Front-end page for tracing the letter 'C'
*   -> displays heading and SVG tracing boxes using letterPaths.Cc
*   -> includes Exit button (goes to home) and Next button (proceeds to writing lesson)
*   -> buttons are aligned to opposite ends of the content area
*   -> overall layout uses gradient background and centered content consistent with app design
*/

const ReadingColors = () => {
    const navigate = useNavigate();
    const [completedCount, setCompletedCount] = useState(0);

    const totalBoxes = letterPaths.Cc.length + letterPaths.Dd.length;

    const handleTraceComplete = () => {
        setCompletedCount((prev) => prev + 1);
    };

    const isComplete = completedCount >= totalBoxes;
  return (
    <div className="reading1-bg">
        <div className="reading1-content">
            <h1 className="reading1-heading">Follow the Flow!</h1>
            <div className="Cc-row">
                {letterPaths.Cc.map((path, i) => (
                    <TracingBox key={i} svgPath={path} onComplete={handleTraceComplete}/>
                ))}
            </div>
            <div className="Dd-row">
                {letterPaths.Dd.map((path, i) => (
                    <TracingBox key={i} svgPath={path} onComplete={handleTraceComplete}/>
                ))}
            </div>

            <div className="button-row">
                <div className="exit">
                    <Button className="exit-button" onClick={() => navigate('/home')} >
                        Exit
                    </Button>
                </div>

                <div className="next">
                    <Button 
                        className="exit-button" 
                        disabled={!isComplete}
                        onClick={() => {
                            localStorage.setItem("colors_readingComplete", "true");
                            navigate("/colors/writing");
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
      </div>
  );
};

export default ReadingColors;