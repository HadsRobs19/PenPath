import { useState } from 'react';
import logo from '../assets/logo.png'
import "../App.css";
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom';

const Welcome = () => {

  // set useNavigate to provide navigation logic to button onClick
  const navigate = useNavigate();

  return (
    <div className="app-bg">
      <div className="content">
        <h1 className="heading">Welcome to</h1>
        <img 
          src={logo} 
          alt="Pen Path logo" 
          className="logo"
        />
        <div className="welcome-buttons">
          <Button onClick={() => navigate('/login')}>
            Log in
          </Button>

          <Button onClick={() => navigate('/signup')}>
            Sign Up
          </Button> 
        </div>
        
      </div>
    </div>
  )
}

export default Welcome;