import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MyButtonLink from '../components/ButtonLink';
import SignUpLink from '../components/SignUpLink';
import Button from '../components/Button';
import { FaUser, FaKey } from 'react-icons/fa';

const LogIn = () => {
    const navigate = useNavigate();
    
    // setting up form data -> always create a useState const with a [current state, setter function]
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // parses inputed data into JSON to make storing easier
    async function handleSubmit(e) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        // using http POST response to set up and store readable data in JSON 
        try {
            const res = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password})
            });

            // if response does not go through or throws anything other than a 200 ok response code (data was found and returned), an error will appear
            if(!res.ok){
                throw new Error('invalid credentials');
            }

            // successful log in; user is navigated to lessons page or home page when successful
            const data = await res.json();
            console.log('Logged in: ', data);
            navigate('/home');

        }catch(err) {
            setError(err.message);
        }finally {
            setLoading(false);
        }
    }

    // setting up visual form with the blocks made
    return (
        <div className="app-bg">
            <div className="login-content">
                <div className="login-logo">
                    <img 
                        src={logo} 
                        alt="Pen Path logo" 
                        className="logo"
                    />
                </div>
                <h1 className="login-heading">Log In</h1>
                <form onSubmit={handleSubmit} className="login-form">
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
                        <FaKey className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <MyButtonLink />

                    <Button disabled={loading} onClick={() => navigate('/home')}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </Button>
                    {error && <p>{error}</p>}
                </form>

                <p className="sign-in-link">Don't have an account? <SignUpLink /></p>
            </div>
        </div>
    );
}

export default LogIn;