import { useState } from 'react'
import logo from './assets/logo.png';
import './App.css'

const BACKGROUND_GRADIENT = "linear-gradient(150deg, #B2F7FF, #98AEFD)";

const App = () => {

  const bgStyle = {
    backgroundImage: BACKGROUND_GRADIENT,
    height: '100vh',
    width: '100vw',
    margin: '0',
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '24px',
    minHeight: '100%',
  };

  const header = {
    color: '#050505ff',
    fontFamily: "'Play Kiddo'",
    paddingBottom: "600px",
    paddingLeft: "60px"
  };

  const logoFrame = {
    width: "90%",
    maxWidth: "375px",   
    height: "667px",     
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: '400px',
    paddingBottom: '300px',
};

  const logoStyle = {
    width: "auto",
    maxWidth: "500px",
    height: "auto",
  };


  return (
    <div style={bgStyle}>
      <div style={header}>
        <h1>Welcome to</h1>
      </div>
      <div style={logoFrame}>
        <img 
          src={logo} 
          alt="Pen Path logo" 
          style={logoStyle}
        />
      </div>
    </div>
  )
}

export default App;