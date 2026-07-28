import { useMemo, useState } from 'react'
import { DEFAULT_PRESETS, MODE_LABELS } from '../presets/defaultPresets'
import { getPresetDisplayName, getPresetInstrumentDisplayName } from '../presets/presetLabels'
import type { TuningPreset, TuningString } from '../types/preset'
import { midiToNoteParts, noteNameToMidi } from '../utils/notes'
import { duplicateCustomPreset } from '../stores/presetStore'

interface PresetsPageProps {
  customPresets: TuningPreset[]
  activePresetId: string | null
  onCustomPresetsChange: (presets: TuningPreset[]) => void
  onSelect: (preset: TuningPreset) => void
}

function newPreset(): TuningPreset {
  const id = crypto.randomUUID?.() ?? `custom-${Date.now()}`
  return {
    id,
    name: 'My Tuning',
    instrument: 'カスタム楽器',
    mode: 'custom',
    strings: [40, 45, 50, 55, 59, 64].map((midi, index) => {
      const part = midiToNoteParts(midi)
      return { id: `${id}-string-${index}`, note: part.note, octave: part.octave, midi }
    }),
    favorite: false,
  }
}

function PresetEditor({ initial, onSave, onCancel }: { initial: TuningPreset; onSave: (preset: TuningPreset) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<TuningPreset>(() => ({ ...initial, instrument: getPresetInstrumentDisplayName(initial), strings: initial.strings.map((item) => ({ ...item })) }))
  const updateString = (index: number, patch: Partial<TuningString>) => {
    setDraft((current) => ({ ...current, strings: current.strings.map((item, itemIndex) => {
      if (itemIndex !== index) return item
      const next = { ...item, ...patch }
      return { ...next, midi: noteNameToMidi(next.note, next.octave) }
    }) }))
  }
  const move = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const strings = [...current.strings]
      const target = index + direction
      if (target < 0 || target >= strings.length) return current
      ;[strings[index], strings[target]] = [strings[target], strings[index]]
      return { ...current, strings }
    })
  }
  const valid = draft.name.trim() && draft.instrument.trim() && draft.strings.length > 0 && draft.strings.every((item) => Number.isFinite(item.midi))
  return (
    <section className="preset-editor" aria-label="カスタムチューニング編集">
      <header><div><span className="eyebrow">CUSTOM CONFIGURATION</span><h2>チューニング編集</h2></div><button className="icon-button" onClick={onCancel} aria-label="閉じる">×</button></header>
      <div className="editor-fields">
        <label>プリセット名<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label>楽器名<input value={draft.instrument} onChange={(event) => setDraft({ ...draft, instrument: event.target.value })} /></label>
      </div>
      <div className="string-editor">
        <div className="string-editor-head"><span>弦の並び順</span><small>{draft.strings.length} STRINGS</small></div>
        {draft.strings.map((string, index) => (
          <div className="string-row" key={string.id}>
            <span className="string-number">{index + 1}</span>
            <label>音名<input value={string.note} onChange={(event) => updateString(index, { note: event.target.value })} aria-invalid={!Number.isFinite(string.midi)} /></label>
            <label>Oct<select value={string.octave} onChange={(event) => updateString(index, { octave: Number(event.target.value) })}>{[0, 1, 2, 3, 4, 5, 6].map((octave) => <option key={octave}>{octave}</option>)}</select></label>
            <div className="reorder-buttons"><button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`${index + 1}弦を上へ`}>↑</button><button onClick={() => move(index, 1)} disabled={index === draft.strings.length - 1} aria-label={`${index + 1}弦を下へ`}>↓</button></div>
            <button className="remove-button" onClick={() => setDraft({ ...draft, strings: draft.strings.filter((_, itemIndex) => itemIndex !== index) })} aria-label={`${index + 1}弦を削除`}>×</button>
          </div>
        ))}
        <button className="secondary-button" onClick={() => {
          const id = `${draft.id}-string-${Date.now()}`
          setDraft({ ...draft, strings: [...draft.strings, { id, note: 'E', octave: 2, midi: 40 }] })
        }}>＋ 弦を追加</button>
      </div>
      <footer><button className="secondary-button" onClick={onCancel}>キャンセル</button><button className="primary-button" disabled={!valid} onClick={() => onSave({ ...draft, name: draft.name.trim(), instrument: draft.instrument.trim(), builtin: false })}>保存する</button></footer>
    </section>
  )
}

