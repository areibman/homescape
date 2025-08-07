import { create } from 'zustand'

export type QualityTier = 'low' | 'medium' | 'high'

const storageKey = 'homescape.settings.v1'

export interface SettingsState {
  quality: QualityTier
  audioEnabled: boolean
  invertCamera: boolean
  analyticsEnabled: boolean
  setQuality: (q: QualityTier) => void
  setAudioEnabled: (v: boolean) => void
  setInvertCamera: (v: boolean) => void
  setAnalyticsEnabled: (v: boolean) => void
}

function loadInitial(): Pick<SettingsState, 'quality' | 'audioEnabled' | 'invertCamera' | 'analyticsEnabled'> {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw)
  } catch {}
  const dnt = typeof navigator !== 'undefined' && (navigator as any).doNotTrack === '1'
  return { quality: 'medium', audioEnabled: false, invertCamera: false, analyticsEnabled: !dnt }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...loadInitial(),
  setQuality: (q) => { set({ quality: q }); persist() },
  setAudioEnabled: (v) => { set({ audioEnabled: v }); persist() },
  setInvertCamera: (v) => { set({ invertCamera: v }); persist() },
  setAnalyticsEnabled: (v) => { set({ analyticsEnabled: v }); persist() },
}))

function persist() {
  try {
    const { quality, audioEnabled, invertCamera, analyticsEnabled } = useSettingsStore.getState()
    localStorage.setItem(storageKey, JSON.stringify({ quality, audioEnabled, invertCamera, analyticsEnabled }))
  } catch {}
}