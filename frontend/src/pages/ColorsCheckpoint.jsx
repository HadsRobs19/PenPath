import "../App.css";
import { useNavigate } from 'react-router-dom';
import colors from "../assets/colors.png";
import WritingBox from "../components/WritingBox";
import Button from '../components/Button';

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

                <div className="colors-button-row">
                    <div className="check-back">
                        <Button className="check-back-button" onClick={() => navigate('/colors/writing')}>
                            Back
                        </Button>
                    </div>
                    <div className="check-claim">
                        <Button className="check-claim-button" onClick={() => navigate('/colors/badge')}>
                            Claim Badge
                        </Button>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default ColorsCheckpoint;