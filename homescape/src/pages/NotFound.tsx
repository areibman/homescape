import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-message">You've wandered into uncharted territory!</p>
        <p className="notfound-submessage">The page you seek does not exist in this realm.</p>
        <Link to="/" className="notfound-button">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;