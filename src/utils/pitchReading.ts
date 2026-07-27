import type { TuningPreset } from '../types/preset'
import type { AppSettings, DetectorResult, PitchReading } from '../types/tuner'
import { centsFromFrequency, frequencyToMidi, midiToFrequency } from './frequency'
import { midiToNoteParts } from './notes'

export function createPitchReading(
  result: DetectorResult,
  settings: AppSettings,
  preset: TuningPreset | null,
  selectedStringId: string | null,
): PitchReading | null {
  const midi = frequencyToMidi(result.frequency, settings.referencePitch)
  if (!Number.isFinite(midi)) return null
  const roundedMidi = Math.round(midi)
  const detected = midiToNoteParts(roundedMidi, settings.accidental, settings.noteLanguage, settings.germanB)
  let targetMidi = roundedMidi
  let targetLabel: string | undefined
  if (preset?.strings.length) {
    const target = settings.autoString
      ? preset.strings.reduce((nearest, current) => Math.abs(current.midi - midi) < Math.abs(nearest.midi - midi) ? current : nearest)
      : preset.strings.find((string) => string.id === selectedStringId) ?? preset.strings[0]
    targetMidi = target.midi
    const targetParts = midiToNoteParts(target.midi, settings.accidental, settings.noteLanguage, settings.germanB)
    targetLabel = `${targetParts.note}${targetParts.octave}`
  }
  const targetFrequency = midiToFrequency(targetMidi, settings.referencePitch)
  return {
    ...result,
    midi,
    roundedMidi,
    targetFrequency,
    cents: centsFromFrequency(result.frequency, targetFrequency),
    note: detected.note,
    octave: detected.octave,
    targetLabel,
  }
}
