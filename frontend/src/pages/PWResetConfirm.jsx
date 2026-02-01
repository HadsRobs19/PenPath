import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const PWResetConfirm = () => {
    const navigate = useNavigate();

    return (
        <div className="app-bg">
            <div className="login-content">
                <div className="confirm-pw-logo">
                    <img
                        src={logo}
                        alt="Pen Path logo"
                        className="logo"
                    />
                </div>
                <h1 className="login-heading">Reset Password</h1>
                <div className="email-sent-box">
                    <p>
                        Your password has been changed.
                    </p>
                </div>
                <Button onClick={() => navigate('/login')} >
                    Back to Login
                </Button>
            </div>
        </div>
    )
}

export default PWResetConfirm;