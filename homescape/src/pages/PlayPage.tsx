import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GameScene } from '../game/GameScene'
import SettingsPanel from '../components/SettingsPanel'
import ContextMenu from '../components/ContextMenu'
import LinkModal from '../components/LinkModal'
import type { GameSettings, ContextMenuData, LinkData } from '../types/GameTypes'
import './PlayPage.css'

const PlayPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameSceneRef = useRef<GameScene | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null)
  const [linkModal, setLinkModal] = useState<LinkData | null>(null)
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('homescape-settings')
    return saved ? JSON.parse(saved) : {
      quality: 'medium',
      audioEnabled: false,
      invertCamera: false
    }
  })

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!canvasRef.current) {
          throw new Error('Canvas not available')
        }

        // Check WebGL support
        const gl = canvasRef.current.getContext('webgl2') || canvasRef.current.getContext('webgl')
        if (!gl) {
          throw new Error('WebGL not supported')
        }

        const gameScene = new GameScene(canvasRef.current, settings)
        gameSceneRef.current = gameScene

        // Set up event handlers
        gameScene.onContextMenu = setContextMenu
        gameScene.onLinkClick = setLinkModal

        await gameScene.initialize()
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to initialize game:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize 3D scene')
        setIsLoading(false)
      }
    }

    initializeGame()

    return () => {
      if (gameSceneRef.current) {
        gameSceneRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (gameSceneRef.current) {
      gameSceneRef.current.updateSettings(settings)
    }
    localStorage.setItem('homescape-settings', JSON.stringify(settings))
  }, [settings])

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const handleContextMenuAction = (action: string) => {
    if (gameSceneRef.current && contextMenu) {
      gameSceneRef.current.handleContextAction(contextMenu.entityId, action)
    }
    setContextMenu(null)
  }

  if (error) {
    return (
      <div className="play-page error">
        <div className="error-container">
          <h2>WebGL Not Supported</h2>
          <p>{error}</p>
          <p>Your browser or device doesn't support the 3D features needed for this experience.</p>
          <Link to="/boring" className="fallback-link">
            Try the accessible version instead
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="play-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading your adventure...</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="game-canvas"
        tabIndex={0}
      />

      <div className="ui-overlay">
        <div className="ui-top">
          <div className="ui-top-left">
            <h1 className="scene-title">Town Square</h1>
          </div>
          <div className="ui-top-right">
            <button
              className="settings-button"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Open settings"
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="ui-bottom">
          <div className="controls-hint">
            <p>Left-click to move • Right-click for options • Arrow keys for camera</p>
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          data={contextMenu}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {linkModal && (
        <LinkModal
          data={linkModal}
          onClose={() => setLinkModal(null)}
        />
      )}
    </div>
  )
}

export default PlayPage