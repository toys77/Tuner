import type { DetectorResult } from '../types/tuner'
import { MAX_FREQUENCY, MIN_FREQUENCY } from '../utils/frequency'

export interface YinOptions {
  threshold?: number
  minFrequency?: number
  maxFrequency?: number
  minClarity?: number
}

function removeDcOffset(input: Float32Array): Float32Array {
  let mean = 0
  for (let i = 0; i < input.length; i += 1) mean += input[i]
  mean /= input.length
  const output = new Float32Array(input.length)
  for (let i = 0; i < input.length; i += 1) output[i] = input[i] - mean
  return output
}

function downsample(input: Float32Array, sampleRate: number): { samples: Float32Array; sampleRate: number } {
  const factor = sampleRate > 32000 ? 2 : 1
  if (factor === 1) return { samples: removeDcOffset(input), sampleRate }
  const output = new Float32Array(Math.floor(input.length / factor))
  for (let i = 0; i < output.length; i += 1) {
    const offset = i * factor
    output[i] = (input[offset] + input[offset + 1]) * 0.5
  }
  return { samples: removeDcOffset(output), sampleRate: sampleRate / factor }
}

export function calculateRms(input: Float32Array): number {
  if (!input.length) return 0
  let sum = 0
  let peak = 0
  for (let i = 0; i < input.length; i += 1) {
    const value = input[i]
    sum += value * value
    peak = Math.max(peak, Math.abs(value))
  }
  const rms = Math.sqrt(sum / input.length)
  return peak > 0.985 ? Math.max(rms, 1) : rms
}

/** YIN fundamental-frequency detector with parabolic interpolation. */
export function detectPitchYin(input: Float32Array, sourceSampleRate: number, options: YinOptions = {}): DetectorResult | null {
  if (input.length < 256 || !Number.isFinite(sourceSampleRate) || sourceSampleRate <= 0) return null
  const threshold = options.threshold ?? 0.14
  const minFrequency = options.minFrequency ?? MIN_FREQUENCY
  const maxFrequency = options.maxFrequency ?? MAX_FREQUENCY
  const minClarity = options.minClarity ?? 0.72
  const { samples, sampleRate } = downsample(input, sourceSampleRate)
  const minTau = Math.max(2, Math.floor(sampleRate / maxFrequency))
  const maxTau = Math.min(Math.floor(sampleRate / minFrequency), Math.floor(samples.length / 2))
  if (maxTau <= minTau) return null

  const yin = new Float32Array(maxTau + 1)
  for (let tau = minTau; tau <= maxTau; tau += 1) {
    let difference = 0
    const limit = samples.length - tau
    for (let i = 0; i < limit; i += 1) {
      const delta = samples[i] - samples[i + tau]
      difference += delta * delta
    }
    yin[tau] = difference
  }

  let runningSum = 0
  for (let tau = minTau; tau <= maxTau; tau += 1) {
    runningSum += yin[tau]
    yin[tau] = runningSum === 0 ? 1 : yin[tau] * (tau - minTau + 1) / runningSum
  }

  let tauEstimate = -1
  for (let tau = minTau + 1; tau < maxTau; tau += 1) {
    if (yin[tau] < threshold && yin[tau] <= yin[tau - 1]) {
      while (tau + 1 < maxTau && yin[tau + 1] < yin[tau]) tau += 1
      tauEstimate = tau
      break
    }
  }
  if (tauEstimate < 0) {
    let best = minTau
    for (let tau = minTau + 1; tau <= maxTau; tau += 1) if (yin[tau] < yin[best]) best = tau
    tauEstimate = best
  }

  const clarity = Math.max(0, Math.min(1, 1 - yin[tauEstimate]))
  if (clarity < minClarity) return null
  const previous = yin[tauEstimate - 1] ?? yin[tauEstimate]
  const current = yin[tauEstimate]
  const next = yin[tauEstimate + 1] ?? current
  const denominator = 2 * (2 * current - next - previous)
  const adjustment = denominator === 0 ? 0 : (next - previous) / denominator
  const refinedTau = tauEstimate + Math.max(-1, Math.min(1, adjustment))
  const frequency = sampleRate / refinedTau
  if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency) return null
  return { frequency, clarity }
}
