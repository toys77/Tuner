import type { InputStatus } from '../types/tuner'

const LABELS: Record<InputStatus, string> = {
  'no-input': 'NO INPUT',
  low: 'INPUT LOW',
  ok: 'INPUT OK',
  high: 'INPUT HIGH',
  clipping: 'CLIPPING',
}

export function InputLevel({ rms, status }: { rms: number; status: InputStatus }) {
  const level = Math.min(100, Math.max(0, Math.sqrt(Math.min(rms, 1)) * 100))
  const advice = status === 'low'
    ? 'もう少し強く1本の弦を鳴らすか、端末を楽器へ近づけてください。'
    : status === 'high' || status === 'clipping'
      ? '端末を少し離すか、入力音量を下げてください。'
      : ''
  return (
    <div className={`input-level status-${status}`}>
      <div className="input-heading"><span>MICROPHONE LEVEL</span><strong>{LABELS[status]}</strong></div>
      <div className="level-track" role="meter" aria-label="マイク入力レベル" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level)}>
        <span style={{ width: `${level}%` }} />
      </div>
      {advice && <p>{advice}</p>}
    </div>
  )
}
