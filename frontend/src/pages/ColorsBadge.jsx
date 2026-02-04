import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const ColorsBadge = () => {
    return (
        <div className="colors-badge-bg">
            <div className="colors-badge-content">
                <h2 className="colors-badge-header">Your received a badge!</h2>
            </div>
        </div>
    )
}

export default ColorsBadge;