import type { PitchStatus, ToleranceSettings } from '../types/tuner'

export function classifyCents(cents: number, tolerance: ToleranceSettings): PitchStatus {
  if (!Number.isFinite(cents)) return 'idle'
  const value = Math.abs(cents)
  if (value <= tolerance.inTune) return 'in-tune'
  if (value <= tolerance.near) return 'near'
  if (value <= tolerance.slight) return cents < 0 ? 'low' : 'high'
  return 'far'
}

export function pitchStatusLabel(status: PitchStatus, cents: number, japanese = true): string {
  if (status === 'idle') return japanese ? '待機中' : 'STANDBY'
  if (status === 'listening') return japanese ? '検出中' : 'LISTENING'
  if (status === 'no-input') return japanese ? '音を入力してください' : 'NO INPUT'
  if (status === 'in-tune') return japanese ? '適正' : 'IN TUNE'
  if (status === 'near') return japanese ? 'ほぼ適正' : 'NEARLY IN TUNE'
  if (status === 'far') return cents < 0 ? (japanese ? '大きく低い' : 'VERY LOW') : (japanese ? '大きく高い' : 'VERY HIGH')
  if (status === 'low') return japanese ? '少し低い' : 'SLIGHTLY LOW'
  return japanese ? '少し高い' : 'SLIGHTLY HIGH'
}
