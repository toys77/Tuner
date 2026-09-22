import { describe, expect, it } from 'vitest'
import type { TuningPreset } from '../types/preset'
import type { StorageAdapter } from './storage'
import { localStorageAdapter } from './storage'
import { loadCustomPresets, loadPresetSelection, saveCustomPresets, savePresetSelection } from './presetStore'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './settingsStore'

function memoryStorage(): StorageAdapter {
  const values = new Map<string, unknown>()
  return {
    get<T>(key: string, fallback: T): T { return (values.get(key) as T | undefined) ?? fallback },
    set<T>(key: string, value: T) { values.set(key, structuredClone(value)) },
    remove(key: string) { values.delete(key) },
  }
}

describe('persistent stores', () => {
  it('saves and restores custom presets', () => {
    const storage = memoryStorage()
    const preset: TuningPreset = { id: 'mine', name: 'Low Setup', instrument: 'Bass', mode: 'custom', strings: [{ id: 'one', note: 'B', octave: 0, midi: 23 }] }
    saveCustomPresets([preset], storage)
    expect(loadCustomPresets(storage)).toEqual([preset])
  })

  it('round-trips preset arrays through the browser storage adapter', () => {
    localStorage.clear()
    const preset: TuningPreset = { id: 'browser', name: 'Browser Setup', instrument: 'Guitar', mode: 'custom', strings: [{ id: 'one', note: 'E', octave: 2, midi: 40 }] }
    saveCustomPresets([preset], localStorageAdapter)
    expect(loadCustomPresets(localStorageAdapter)).toEqual([preset])
  })

  it('saves and restores the active preset and target string', () => {
    const storage = memoryStorage()
    const selection = { mode: 'bass5' as const, activePresetId: 'bass5-half-down', selectedStringId: 'string-3' }
    savePresetSelection(selection, storage)
    expect(loadPresetSelection(storage)).toEqual(selection)
  })

  it('saves and restores settings', () => {
    const storage = memoryStorage()
    saveSettings({ ...DEFAULT_SETTINGS, referencePitch: 442, theme: 'dark' }, storage)
    expect(loadSettings(storage)).toMatchObject({ referencePitch: 442, theme: 'dark' })
  })

  it('sanitizes invalid persisted settings', () => {
    const storage = memoryStorage()
    storage.set('quiet-tuner:settings:v1', { ...DEFAULT_SETTINGS, referencePitch: 999, inputSensitivity: 99 })
    expect(loadSettings(storage)).toMatchObject({ referencePitch: 466, inputSensitivity: 4 })
  })

  it('uses a more responsive default input sensitivity', () => {
    expect(loadSettings(memoryStorage()).inputSensitivity).toBe(1.5)
  })
})
