import { describe, expect, it } from 'vitest'
import { PitchSmoother } from './smoothing'
import { detectPitchYin } from './yinDetector'
import { classifyInput, detectionOptions } from '../hooks/usePitchDetection'

function signal(frequency: number, sampleRate = 48000, length = 8192, secondHarmonic = 0): Float32Array {
  return Float32Array.from({ length }, (_, index) => {
    const phase = 2 * Math.PI * frequency * index / sampleRate
    return Math.sin(phase) * 0.35 + Math.sin(phase * 2) * secondHarmonic
  })
}

function weakNoisySignal(frequency: number, sampleRate = 48000, length = 8192): Float32Array {
  let seed = 0x12345678
  return Float32Array.from({ length }, (_, index) => {
    seed = (1664525 * seed + 1013904223) >>> 0
    const noise = (seed / 0xffffffff - 0.5) * 0.0008
    return Math.sin(2 * Math.PI * frequency * index / sampleRate) * 0.0012 + noise
  })
}

describe('YIN pitch detection', () => {
  it.each([30.87, 41.2, 82.41, 110, 440])('detects a %.2f Hz signal', (frequency) => {
    const result = detectPitchYin(signal(frequency), 48000)
    expect(result).not.toBeNull()
    expect(result!.frequency).toBeCloseTo(frequency, frequency < 50 ? 0 : 1)
    expect(result!.clarity).toBeGreaterThan(0.7)
  })

  it('finds the fundamental when the second harmonic is stronger', () => {
    const result = detectPitchYin(signal(82.41, 48000, 8192, 0.72), 48000)
    expect(result).not.toBeNull()
    expect(result!.frequency).toBeCloseTo(82.41, 0)
  })

  it('does not invent a note from silence', () => {
    expect(detectPitchYin(new Float32Array(8192), 48000)).toBeNull()
  })

  it('detects a quiet instrument signal instead of rejecting weak input', () => {
    const input = weakNoisySignal(110)
    const rms = Math.sqrt(input.reduce((sum, value) => sum + value * value, 0) / input.length)
    const inputStatus = classifyInput(rms, 1.5)
    expect(inputStatus).toBe('low')

    const result = detectPitchYin(input, 48000, detectionOptions(inputStatus))
    expect(result).not.toBeNull()
    expect(result!.frequency).toBeCloseTo(110, 0)
  })

  it('keeps true background noise below the analysis gate', () => {
    expect(classifyInput(0.00025, 1.5)).toBe('no-input')
    expect(classifyInput(0.00065, 1)).toBe('low')
    expect(detectionOptions('low').minClarity).toBeLessThan(detectionOptions('ok').minClarity!)
  })

  it('suppresses a momentary octave jump', () => {
    const smoother = new PitchSmoother()
    smoother.push({ frequency: 110, clarity: 0.98 }, 0.5, 1)
    smoother.push({ frequency: 110.2, clarity: 0.98 }, 0.5, 2)
    const corrected = smoother.push({ frequency: 220, clarity: 0.9 }, 0.5, 3)
    expect(corrected!.frequency).toBeLessThan(112)
  })
})
