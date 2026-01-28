import { useState } from 'react'
import logo from './assets/logo.png';
import './App.css'
import Button from './components/Button';

const BACKGROUND_GRADIENT = "linear-gradient(150deg, #B2F7FF, #98AEFD)";

const App = () => {
  return (
    <div className="app-bg">
      <div className="content">
        <h1 className="heading">Welcome to</h1>
        <img 
          src={logo} 
          alt="Pen Path logo" 
          className="logo"
        />

        <Button onClick={handleClick}>
          Log in
        </Button>
      </div>
    </div>
  )
}

export default App;