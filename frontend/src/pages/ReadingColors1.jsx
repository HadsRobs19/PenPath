import "../App.css";
import { useNavigate } from 'react-router-dom';
import TracingBox from "../components/TracingBox";
import Button from '../components/Button';

const ReadingColors1 = () => {
    const navigate = useNavigate();

    return(
        <div className="reading1-bg">
            <div className="reading1-content">
                <div className="reading1-heading">
                    <h1>Follow The Flow</h1>
                </div>

                <TracingBox
                    svgPath="
                    M20 70
                    C 60 20, 120 20, 150 70
                    S 220 120, 260 70
                    "
                />
            </div>
        </div>
    );
}
export default ReadingColors1;