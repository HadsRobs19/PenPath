import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaKey, FaCalendarAlt } from 'react-icons/fa';
import LogInLink from '../components/LogInLink';
import "../App.css";
import logo from '../assets/logo.png';

const SignUp = () => {
    const navigate = useNavigate();

    // same process as login, define field values and set them 
    const [name, setName] = useState('');
    const[username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e){
        e.preventDefault();
        
        if(password !== confirmPassword){
            setError('Passwords do not match!');
            return; 
        }
        setError(null);
        setLoading(true);

        try{
            const res = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    name,
                    username,
                    email, 
                    birthday,
                    password,
                    confirmPassword,
                }),
            });

            if(!res.ok){
                throw(new Error('invalid credentials'));
            }
            
            const data = await res.json();
            console.log('Account created: ', data);
            navigate('/home');
        }catch(err){
            setError(error.message);
        }finally{
            setLoading(false);
        }
    }

    return(
        <div className="app-bg">
            <div className="login-content">
                <div className="signup-logo">
                    <img 
                        src={logo} 
                        alt="Pen Path logo" 
                        className="logo"
                    />
                </div>
                <h1 className="login-heading">Sign Up</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input  
                            placeholder="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input  
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />    
                    </div>

                    <div className="input-group">
                        <FaCalendarAlt className="input-icon" />
                        <input  
                            type="date"
                            value={birthday}
                            onChange={e => setBirthday(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaKey className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaKey className="input-icon" />
                        <input  
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={loading} onClick={() => navigate('/create-account')}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    <p className="sign-in-link">Already have an account? <LogInLink /></p>

                    {error && <p className="error-text">{error}</p>}
                </form>
            </div>
        </div>
    )
}

export default SignUp;