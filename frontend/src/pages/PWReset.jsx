import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaKey } from 'react-icons/fa';
import "../App.css";
import logo from '../assets/logo.png';

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