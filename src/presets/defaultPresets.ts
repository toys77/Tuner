import type { TunerMode } from '../types/tuner'
import type { TuningPreset, TuningString } from '../types/preset'
import { midiToNoteParts } from '../utils/notes'

function stringsFromMidi(midis: number[]): TuningString[] {
  return midis.map((midi, index) => {
    const { note, octave } = midiToNoteParts(midi)
    return { id: `string-${index + 1}`, note, octave, midi }
  })
}

function preset(id: string, name: string, instrument: string, mode: TunerMode, midis: number[]): TuningPreset {
  return { id, name, instrument, mode, strings: stringsFromMidi(midis), builtin: true }
}

export const DEFAULT_PRESETS: TuningPreset[] = [
  preset('guitar-standard', 'Standard', 'Guitar', 'guitar', [40, 45, 50, 55, 59, 64]),
  preset('guitar-half-down', 'Half Step Down', 'Guitar', 'guitar', [39, 44, 49, 54, 58, 63]),
  preset('guitar-whole-down', 'Whole Step Down', 'Guitar', 'guitar', [38, 43, 48, 53, 57, 62]),
  preset('guitar-drop-d', 'Drop D', 'Guitar', 'guitar', [38, 45, 50, 55, 59, 64]),
  preset('guitar-drop-c-sharp', 'Drop C♯', 'Guitar', 'guitar', [37, 44, 49, 54, 58, 63]),
  preset('guitar-drop-c', 'Drop C', 'Guitar', 'guitar', [36, 43, 48, 53, 57, 62]),
  preset('guitar-dadgad', 'DADGAD', 'Guitar', 'guitar', [38, 45, 50, 55, 57, 62]),
  preset('bass4-standard', 'Standard', '4-string Bass', 'bass4', [28, 33, 38, 43]),
  preset('bass4-half-down', 'Half Step Down', '4-string Bass', 'bass4', [27, 32, 37, 42]),
  preset('bass4-whole-down', 'Whole Step Down', '4-string Bass', 'bass4', [26, 31, 36, 41]),
  preset('bass4-drop-d', 'Drop D', '4-string Bass', 'bass4', [26, 33, 38, 43]),
  preset('bass4-drop-c-sharp', 'Drop C♯', '4-string Bass', 'bass4', [25, 32, 37, 42]),
  preset('bass4-drop-c', 'Drop C', '4-string Bass', 'bass4', [24, 31, 36, 41]),
  preset('bass5-standard', 'Standard', '5-string Bass', 'bass5', [23, 28, 33, 38, 43]),
  preset('bass5-half-down', 'Half Step Down', '5-string Bass', 'bass5', [22, 27, 32, 37, 42]),
  preset('bass5-whole-down', 'Whole Step Down', '5-string Bass', 'bass5', [21, 26, 31, 36, 41]),
  preset('bass5-drop-a', 'Drop A', '5-string Bass', 'bass5', [21, 28, 33, 38, 43]),
  preset('ukulele-standard', 'Standard', 'Ukulele', 'ukulele', [67, 60, 64, 69]),
]

export const MODE_DEFAULT_PRESET: Record<Exclude<TunerMode, 'chromatic' | 'custom'>, string> = {
  guitar: 'guitar-standard',
  bass4: 'bass4-standard',
  bass5: 'bass5-standard',
  ukulele: 'ukulele-standard',
}

export const MODE_LABELS: Record<TunerMode, string> = {
  chromatic: 'CHROMATIC',
  guitar: 'GUITAR',
  bass4: '4-STRING BASS',
  bass5: '5-STRING BASS',
  ukulele: 'UKULELE',
  custom: 'CUSTOM',
}
