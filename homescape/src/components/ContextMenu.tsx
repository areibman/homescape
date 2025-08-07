import { useEffect, useRef } from 'react';
import { Entity } from '../types';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  entity: Entity | null;
  onAction: (action: string) => void;
  onClose: () => void;
}

function ContextMenu({ x, y, entity, onAction, onClose }: ContextMenuProps) {
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

  // Adjust position to keep menu on screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const adjustedX = Math.min(x, window.innerWidth - rect.width - 10);
      const adjustedY = Math.min(y, window.innerHeight - rect.height - 10);
      
      menuRef.current.style.left = `${Math.max(10, adjustedX)}px`;
      menuRef.current.style.top = `${Math.max(10, adjustedY)}px`;
    }
  }, [x, y]);

  const items = [];

  if (entity) {
    items.push({
      label: 'Move here',
      action: 'move',
      icon: '👟'
    });
    
    items.push({
      label: 'Examine',
      action: 'examine',
      icon: '🔍'
    });

    if (entity.linkUrl) {
      const interactLabel = entity.type === 'npc' ? 'Talk to' : 'Open';
      items.push({
        label: `${interactLabel} ${entity.name}`,
        action: 'interact',
        icon: entity.type === 'npc' ? '💬' : '📦'
      });
    }
  } else {
    items.push({
      label: 'Walk here',
      action: 'walk',
      icon: '👟'
    });
  }

  items.push({
    label: 'Cancel',
    action: 'cancel',
    icon: '❌'
  });

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="context-menu-item"
          onClick={() => {
            if (item.action !== 'cancel') {
              onAction(item.action);
            }
            onClose();
          }}
        >
          <span className="context-menu-icon">{item.icon}</span>
          <span className="context-menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ContextMenu;