import { useState } from 'react'
import './App.css'

const BACKGROUND_GRADIENT = "linear-gradient(135deg, #667eea, #764ba2)";

const App = () => {

  const bgStyle = {
    backgroundImage: BACKGROUND_GRADIENT,
    height: '100vh',
    width: '100vw',
    margin: '0',
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItem: 'center',
    color: 'white',
    fontSize: '24px',
  };

  return (
    <div style={bgStyle}>
      <h1>Pen Path</h1>
    </div>
  )
}

export default App;