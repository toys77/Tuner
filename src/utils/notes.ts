import type { AccidentalMode, NoteLanguage } from '../types/tuner'

export const SHARP_NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const
export const FLAT_NOTES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] as const
const SOLFEGE_SHARP = ['ド', 'ド♯', 'レ', 'レ♯', 'ミ', 'ファ', 'ファ♯', 'ソ', 'ソ♯', 'ラ', 'ラ♯', 'シ']
const SOLFEGE_FLAT = ['ド', 'レ♭', 'レ', 'ミ♭', 'ミ', 'ファ', 'ソ♭', 'ソ', 'ラ♭', 'ラ', 'シ♭', 'シ']

export function midiToNoteParts(
  midi: number,
  accidental: AccidentalMode = 'sharp',
  language: NoteLanguage = 'western',
  germanB = false,
): { note: string; octave: number } {
  if (!Number.isFinite(midi)) return { note: '—', octave: 0 }
  const rounded = Math.round(midi)
  const index = ((rounded % 12) + 12) % 12
  const octave = Math.floor(rounded / 12) - 1
  const notes = language === 'solfege'
    ? accidental === 'sharp' ? SOLFEGE_SHARP : SOLFEGE_FLAT
    : accidental === 'sharp' ? [...SHARP_NOTES] : [...FLAT_NOTES]
  let note = notes[index]
  if (germanB && language === 'western') {
    if (index === 11) note = 'H'
    if (index === 10) note = accidental === 'flat' ? 'B' : 'A♯'
  }
  return { note, octave }
}

export function noteNameToMidi(note: string, octave: number): number {
  const normalized = note.replace('#', '♯').replace('b', '♭')
  const lookup: Record<string, number> = {
    C: 0, 'C♯': 1, 'D♭': 1, D: 2, 'D♯': 3, 'E♭': 3, E: 4,
    F: 5, 'F♯': 6, 'G♭': 6, G: 7, 'G♯': 8, 'A♭': 8, A: 9,
    'A♯': 10, 'B♭': 10, B: 11, H: 11,
  }
  const pitchClass = lookup[normalized]
  if (pitchClass === undefined || !Number.isInteger(octave)) return Number.NaN
  return (octave + 1) * 12 + pitchClass
}
