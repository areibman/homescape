import React, { useEffect, useRef } from 'react'
import type { ContextMenuData } from '../types/GameTypes'
import './ContextMenu.css'

interface ContextMenuProps {
  data: ContextMenuData
  onAction: (action: string) => void
  onClose: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({ data, onAction, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleAction = (action: string) => {
    onAction(action)
  }

  return (
    <div 
      className="context-menu"
      ref={menuRef}
      style={{
        left: `${data.position.x}px`,
        top: `${data.position.y}px`
      }}
    >
      <div className="context-menu-header">
        <span className="entity-name">{data.entityName}</span>
      </div>
      <div className="context-menu-actions">
        {data.actions.map((action, index) => (
          <button
            key={index}
            className="context-menu-action"
            onClick={() => handleAction(action)}
            tabIndex={0}
          >
            {action === 'move' && '🚶 Walk Here'}
            {action === 'examine' && '🔍 Examine'}
            {action === 'talk' && '💬 Talk'}
            {action === 'open' && '📖 Open'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ContextMenu