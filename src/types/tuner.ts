export type TunerMode = 'chromatic' | 'guitar' | 'bass4' | 'bass5' | 'ukulele' | 'custom'
export type PitchStatus = 'idle' | 'listening' | 'no-input' | 'low' | 'near' | 'in-tune' | 'high' | 'far'
export type InputStatus = 'no-input' | 'low' | 'ok' | 'high' | 'clipping'
export type AccidentalMode = 'sharp' | 'flat'
export type NoteLanguage = 'western' | 'solfege'
export type ThemeMode = 'light' | 'dark'

export interface PitchReading {
  frequency: number
  clarity: number
  midi: number
  roundedMidi: number
  targetFrequency: number
  cents: number
  note: string
  octave: number
  targetLabel?: string
}

export interface DetectorResult {
  frequency: number
  clarity: number
}

export interface ToleranceSettings {
  inTune: number
  near: number
  slight: number
}

export interface AppSettings {
  referencePitch: number
  tolerance: ToleranceSettings
  inputSensitivity: number
  theme: ThemeMode
  autoString: boolean
  accidental: AccidentalMode
  noteLanguage: NoteLanguage
  germanB: boolean
  showCents: boolean
  showFrequency: boolean
  vibration: boolean
  wakeLock: boolean
  reverseMeter: boolean
  meterRange: 25 | 50
  smoothing: number
  silenceTimeout: number
}
