import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaKey, FaCalendarAlt } from 'react-icons/fa';
import LogInLink from '../components/LogInLink';
import "../App.css";
import logo from '../assets/logo.png';

/*
* <summary>
* Handles front end sign up
*   -> setting up form data -> always create a useState const with a [current state, setter function] (name, username, email, birthday, password, confirm password)
*   -> parses inputed data into JSON to make storing easier (using http POST response to set up and store readable data in JSON ) in try...catch for error checking
*          * if response does not go through or throws anything other than a 200 ok response code (data was found and returned), an error will appear
*          * successful sign up; user is navigated to lessons page or home page when successful
*   -> return: setting up visual form with the blocks made: set gradient bg, form for name, username, email, birthday, password, and confirm password with FaCalendarAlt, FaUser and FaKey icons
*          * user is then directed to home page if account is successfully completed
*          * if account exists, user is directed to login
*/

const SignUp = () => {
    const navigate = useNavigate();

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

                    <Button type="submit" disabled={loading} onClick={() => navigate('/home')}>
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