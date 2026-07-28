interface TuningMeterProps {
  cents: number | null
  range: 25 | 50
  reverse?: boolean
  inTune?: boolean
}

export function TuningMeter({ cents, range, reverse = false, inTune = false }: TuningMeterProps) {
  const safe = cents == null ? 0 : Math.max(-range, Math.min(range, cents))
  const position = 50 + (safe / range) * 50 * (reverse ? -1 : 1)
  const ticks = Array.from({ length: 11 }, (_, index) => -range + index * (range * 2 / 10))
  const valueText = cents == null ? '入力待ち' : `${cents >= 0 ? '+' : ''}${cents.toFixed(1)} セント`
  return (
    <figure className={`tuning-meter${inTune ? ' is-in-tune' : ''}`} aria-label={`チューニングメーター: ${valueText}`}>
      <div className="meter-scale" aria-hidden="true">
        <div className="tune-zone" />
        {ticks.map((tick, index) => (
          <span key={tick} className={`meter-tick${tick === 0 ? ' center' : ''}${index % 2 === 1 && tick !== 0 ? ' minor' : ''}`} style={{ left: `${50 + (tick / range) * 50}%` }}>
            <i />
            <small>{tick === 0 ? '0' : Math.round(tick)}</small>
          </span>
        ))}
        <div className={`meter-needle${cents == null ? ' is-idle' : ''}`} style={{ left: `${position}%` }}>
          <span />
        </div>
      </div>
      <figcaption className="meter-labels">
        <span>{reverse ? '高い' : '低い'}<small>{reverse ? 'SHARP' : 'FLAT'}</small></span>
        <span className="center-label">適正<small>IN TUNE</small></span>
        <span>{reverse ? '低い' : '高い'}<small>{reverse ? 'FLAT' : 'SHARP'}</small></span>
      </figcaption>
    </figure>
  )
}
