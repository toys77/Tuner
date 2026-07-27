import type { PitchStatus } from '../types/tuner'
import { pitchStatusLabel } from '../utils/cents'

export function StatusLabel({ status, cents }: { status: PitchStatus; cents: number }) {
  return (
    <div className={`pitch-status pitch-status-${status}`} role="status">
      <span className="status-symbol" aria-hidden="true">{status === 'in-tune' ? '◆' : cents < 0 ? '◀' : cents > 0 ? '▶' : '◇'}</span>
      <strong>{pitchStatusLabel(status, cents)}</strong>
      <small>{pitchStatusLabel(status, cents, false)}</small>
    </div>
  )
}
