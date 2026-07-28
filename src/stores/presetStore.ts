import type { TuningPreset } from '../types/preset'
import type { TunerMode } from '../types/tuner'
import { localStorageAdapter, type StorageAdapter } from './storage'

export const CUSTOM_PRESETS_KEY = 'quiet-tuner:custom-presets:v1'
export const PRESET_SELECTION_KEY = 'quiet-tuner:preset-selection:v1'

export interface PresetSelection {
  mode: TunerMode
  activePresetId: string | null
  selectedStringId: string | null
}

const DEFAULT_PRESET_SELECTION: PresetSelection = {
  mode: 'chromatic',
  activePresetId: null,
  selectedStringId: null,
}

const TUNER_MODES = new Set<TunerMode>(['chromatic', 'guitar', 'bass4', 'bass5', 'ukulele', 'custom'])

export function loadCustomPresets(storage: StorageAdapter = localStorageAdapter): TuningPreset[] {
  const value = storage.get<TuningPreset[]>(CUSTOM_PRESETS_KEY, [])
  return Array.isArray(value) ? value : []
}

export function saveCustomPresets(presets: TuningPreset[], storage: StorageAdapter = localStorageAdapter): void {
  storage.set(CUSTOM_PRESETS_KEY, presets)
}

export function loadPresetSelection(storage: StorageAdapter = localStorageAdapter): PresetSelection {
  const value = storage.get<Partial<PresetSelection>>(PRESET_SELECTION_KEY, DEFAULT_PRESET_SELECTION)
  return {
    mode: value.mode && TUNER_MODES.has(value.mode) ? value.mode : 'chromatic',
    activePresetId: typeof value.activePresetId === 'string' ? value.activePresetId : null,
    selectedStringId: typeof value.selectedStringId === 'string' ? value.selectedStringId : null,
  }
}

export function savePresetSelection(selection: PresetSelection, storage: StorageAdapter = localStorageAdapter): void {
  storage.set(PRESET_SELECTION_KEY, selection)
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
