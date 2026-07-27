import { describe, expect, it } from 'vitest'
import { centsFromFrequency, frequencyToMidi, midiToFrequency } from './frequency'
import { midiToNoteParts } from './notes'

describe('frequency and note conversion', () => {
  it.each([
    [440, 69, 'A', 4],
    [220, 57, 'A', 3],
    [110, 45, 'A', 2],
    [82.41, 40, 'E', 2],
    [41.20, 28, 'E', 1],
    [30.87, 23, 'B', 0],
  ])('converts %f Hz to the expected note', (frequency, midi, note, octave) => {
    const converted = frequencyToMidi(frequency)
    expect(Math.round(converted)).toBe(midi)
    expect(midiToNoteParts(converted)).toEqual({ note, octave })
  })

  it('uses a 442 Hz reference pitch throughout the calculation', () => {
    expect(frequencyToMidi(442, 442)).toBeCloseTo(69, 8)
    expect(midiToFrequency(69, 442)).toBeCloseTo(442, 8)
  })

  it('calculates cents relative to the target frequency', () => {
    const fiftyCentsHigh = 440 * 2 ** (50 / 1200)
    expect(centsFromFrequency(fiftyCentsHigh, 440)).toBeCloseTo(50, 7)
    expect(centsFromFrequency(440 / 2 ** (25 / 1200), 440)).toBeCloseTo(-25, 7)
  })

  it('does not throw on invalid frequencies', () => {
    for (const value of [0, -10, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(frequencyToMidi(value)).toBeNaN()
      expect(() => frequencyToMidi(value)).not.toThrow()
    }
  })
})
