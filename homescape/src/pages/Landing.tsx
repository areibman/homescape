import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-panel">
        <div className="landing-header">
          <h1 className="landing-title">Homescape</h1>
          <p className="landing-subtitle">A Personal Adventure Awaits</p>
        </div>
        
        <div className="landing-content">
          <div className="landing-message">
            <p>Welcome, traveler!</p>
            <p>Choose your path to explore my digital realm.</p>
          </div>
          
          <div className="landing-buttons">
            <button 
              className="landing-button play-button"
              onClick={() => navigate('/play')}
            >
              Play Now
            </button>
            
            <button 
              className="landing-button boring-button"
              onClick={() => navigate('/boring')}
            >
              Boring
            </button>
          </div>
          
          <div className="landing-footer">
            <p className="landing-hint">
              Play Now - Enter an interactive 3D world<br />
              Boring - View a simple text page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;