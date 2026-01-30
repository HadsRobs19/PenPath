import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const LogInLink = () => {
    return (
        <Link to="/login" className="sign-up-link-style">
            Log In
        </Link>
    )
}

export default LogInLink;