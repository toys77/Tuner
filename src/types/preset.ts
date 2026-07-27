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
  instrument: string
  mode: TunerMode
  strings: TuningString[]
  builtin?: boolean
  favorite?: boolean
}
