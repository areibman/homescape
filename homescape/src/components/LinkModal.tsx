import React, { useEffect } from 'react';
import './LinkModal.css';

interface LinkModalProps {
  title: string;
  description: string;
  linkUrl: string;
  onClose: () => void;
  onOpenLink: () => void;
}

const LinkModal: React.FC<LinkModalProps> = ({
  title,
  description,
  linkUrl,
  onClose,
  onOpenLink
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">{description}</p>
          
          <div className="modal-link-info">
            <span className="link-label">Destination:</span>
            <span className="link-url">{linkUrl}</span>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button primary" onClick={onOpenLink}>
            Open Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;