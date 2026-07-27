import type { AppSettings } from '../types/tuner'
import { localStorageAdapter, type StorageAdapter } from './storage'

export const SETTINGS_KEY = 'quiet-tuner:settings:v1'

export const DEFAULT_SETTINGS: AppSettings = {
  referencePitch: 440,
  tolerance: { inTune: 3, near: 5, slight: 15 },
  inputSensitivity: 1,
  theme: 'light',
  autoString: true,
  accidental: 'sharp',
  noteLanguage: 'western',
  germanB: false,
  showCents: true,
  showFrequency: true,
  vibration: true,
  wakeLock: false,
  reverseMeter: false,
  meterRange: 50,
  smoothing: 0.55,
  silenceTimeout: 900,
}

function sanitize(settings: AppSettings): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    referencePitch: Math.min(466, Math.max(415, Math.round(settings.referencePitch ?? 440))),
    tolerance: { ...DEFAULT_SETTINGS.tolerance, ...settings.tolerance },
    inputSensitivity: Math.min(2, Math.max(0.5, settings.inputSensitivity ?? 1)),
    smoothing: Math.min(0.9, Math.max(0.15, settings.smoothing ?? 0.55)),
    silenceTimeout: Math.min(2000, Math.max(300, settings.silenceTimeout ?? 900)),
  }
}

export function loadSettings(storage: StorageAdapter = localStorageAdapter): AppSettings {
  return sanitize(storage.get(SETTINGS_KEY, DEFAULT_SETTINGS))
}

export function saveSettings(settings: AppSettings, storage: StorageAdapter = localStorageAdapter): void {
  storage.set(SETTINGS_KEY, sanitize(settings))
}

export function resetSettings(storage: StorageAdapter = localStorageAdapter): AppSettings {
  storage.remove(SETTINGS_KEY)
  return { ...DEFAULT_SETTINGS, tolerance: { ...DEFAULT_SETTINGS.tolerance } }
}
