export const MIN_FREQUENCY = 25
export const MAX_FREQUENCY = 1500

export function frequencyToMidi(frequency: number, referencePitch = 440): number {
  if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isFinite(referencePitch) || referencePitch <= 0) {
    return Number.NaN
  }
  return 69 + 12 * Math.log2(frequency / referencePitch)
}

export function midiToFrequency(midi: number, referencePitch = 440): number {
  if (!Number.isFinite(midi) || !Number.isFinite(referencePitch) || referencePitch <= 0) return Number.NaN
  return referencePitch * 2 ** ((midi - 69) / 12)
}

export function centsFromFrequency(frequency: number, targetFrequency: number): number {
  if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isFinite(targetFrequency) || targetFrequency <= 0) {
    return Number.NaN
  }
  return 1200 * Math.log2(frequency / targetFrequency)
}
