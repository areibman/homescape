import { Link } from 'react-router-dom';
import entitiesData from '../data/entities.json';
import './BoringPage.css';

function BoringPage() {
  return (
    <div className="boring-container">
      <header className="boring-header">
        <h1>Welcome to My Personal Page</h1>
        <p>A simple, accessible version of my links</p>
      </header>
      
      <main className="boring-main">
        <section className="boring-section">
          <h2>Navigation</h2>
          <ul className="boring-links">
            {entitiesData.entities.map((entity) => (
              <li key={entity.id}>
                <a 
                  href={entity.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="boring-link"
                >
                  <strong>{entity.linkTitle || entity.name}</strong>
                  {entity.linkDescription && (
                    <span className="boring-description"> - {entity.linkDescription}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="boring-section">
          <h2>Other Options</h2>
          <p>
            <Link to="/" className="boring-link">← Back to Home</Link>
            {' | '}
            <Link to="/play" className="boring-link">Try the Interactive Version</Link>
          </p>
        </section>
      </main>
      
      <footer className="boring-footer">
        <p>&copy; 2024 Homescape. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default BoringPage;