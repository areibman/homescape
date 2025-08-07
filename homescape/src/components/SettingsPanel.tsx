import React from 'react'
import type { GameSettings } from '../types/GameTypes'
import './SettingsPanel.css'

interface SettingsPanelProps {
  settings: GameSettings
  onChange: (settings: Partial<GameSettings>) => void
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onClose }) => {
  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>
        
        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="quality-select">Graphics Quality</label>
            <select 
              id="quality-select"
              value={settings.quality}
              onChange={(e) => onChange({ quality: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <option value="low">Low - Better performance</option>
              <option value="medium">Medium - Balanced</option>
              <option value="high">High - Best visuals</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.audioEnabled}
                onChange={(e) => onChange({ audioEnabled: e.target.checked })}
              />
              <span className="checkbox-custom"></span>
              Enable Audio
            </label>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.invertCamera}
                onChange={(e) => onChange({ invertCamera: e.target.checked })}
              />
              <span className="checkbox-custom"></span>
              Invert Camera Controls
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <p className="settings-note">
            Settings are automatically saved to your browser
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel