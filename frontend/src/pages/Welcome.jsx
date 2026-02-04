import { useState } from 'react';
import logo from '../assets/logo.png'
import "../App.css";
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom';

/*
* <summary>
* Front-end welcome page for new and returning users
*   -> displays centered greeting text and app logo
*   -> provides two primary buttons:
*       * "Log in" navigates to the login page
*       * "Sign Up" navigates to the account creation page
*   -> layout uses gradient background and vertically centered content consistent with app design
*/

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