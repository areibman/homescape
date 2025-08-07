import { Link } from 'react-router-dom';
import { entityData } from '../data/entities';
import './BoringPage.css';

const BoringPage = () => {
  const npcs = entityData.filter(entity => entity.type === 'npc');
  const objects = entityData.filter(entity => entity.type === 'object');

  return (
    <div className="boring-page">
      <header className="boring-header">
        <h1>Homescape - Simple View</h1>
        <Link to="/" className="back-link">← Back to Landing</Link>
      </header>
      
      <main className="boring-content">
        <section className="links-section">
          <h2>Personal Links</h2>
          
          <div className="links-grid">
            <div className="link-category">
              <h3>People to Talk To</h3>
              <ul className="link-list">
                {npcs.map((npc) => (
                  <li key={npc.id}>
                    <a 
                      href={npc.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-item"
                    >
                      <span className="link-title">{npc.title}</span>
                      <span className="link-description">{npc.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="link-category">
              <h3>Objects to Examine</h3>
              <ul className="link-list">
                {objects.map((object) => (
                  <li key={object.id}>
                    <a 
                      href={object.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-item"
                    >
                      <span className="link-title">{object.title}</span>
                      <span className="link-description">{object.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="boring-footer">
        <p>This is the accessible, text-only version of my personal site.</p>
        <p>For the full experience, try the <Link to="/play">3D version</Link>!</p>
      </footer>
    </div>
  );
};

export default BoringPage;