export function PresetsPage({ customPresets, activePresetId, onCustomPresetsChange, onSelect }: PresetsPageProps) {
  const [editing, setEditing] = useState<TuningPreset | null>(null)
  const groups = useMemo(() => (['guitar', 'bass4', 'bass5', 'ukulele'] as const).map((mode) => ({ id: mode, instrument: MODE_LABELS[mode], presets: DEFAULT_PRESETS.filter((item) => item.mode === mode) })), [])
  const save = (preset: TuningPreset) => {
    const found = customPresets.some((item) => item.id === preset.id)
    onCustomPresetsChange(found ? customPresets.map((item) => item.id === preset.id ? preset : item) : [...customPresets, preset])
    setEditing(null)
  }
  if (editing) return <PresetEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />
  return (
    <main className="content-page presets-page">
      <header className="page-header"><div><span className="eyebrow">TUNING LIBRARY</span><h1>プリセット</h1></div><button className="primary-button compact" onClick={() => setEditing(newPreset())}>＋ 新規作成</button></header>
      <section className="custom-section" data-collection="custom">
        <div className="section-heading"><h2>CUSTOM</h2><span>{customPresets.length.toString().padStart(2, '0')} ENTRIES</span></div>
        {customPresets.length === 0 ? <div className="empty-state"><strong>カスタム設定はありません</strong><p>楽器や弦数、各弦の音程を自由に登録できます。</p></div> : (
          <div className="preset-grid">{[...customPresets].sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite))).map((preset) => (
            <article className={`preset-card custom${activePresetId === preset.id ? ' is-selected' : ''}`} key={preset.id} data-favorite={preset.favorite ? 'true' : 'false'}>
              <button className="preset-main" onClick={() => onSelect(preset)} aria-current={activePresetId === preset.id ? 'true' : undefined}><span>{getPresetInstrumentDisplayName(preset)}</span><strong title={getPresetDisplayName(preset)}>{getPresetDisplayName(preset)}</strong><small>{preset.strings.map((item) => `${item.note}${item.octave}`).join(' · ')}</small>{activePresetId === preset.id && <b className="selected-indicator">ACTIVE</b>}</button>
              <div className="preset-actions">
                <button onClick={() => onCustomPresetsChange(customPresets.map((item) => item.id === preset.id ? { ...item, favorite: !item.favorite } : item))} aria-label="お気に入り">{preset.favorite ? '★' : '☆'}</button>
                <button onClick={() => setEditing(preset)}>編集</button>
                <button onClick={() => onCustomPresetsChange([...customPresets, duplicateCustomPreset(preset)])}>複製</button>
                <button onClick={() => { if (confirm(`「${preset.name}」を削除しますか？`)) onCustomPresetsChange(customPresets.filter((item) => item.id !== preset.id)) }}>削除</button>
              </div>
            </article>
          ))}</div>
        )}
      </section>
      {groups.map((group) => (
        <section key={group.id} data-collection="instrument" data-instrument={group.id}>
          <div className="section-heading"><h2>{group.instrument.toUpperCase()}</h2><span>{group.presets.length.toString().padStart(2, '0')} PRESETS</span></div>
          <div className="preset-grid builtins">{group.presets.map((preset) => (
            <button className={`preset-card${activePresetId === preset.id ? ' is-selected' : ''}`} key={preset.id} onClick={() => onSelect(preset)} aria-current={activePresetId === preset.id ? 'true' : undefined}>
              <span>{getPresetInstrumentDisplayName(preset)}</span><strong title={getPresetDisplayName(preset)}>{getPresetDisplayName(preset)}</strong><small>{preset.strings.map((item) => `${item.note}${item.octave}`).join(' · ')}</small>{activePresetId === preset.id && <b className="selected-indicator">ACTIVE</b>}<i aria-hidden="true">→</i>
            </button>
          ))}</div>
        </section>
      ))}
    </main>
  )
}
