import type { TuningPreset } from '../types/preset'
import type { TunerMode } from '../types/tuner'

const COMPATIBLE_INSTRUMENT_NAMES: Partial<Record<TunerMode, string[]>> = {
  guitar: ['Guitar', 'ギター'],
  bass4: ['4-string Bass', '4弦ベース'],
  bass5: ['5-string Bass', '5弦ベース'],
  ukulele: ['Ukulele', 'ウクレレ'],
}

export function getPresetDisplayName(preset: TuningPreset): string {
  return preset.builtin ? preset.displayName ?? preset.name : preset.name
}

export function getPresetInstrumentDisplayName(preset: TuningPreset): string {
  if (preset.builtin) return preset.instrumentDisplayName ?? preset.instrument
  return preset.instrument === 'Custom Instrument' ? 'カスタム楽器' : preset.instrument
}

export function isPresetCompatibleWithMode(preset: TuningPreset, mode: TunerMode): boolean {
  if (preset.builtin) return preset.mode === mode
  if (mode === 'custom') return true
  if (mode === 'chromatic') return false
  if (preset.mode === mode) return true
  const names = COMPATIBLE_INSTRUMENT_NAMES[mode] ?? []
  return names.includes(preset.instrument) || names.includes(getPresetInstrumentDisplayName(preset))
}
