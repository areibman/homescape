import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handlePlayNow = () => {
    navigate('/play');
  };

  const handleBoring = () => {
    navigate('/boring');
  };

  return (
    <div className="landing-page">
      <div className="login-panel">
        <div className="panel-header">
          <h1>Homescape</h1>
          <p>Welcome to my personal realm</p>
        </div>
        
        <div className="panel-content">
          <div className="button-group">
            <button 
              className="play-button primary-button"
              onClick={handlePlayNow}
            >
              Play Now
            </button>
            
            <button 
              className="boring-button secondary-button"
              onClick={handleBoring}
            >
              Boring
            </button>
          </div>
          
          <div className="footer-text">
            <p>Choose your adventure...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;