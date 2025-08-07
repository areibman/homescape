import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameEngine from '../game/GameEngine';
import ContextMenu from '../components/ContextMenu';
import LinkModal from '../components/LinkModal';
import SettingsPanel from '../components/SettingsPanel';
import { Entity, GameSettings } from '../types';
import { loadSettings, saveSettings } from '../utils/settings';
import './GameScene.css';

function GameScene() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    entity: Entity | null;
  } | null>(null);
  const [linkModal, setLinkModal] = useState<Entity | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(loadSettings());
  const [hintText, setHintText] = useState('Left-click to move. Right-click for options.');

  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeGame = async () => {
      try {
        setIsLoading(true);
        
        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
          throw new Error('WebGL is not supported in your browser');
        }

        // Initialize game engine
        const engine = new GameEngine(canvasRef.current, settings);
        engineRef.current = engine;

        // Set up event handlers
        engine.onContextMenu = (x: number, y: number, entity: Entity | null) => {
          setContextMenu({ x, y, entity });
        };

        engine.onEntityInteract = (entity: Entity) => {
          if (entity.linkUrl) {
            setLinkModal(entity);
          }
        };

        engine.onHintTextChange = (text: string) => {
          setHintText(text);
        };

        await engine.initialize();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to initialize game');
        setIsLoading(false);
      }
    };

    initializeGame();

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings(settings);
    }
    saveSettings(settings);
  }, [settings]);

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu || !engineRef.current) return;

    switch (action) {
      case 'move':
        if (contextMenu.entity) {
          engineRef.current.moveToEntity(contextMenu.entity);
        }
        break;
      case 'examine':
        if (contextMenu.entity) {
          setHintText(contextMenu.entity.examineText);
        }
        break;
      case 'interact':
        if (contextMenu.entity && contextMenu.entity.linkUrl) {
          setLinkModal(contextMenu.entity);
        }
        break;
    }
    setContextMenu(null);
  };

  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  if (loadError) {
    return (
      <div className="game-error">
        <h2>Unable to Load Game</h2>
        <p>{loadError}</p>
        <button onClick={() => navigate('/boring')}>
          Go to Text Version
        </button>
        <button onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="game-container">
      {isLoading && (
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>Loading game world...</p>
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        className="game-canvas"
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* UI Overlay */}
      <div className="game-ui">
        <div className="game-header">
          <h1 className="game-title">Town Square</h1>
          <button 
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
        
        <div className="game-footer">
          <p className="hint-text">{hintText}</p>
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entity={contextMenu.entity}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {/* Link Modal */}
      {linkModal && (
        <LinkModal
          entity={linkModal}
          onClose={() => setLinkModal(null)}
        />
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default GameScene;