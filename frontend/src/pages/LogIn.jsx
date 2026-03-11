import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MyButtonLink from '../components/ButtonLink';
import SignUpLink from '../components/SignUpLink';
import Button from '../components/Button';
import { FaUser, FaKey } from 'react-icons/fa';
import { supabase } from "../lib/Client";

const LogIn = () => {

    const navigate = useNavigate();

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');

    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(null);

    async function handleSubmit(e){

        e.preventDefault();

        setLoading(true);
        setError(null);

        try{

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if(error) throw error;

            console.log("Logged in:",data);

            navigate("/home");

        }catch(err){

            setError(err.message);

        }finally{

            setLoading(false);

        }
    }

    return (
        <div className="app-bg">

            <div className="login-content">

                <div className="login-logo">
                    <img src={logo} alt="Pen Path logo" className="logo"/>
                </div>

                <h1 className="login-heading">Log In</h1>

                <form onSubmit={handleSubmit} className="login-form">

                    <div className="input-group">
                        <FaUser className="input-icon"/>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e=>setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaKey className="input-icon"/>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e=>setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <MyButtonLink/>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </Button>

                    {error && <p>{error}</p>}

                </form>

                <p className="sign-in-link">
                    Don't have an account? <SignUpLink/>
                </p>

            </div>
        </div>
    )
}

export default LogIn;