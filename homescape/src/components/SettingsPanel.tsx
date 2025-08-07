import { GameSettings } from '../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
}

function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const handleQualityChange = (quality: GameSettings['quality']) => {
    onChange({ ...settings, quality });
  };

  const handleAudioToggle = () => {
    onChange({ ...settings, audioEnabled: !settings.audioEnabled });
  };

  const handleInvertCameraToggle = () => {
    onChange({ ...settings, invertCamera: !settings.invertCamera });
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>Settings</h3>
        <button className="settings-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      
      <div className="settings-content">
        <div className="settings-group">
          <label className="settings-label">Graphics Quality</label>
          <div className="settings-options">
            <button
              className={`settings-option ${settings.quality === 'low' ? 'active' : ''}`}
              onClick={() => handleQualityChange('low')}
            >
              Low
            </button>
            <button
              className={`settings-option ${settings.quality === 'medium' ? 'active' : ''}`}
              onClick={() => handleQualityChange('medium')}
            >
              Medium
            </button>
            <button
              className={`settings-option ${settings.quality === 'high' ? 'active' : ''}`}
              onClick={() => handleQualityChange('high')}
            >
              High
            </button>
          </div>
        </div>
        
        <div className="settings-group">
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={handleAudioToggle}
              className="settings-checkbox"
            />
            <span>Enable Audio</span>
          </label>
        </div>
        
        <div className="settings-group">
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.invertCamera}
              onChange={handleInvertCameraToggle}
              className="settings-checkbox"
            />
            <span>Invert Camera</span>
          </label>
        </div>
        
        <div className="settings-info">
          <p>Controls:</p>
          <ul>
            <li>Left-click: Move</li>
            <li>Right-click: Context menu</li>
            <li>Arrow keys: Rotate camera</li>
            <li>Mouse wheel: Zoom</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;