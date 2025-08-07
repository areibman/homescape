import { GameSettings } from '../types';

const SETTINGS_KEY = 'homescape_settings';

export const defaultSettings: GameSettings = {
  audioEnabled: false, // Muted by default as per PRD
  quality: 'medium',
  invertCamera: false
};

export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}