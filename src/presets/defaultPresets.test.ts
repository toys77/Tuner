import { describe, expect, it } from 'vitest'
import type { TuningPreset } from '../types/preset'
import { DEFAULT_PRESETS, MODE_LABELS } from './defaultPresets'
import { getPresetDisplayName, getPresetInstrumentDisplayName } from './presetLabels'

const EXPECTED_MIDIS: Record<string, number[]> = {
  'guitar-standard': [40, 45, 50, 55, 59, 64],
  'guitar-half-down': [39, 44, 49, 54, 58, 63],
  'guitar-whole-down': [38, 43, 48, 53, 57, 62],
  'guitar-drop-d': [38, 45, 50, 55, 59, 64],
  'guitar-drop-c-sharp': [37, 44, 49, 54, 58, 63],
  'guitar-drop-c': [36, 43, 48, 53, 57, 62],
  'guitar-dadgad': [38, 45, 50, 55, 57, 62],
  'bass4-standard': [28, 33, 38, 43],
  'bass4-half-down': [27, 32, 37, 42],
  'bass4-whole-down': [26, 31, 36, 41],
  'bass4-drop-d': [26, 33, 38, 43],
  'bass4-drop-c-sharp': [25, 32, 37, 42],
  'bass4-drop-c': [24, 31, 36, 41],
  'bass5-standard': [23, 28, 33, 38, 43],
  'bass5-half-down': [22, 27, 32, 37, 42],
  'bass5-whole-down': [21, 26, 31, 36, 41],
  'bass5-drop-a': [21, 28, 33, 38, 43],
  'ukulele-standard': [67, 60, 64, 69],
}

describe('built-in preset display labels', () => {
  it('keeps every preset id and MIDI sequence unchanged', () => {
    expect(DEFAULT_PRESETS.map((preset) => preset.id)).toEqual(Object.keys(EXPECTED_MIDIS))
    for (const preset of DEFAULT_PRESETS) {
      expect(preset.strings.map((string) => string.midi), preset.id).toEqual(EXPECTED_MIDIS[preset.id])
    }
  })

  it('uses Japanese labels for five-string bass presets', () => {
    const labels = DEFAULT_PRESETS
      .filter((preset) => preset.mode === 'bass5')
      .map((preset) => `${getPresetInstrumentDisplayName(preset)} / ${getPresetDisplayName(preset)}`)

    expect(labels).toEqual([
      '5弦ベース / レギュラー',
      '5弦ベース / 半音下げ',
      '5弦ベース / 全音下げ',
      '5弦ベース / ドロップA',
    ])
  })

  it('keeps internal English values separate from visible labels', () => {
    const preset = DEFAULT_PRESETS.find((item) => item.id === 'bass5-standard')
    expect(preset).toMatchObject({
      id: 'bass5-standard',
      name: 'Standard',
      displayName: 'レギュラー',
      instrument: '5-string Bass',
      instrumentDisplayName: '5弦ベース',
    })
    expect(MODE_LABELS).toMatchObject({ chromatic: 'クロマチック', guitar: 'ギター', bass4: '4弦ベース', bass5: '5弦ベース', ukulele: 'ウクレレ' })
  })

  it('does not translate user-entered custom names', () => {
    const custom: TuningPreset = {
      id: 'saved-custom',
      name: 'Standard',
      instrument: 'My Guitar',
      mode: 'custom',
      strings: [{ id: 'one', note: 'E', octave: 2, midi: 40 }],
    }
    expect(getPresetDisplayName(custom)).toBe('Standard')
    expect(getPresetInstrumentDisplayName(custom)).toBe('My Guitar')
  })

  it('localizes the legacy default custom instrument without changing its preset id', () => {
    const legacy: TuningPreset = {
      id: 'saved-custom',
      name: 'My Tuning',
      instrument: 'Custom Instrument',
      mode: 'custom',
      strings: [{ id: 'one', note: 'E', octave: 2, midi: 40 }],
    }
    expect(getPresetInstrumentDisplayName(legacy)).toBe('カスタム楽器')
    expect(legacy.id).toBe('saved-custom')
  })
})
