import React, { useState } from 'react';
import type { GameSettings } from '../types/game';
import './GameUI.css';

interface GameUIProps {
  settings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  onBackToLanding: () => void;
  hintText: string;
}

const GameUI: React.FC<GameUIProps> = ({
  settings,
  onSettingsChange,
  onBackToLanding,
  hintText
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingChange = (key: keyof GameSettings, value: boolean | string) => {
    onSettingsChange({ [key]: value });
  };

  return (
    <div className="game-ui">
      {/* Top-left: Scene title */}
      <div className="ui-top-left">
        <h2>Homescape Town Square</h2>
      </div>

      {/* Top-right: Settings button */}
      <div className="ui-top-right">
        <button 
          className="settings-button"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
        
        {showSettings && (
          <div className="settings-panel">
            <h3>Settings</h3>
            
            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.audioEnabled}
                  onChange={(e) => handleSettingChange('audioEnabled', e.target.checked)}
                />
                Audio
              </label>
            </div>
            
            <div className="setting-group">
              <label>Quality:</label>
              <select
                value={settings.quality}
                onChange={(e) => handleSettingChange('quality', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.invertCamera}
                  onChange={(e) => handleSettingChange('invertCamera', e.target.checked)}
                />
                Invert Camera
              </label>
            </div>
            
            <button 
              className="back-button"
              onClick={onBackToLanding}
            >
              ← Back to Landing
            </button>
          </div>
        )}
      </div>

      {/* Bottom: Hint text */}
      <div className="ui-bottom">
        <div className="hint-text">
          {hintText}
        </div>
      </div>

      {/* Controls help */}
      <div className="ui-bottom-right">
        <div className="controls-help">
          <div className="control-item">
            <span className="control-key">Left Click</span>
            <span className="control-desc">Move</span>
          </div>
          <div className="control-item">
            <span className="control-key">Right Click</span>
            <span className="control-desc">Options</span>
          </div>
          <div className="control-item">
            <span className="control-key">Arrow Keys</span>
            <span className="control-desc">Camera</span>
          </div>
          <div className="control-item">
            <span className="control-key">Mouse Wheel</span>
            <span className="control-desc">Zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;