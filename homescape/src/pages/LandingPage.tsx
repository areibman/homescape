import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  const handlePlayNow = () => {
    navigate('/play')
  }

  const handleBoring = () => {
    navigate('/boring')
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="title-section">
          <h1 className="game-title">Homescape</h1>
          <p className="game-subtitle">A Personal Adventure</p>
        </div>
        
        <div className="login-panel">
          <div className="panel-header">
            <h2>Welcome, Traveler</h2>
          </div>
          
          <div className="button-container">
            <button 
              className="game-button play-button"
              onClick={handlePlayNow}
              tabIndex={1}
            >
              <span className="button-text">Play Now</span>
              <span className="button-subtitle">Enter the 3D world</span>
            </button>
            
            <button 
              className="game-button boring-button"
              onClick={handleBoring}
              tabIndex={2}
            >
              <span className="button-text">Boring</span>
              <span className="button-subtitle">Simple text page</span>
            </button>
          </div>
          
          <div className="footer-text">
            <p>Choose your adventure style</p>
          </div>
        </div>
      </div>
      
      <div className="background-decoration">
        <div className="decoration-element decoration-1"></div>
        <div className="decoration-element decoration-2"></div>
        <div className="decoration-element decoration-3"></div>
      </div>
    </div>
  )
}

export default LandingPage