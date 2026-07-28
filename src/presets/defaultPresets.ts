import type { TunerMode } from '../types/tuner'
import type { TuningPreset, TuningString } from '../types/preset'
import { midiToNoteParts } from '../utils/notes'

type BuiltinMode = Exclude<TunerMode, 'chromatic' | 'custom'>

const BUILTIN_INSTRUMENTS: Record<BuiltinMode, { name: string; displayName: string }> = {
  guitar: { name: 'Guitar', displayName: 'ギター' },
  bass4: { name: '4-string Bass', displayName: '4弦ベース' },
  bass5: { name: '5-string Bass', displayName: '5弦ベース' },
  ukulele: { name: 'Ukulele', displayName: 'ウクレレ' },
}

function stringsFromMidi(midis: number[]): TuningString[] {
  return midis.map((midi, index) => {
    const { note, octave } = midiToNoteParts(midi)
    return { id: `string-${index + 1}`, note, octave, midi }
  })
}

function preset(id: string, name: string, displayName: string, mode: BuiltinMode, midis: number[]): TuningPreset {
  const instrument = BUILTIN_INSTRUMENTS[mode]
  return {
    id,
    name,
    displayName,
    instrument: instrument.name,
    instrumentDisplayName: instrument.displayName,
    mode,
    strings: stringsFromMidi(midis),
    builtin: true,
  }
}

export const DEFAULT_PRESETS: TuningPreset[] = [
  preset('guitar-standard', 'Standard', 'レギュラー', 'guitar', [40, 45, 50, 55, 59, 64]),
  preset('guitar-half-down', 'Half Step Down', '半音下げ', 'guitar', [39, 44, 49, 54, 58, 63]),
  preset('guitar-whole-down', 'Whole Step Down', '全音下げ', 'guitar', [38, 43, 48, 53, 57, 62]),
  preset('guitar-drop-d', 'Drop D', 'ドロップD', 'guitar', [38, 45, 50, 55, 59, 64]),
  preset('guitar-drop-c-sharp', 'Drop C♯', 'ドロップC#', 'guitar', [37, 44, 49, 54, 58, 63]),
  preset('guitar-drop-c', 'Drop C', 'ドロップC', 'guitar', [36, 43, 48, 53, 57, 62]),
  preset('guitar-dadgad', 'DADGAD', 'DADGAD', 'guitar', [38, 45, 50, 55, 57, 62]),
  preset('bass4-standard', 'Standard', 'レギュラー', 'bass4', [28, 33, 38, 43]),
  preset('bass4-half-down', 'Half Step Down', '半音下げ', 'bass4', [27, 32, 37, 42]),
  preset('bass4-whole-down', 'Whole Step Down', '全音下げ', 'bass4', [26, 31, 36, 41]),
  preset('bass4-drop-d', 'Drop D', 'ドロップD', 'bass4', [26, 33, 38, 43]),
  preset('bass4-drop-c-sharp', 'Drop C♯', 'ドロップC#', 'bass4', [25, 32, 37, 42]),
  preset('bass4-drop-c', 'Drop C', 'ドロップC', 'bass4', [24, 31, 36, 41]),
  preset('bass5-standard', 'Standard', 'レギュラー', 'bass5', [23, 28, 33, 38, 43]),
  preset('bass5-half-down', 'Half Step Down', '半音下げ', 'bass5', [22, 27, 32, 37, 42]),
  preset('bass5-whole-down', 'Whole Step Down', '全音下げ', 'bass5', [21, 26, 31, 36, 41]),
  preset('bass5-drop-a', 'Drop A', 'ドロップA', 'bass5', [21, 28, 33, 38, 43]),
  preset('ukulele-standard', 'Standard', 'レギュラー', 'ukulele', [67, 60, 64, 69]),
]

export const MODE_DEFAULT_PRESET: Record<Exclude<TunerMode, 'chromatic' | 'custom'>, string> = {
  guitar: 'guitar-standard',
  bass4: 'bass4-standard',
  bass5: 'bass5-standard',
  ukulele: 'ukulele-standard',
}

export const MODE_LABELS: Record<TunerMode, string> = {
  chromatic: 'クロマチック',
  guitar: 'ギター',
  bass4: '4弦ベース',
  bass5: '5弦ベース',
  ukulele: 'ウクレレ',
  custom: 'カスタム',
}
