import { useState } from 'react';
import logo from '../assets/logo.png'
import "../App.css";
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
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
        <Button onClick={() => navigate('/login')}>
          Log in
        </Button>
      </div>
    </div>
  )
}

export default Welcome;