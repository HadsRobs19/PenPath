import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const ReadingColors1 = () => {
    const navigate = useNavigate();

    return(
        <div className="reading1-bg">
            <div className="reading1-heading">
                <h1>Follow The Flow</h1>
            </div>
        </div>
    );
}
export default ReadingColors1;