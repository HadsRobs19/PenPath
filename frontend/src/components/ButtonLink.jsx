import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const MyButtonLink = () => {
    return (
        <Link to="/forgot-password" className="link-button-style">
            Forgot password?
        </Link>
    )
}

export default MyButtonLink;