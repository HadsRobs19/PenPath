import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const ScanUpload = () => {
    const navigate = useNavigate();

    return(
        <div className="account-bg">
            <div className="account-heading">
                <h1>Scan</h1>
            </div>
        </div>
    );
}
export default ScanUpload;