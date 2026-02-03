import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

/*
* <summary>
* Handles front end for confirmation screen to let users know their password has been successfully changed
*   -> return: sets up background gradient, creates forgot content for screen content layout, and displays text box with confirmation message
*       * user will be redirected to login (url/login)
*/

const PWResetConfirm = () => {
    const navigate = useNavigate();

    return (
        <div className="app-bg">
            <div className="forgot-content">
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