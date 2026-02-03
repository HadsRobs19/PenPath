import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaKey } from 'react-icons/fa';
import "../App.css";
import logo from '../assets/logo.png';

/*
* <summary>
* Handles front end password reset 
*   -> setting up form data -> always create a useState const with a [current state, setter function] (new password and confirming/retyping new password)
*   -> parses inputed data into JSON to make storing easier (using http POST response to set up and store readable data in JSON ) in try...catch for error checking
*          * if response does not go through or throws anything other than a 200 ok response code (data was found and returned), an error will appear
*          * successful log in; user is navigated to lessons page or home page when successful
*   -> setting up visual form with the blocks made: set gradient bg, form for new password and confirmed new password with FaUser FaKey icon
*   -> sends user back to login to use new password (url/login)
*/

const PWReset = () => {
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:8080/reset-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    newPassword,
                    confirmNewPassword,
                }),
            });

            if(!res.ok){
                throw(new Error("invalid password"));
            }

            const data = await res.json();
            console.log("New password created: ", data);
        }catch(err){
            setError(error.message);
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="app-bg">
            <div className="login-content">
                <div className="pw-reset-logo">
                    <img 
                        src={logo} 
                        alt="Pen Path logo" 
                        className="logo"
                    />
                </div>
                <h1 className="login-heading">Password Reset</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FaKey className="input-icon" />
                        <input  
                            type="password"
                            placeholder="Password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaKey className="input-icon" />
                        <input
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button disabled={loading} onClick={() => navigate('/login')}>
                        {loading ? 'Creating new password...' : 'Back to Login'}
                    </Button>
                    {error && <p>{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default PWReset;