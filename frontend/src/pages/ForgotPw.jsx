import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPw = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e){
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/forgot-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email})
            });

            if(!res.ok){
                throw new Error('invalid credentials');
            }

            navigate('/email-sent');

        }catch(err) {
            setError("Something went wrong. Try again.");
        }finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-bg">
            <div className="forgot-content">
                <div className="forgot-logo">
                    <img 
                        src={logo} 
                        alt="Pen Path logo" 
                        className="logo"
                    />
                </div>
                <h1 className="login-heading">Forgot Password</h1>
                <p className="helper-text">
                    Enter your email and we'll send you a reset link
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} onClick={() => navigate('/email-sent')}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    {error && <p className="error-text">{error}</p>}
                </form>
            </div>
        </div>
    )
}

export default ForgotPw;