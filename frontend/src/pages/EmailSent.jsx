import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

/*
* <summary>
* Handles front end for confirmation screen to let users know an email has been sent
*   -> return: sets up background gradient, reuses login content style structure (look at CSS for login styling), and displays a text box and a button to return to login
*       * user will not have a button to reset password, just a button to go back to the login and input changed password
*/

const EmailSent = () => {
    const navigate = useNavigate();

    return (
        <div className="app-bg">
            <div className="login-content">
                <div className="email-sent-logo">
                    <img
                        src={logo}
                        alt="Pen Path logo"
                        className="logo"
                    />
                </div>
                <h1 className="login-heading">Forgot Password</h1>
                <div className="email-sent-box">
                    <h2>Email Sent</h2>
                    <p>
                        If an account exists for that email, a password reset link has been sent.
                        Please check your inbox.
                    </p>
                </div>
                <Button onClick={() => navigate('/login')} >
                    Back to Login
                </Button>
            </div>
        </div>
    )
}

export default EmailSent;