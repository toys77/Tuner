import type { InputStatus } from '../types/tuner'

const LABELS: Record<InputStatus, string> = {
  'no-input': 'NO INPUT',
  low: 'INPUT LOW',
  ok: 'INPUT OK',
  high: 'INPUT HIGH',
  clipping: 'CLIPPING',
}

interface InputLevelProps {
  rms: number
  status: InputStatus
  active: boolean
  message: string
}

export function InputLevel({ rms, status, active, message }: InputLevelProps) {
  const level = active ? Math.min(100, Math.max(0, Math.sqrt(Math.min(rms, 1)) * 100)) : 0
  return (
    <section className={`input-level microphone-feedback status-${active ? status : 'inactive'}`} aria-label="マイク入力状態">
      <div className="input-heading microphone-feedback__header"><span>MICROPHONE LEVEL</span><strong>{active ? LABELS[status] : 'MIC OFF'}</strong></div>
      <div className="level-track" role="meter" aria-label="マイク入力レベル" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level)}>
        <span style={{ width: `${level}%` }} />
      </div>
      <p className="microphone-feedback__message" aria-live="off">{message || '\u00a0'}</p>
    </section>
  )
}
