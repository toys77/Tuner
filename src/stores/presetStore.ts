import type { TuningPreset } from '../types/preset'
import { localStorageAdapter, type StorageAdapter } from './storage'

export const CUSTOM_PRESETS_KEY = 'quiet-tuner:custom-presets:v1'

export function loadCustomPresets(storage: StorageAdapter = localStorageAdapter): TuningPreset[] {
  const value = storage.get<TuningPreset[]>(CUSTOM_PRESETS_KEY, [])
  return Array.isArray(value) ? value : []
}

export function saveCustomPresets(presets: TuningPreset[], storage: StorageAdapter = localStorageAdapter): void {
  storage.set(CUSTOM_PRESETS_KEY, presets)
}

export function upsertCustomPreset(presets: TuningPreset[], next: TuningPreset): TuningPreset[] {
  const index = presets.findIndex((item) => item.id === next.id)
  if (index < 0) return [...presets, next]
  return presets.map((item, itemIndex) => itemIndex === index ? next : item)
}

export function duplicateCustomPreset(preset: TuningPreset): TuningPreset {
  const id = globalThis.crypto?.randomUUID?.() ?? `custom-${Date.now()}`
  return {
    ...preset,
    id,
    name: `${preset.name} Copy`,
    builtin: false,
    strings: preset.strings.map((string, index) => ({ ...string, id: `${id}-string-${index}` })),
  }
}
