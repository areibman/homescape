import React, { useEffect, useRef } from 'react';
import type { InteractionTarget } from '../types/game';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  target: InteractionTarget | null;
  onAction: (action: string) => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  target,
  onAction,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!target) return null;

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'move':
        return 'Move';
      case 'examine':
        return 'Examine';
      case 'talk':
        return target.type === 'npc' ? 'Talk' : 'Open';
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'move':
        return '👣';
      case 'examine':
        return '👁️';
      case 'talk':
        return target.type === 'npc' ? '💬' : '📂';
      default:
        return '❓';
    }
  };

  const actions = ['move', 'examine', 'talk'];

  return (
    <div 
      className="context-menu"
      ref={menuRef}
      style={{
        left: x,
        top: y
      }}
    >
      <div className="context-menu-header">
        <span className="target-icon">
          {target.type === 'npc' ? '👤' : '📦'}
        </span>
        <span className="target-name">
          {target.type === 'npc' ? 'NPC' : 'Object'}
        </span>
      </div>
      
      <div className="context-menu-actions">
        {actions.map((action) => (
          <button
            key={action}
            className="context-menu-action"
            onClick={() => onAction(action)}
          >
            <span className="action-icon">{getActionIcon(action)}</span>
            <span className="action-label">{getActionLabel(action)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;