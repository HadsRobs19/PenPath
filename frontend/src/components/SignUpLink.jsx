import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const SignUpLink = () => {
    return (
        <Link to="/signup" className="sign-up-link-style">
            Sign Up
        </Link>
    )
}

export default SignUpLink;