import { useEffect, useId, useRef, useState } from 'react'
import { getPresetDisplayName, getPresetInstrumentDisplayName } from '../presets/presetLabels'
import type { TuningPreset } from '../types/preset'

interface PresetSelectorProps {
  preset: TuningPreset
  options: TuningPreset[]
  onSelect: (preset: TuningPreset) => void
  onViewAll: () => void
}

export function PresetSelector({ preset, options, onSelect, onViewAll }: PresetSelectorProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const dialogId = `preset-selector-${useId().replace(/:/g, '')}`
  const presetName = getPresetDisplayName(preset)
  const instrumentName = getPresetInstrumentDisplayName(preset)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const selectedOption = dialogRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')
    ;(selectedOption ?? dialogRef.current)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="preset-selector"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={`選択中のプリセット: ${instrumentName}、${presetName}。プリセットを変更`}
        onClick={() => setOpen(true)}
      >
        <span className="preset-selector-label">PRESET</span>
        <span className="preset-instrument">{instrumentName}</span>
        <strong className="preset-name">{presetName}</strong>
        <span className="preset-chevron" aria-hidden="true">⌄</span>
      </button>

      {open && (
        <div className="preset-sheet-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <section ref={dialogRef} id={dialogId} className="preset-sheet" role="dialog" aria-modal="true" aria-labelledby={`${dialogId}-title`} tabIndex={-1}>
            <header className="preset-sheet-header">
              <div><span className="eyebrow">TUNING SELECTOR</span><h2 id={`${dialogId}-title`}>プリセットを選択</h2></div>
              <button type="button" className="icon-button" aria-label="プリセット選択を閉じる" onClick={() => setOpen(false)}>×</button>
            </header>
            <div className="preset-sheet-instrument">{instrumentName}</div>
            <div className="preset-sheet-list" role="list">
              {options.map((option) => {
                const selected = option.id === preset.id
                const optionName = getPresetDisplayName(option)
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={selected ? 'is-selected' : ''}
                    aria-current={selected ? 'true' : undefined}
                    aria-label={`${selected ? '選択中: ' : ''}${optionName}`}
                    onClick={() => { onSelect(option); setOpen(false) }}
                  >
                    <span aria-hidden="true">{selected ? '✓' : '—'}</span>
                    <strong>{optionName}</strong>
                  </button>
                )
              })}
            </div>
            <footer className="preset-sheet-actions">
              <button type="button" className="secondary-button" onClick={() => setOpen(false)}>閉じる</button>
              <button type="button" className="primary-button" onClick={() => { setOpen(false); onViewAll() }}>すべてのプリセットを見る</button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
