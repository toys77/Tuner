import type { DetectorResult } from '../types/tuner'

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export class PitchSmoother {
  private history: number[] = []
  private smoothed: number | null = null
  private lastAcceptedAt = 0

  constructor(private readonly capacity = 5) {}

  push(result: DetectorResult, strength: number, now = performance.now()): DetectorResult | null {
    if (!Number.isFinite(result.frequency) || result.frequency <= 0 || result.clarity < 0.65) return null
    let candidate = result.frequency
    if (this.smoothed) {
      const ratio = candidate / this.smoothed
      if (ratio > 1.92 && ratio < 2.08) candidate /= 2
      else if (ratio > 0.48 && ratio < 0.52) candidate *= 2
      const centsJump = Math.abs(1200 * Math.log2(candidate / this.smoothed))
      if (centsJump > 700 && result.clarity < 0.9) return null
    }
    this.history.push(candidate)
    if (this.history.length > this.capacity) this.history.shift()
    const robustCandidate = median(this.history.slice(-3))
    const smoothing = Math.min(0.9, Math.max(0.15, strength))
    const alpha = Math.max(0.18, 1 - smoothing)
    this.smoothed = this.smoothed == null ? robustCandidate : this.smoothed + alpha * (robustCandidate - this.smoothed)
    this.lastAcceptedAt = now
    return { frequency: this.smoothed, clarity: result.clarity }
  }

  isSilent(timeoutMs: number, now = performance.now()): boolean {
    return this.lastAcceptedAt === 0 || now - this.lastAcceptedAt > timeoutMs
  }

  reset(): void {
    this.history = []
    this.smoothed = null
    this.lastAcceptedAt = 0
  }
}
