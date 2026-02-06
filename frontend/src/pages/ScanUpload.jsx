import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
export default function Scan() {
  return (
    <div>
      <h1>Scan Page</h1>
      <p>Upload or scan handwriting here.</p>
    </div>
  );
}


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