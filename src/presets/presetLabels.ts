import type { TuningPreset } from '../types/preset'

export function getPresetDisplayName(preset: TuningPreset): string {
  return preset.builtin ? preset.displayName ?? preset.name : preset.name
}

export function getPresetInstrumentDisplayName(preset: TuningPreset): string {
  if (preset.builtin) return preset.instrumentDisplayName ?? preset.instrument
  return preset.instrument === 'Custom Instrument' ? 'カスタム楽器' : preset.instrument
}
