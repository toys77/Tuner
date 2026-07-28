import type { TunerMode } from './tuner'

export interface TuningString {
  id: string
  note: string
  octave: number
  midi: number
}

export interface TuningPreset {
  id: string
  name: string
  displayName?: string
  instrument: string
  instrumentDisplayName?: string
  mode: TunerMode
  strings: TuningString[]
  builtin?: boolean
  favorite?: boolean
}
