import logo from '../assets/logo.png';
import "../App.css";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button';
import { FaUser } from 'react-icons/fa';

const CreateAccount = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
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
                body: JSON.stringify({ name, age })
            });

            if(!res.ok){
                throw new Error("Trouble creating your account");
            }

            navigate('/home');
        }catch(err){
            setError("New account not created, try again!");
        }finally{
            setLoading(false);
        }
    }

    return(
        <div className="app-bg">
            <div className="create-account-content">
                <div className="create-acc-logo">
                    <img 
                        src={logo} 
                        alt="Pen Path logo" 
                        className="logo"
                    />
                </div>
                <h1 className="login-heading">Create Bio</h1>
        
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
                            placeholder="Age"
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            required
                        />
                    </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Create Profile'}
                        </Button>
        
                        {error && <p className="error-text">{error}</p>}
                </form>
            </div>
        </div>
    )
}

export default CreateAccount;