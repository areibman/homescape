import { useEffect } from 'react';
import { Entity } from '../types';
import './LinkModal.css';

interface LinkModalProps {
  entity: Entity;
  onClose: () => void;
}

function LinkModal({ entity, onClose }: LinkModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOpenLink = () => {
    if (entity.linkUrl) {
      window.open(entity.linkUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="link-modal-overlay" onClick={onClose}>
      <div className="link-modal" onClick={(e) => e.stopPropagation()}>
        <button className="link-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <div className="link-modal-header">
          <h2>{entity.linkTitle || entity.name}</h2>
        </div>
        
        <div className="link-modal-content">
          {entity.type === 'npc' && (
            <p className="link-modal-dialog">
              "{entity.name} says: {entity.linkDescription || 'Would you like to visit my domain?'}"
            </p>
          )}
          
          {entity.type === 'object' && (
            <p className="link-modal-description">
              {entity.linkDescription || `Interact with the ${entity.name}`}
            </p>
          )}
        </div>
        
        <div className="link-modal-actions">
          <button 
            className="link-modal-button primary"
            onClick={handleOpenLink}
          >
            {entity.type === 'npc' ? 'Visit' : 'Open'}
          </button>
          <button 
            className="link-modal-button secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkModal;