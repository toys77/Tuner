interface NoteDisplayProps {
  note: string
  octave: number | null
  target?: string
  active: boolean
}

export function NoteDisplay({ note, octave, target, active }: NoteDisplayProps) {
  return (
    <div className={`note-display${active ? ' is-active' : ''}`} aria-live="polite" aria-atomic="true">
      <span className="eyebrow">DETECTED NOTE</span>
      <div className="note-glyph" aria-label={active && octave !== null ? `${note}${octave}` : '音程未検出'}>
        <span>{note}</span>
        {octave !== null && <sup>{octave}</sup>}
      </div>
      <div className="target-readout">TARGET <strong>{target ?? 'AUTO'}</strong></div>
    </div>
  )
}
