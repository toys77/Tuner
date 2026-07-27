import { describe, expect, it } from 'vitest'
import type { TuningPreset } from '../types/preset'
import type { StorageAdapter } from './storage'
import { localStorageAdapter } from './storage'
import { loadCustomPresets, saveCustomPresets } from './presetStore'
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

  it('saves and restores settings', () => {
    const storage = memoryStorage()
    saveSettings({ ...DEFAULT_SETTINGS, referencePitch: 442, theme: 'dark' }, storage)
    expect(loadSettings(storage)).toMatchObject({ referencePitch: 442, theme: 'dark' })
  })

  it('sanitizes invalid persisted settings', () => {
    const storage = memoryStorage()
    storage.set('quiet-tuner:settings:v1', { ...DEFAULT_SETTINGS, referencePitch: 999 })
    expect(loadSettings(storage).referencePitch).toBe(466)
  })
})
