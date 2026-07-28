import type { TunerFeedback } from '../utils/tunerFeedback'

export function StatusLabel({ feedback }: { feedback: TunerFeedback }) {
  return (
    <div className={`pitch-status pitch-status-${feedback.key}`} role="status" aria-live="polite" aria-atomic="true">
      <div className="pitch-status__main">
        <span className="status-symbol" aria-hidden="true">{feedback.symbol}</span>
        <strong>{feedback.label}</strong>
      </div>
      <small className="pitch-status__english" aria-hidden="true">{feedback.english}</small>
    </div>
  )
}
