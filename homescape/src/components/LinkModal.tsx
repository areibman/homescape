import React, { useEffect } from 'react'
import type { LinkData } from '../types/GameTypes'
import './LinkModal.css'

interface LinkModalProps {
  data: LinkData
  onClose: () => void
}

const LinkModal: React.FC<LinkModalProps> = ({ data, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleOpenLink = () => {
    window.open(data.url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="link-modal-overlay" onClick={handleOverlayClick}>
      <div className="link-modal">
        <div className="link-modal-header">
          <h3>{data.title}</h3>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        
        <div className="link-modal-content">
          <div className="entity-context">
            <p className="entity-reference">From: <strong>{data.entityName}</strong></p>
          </div>
          
          <div className="link-description">
            <p>{data.description}</p>
          </div>
          
          <div className="link-url">
            <p className="url-preview">{data.url}</p>
          </div>
        </div>

        <div className="link-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="open-link-button" onClick={handleOpenLink}>
            Open Link
          </button>
        </div>
      </div>
    </div>
  )
}

export default LinkModal