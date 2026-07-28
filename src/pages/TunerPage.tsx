import { useEffect, useMemo, useRef, useState } from 'react'
import { InputLevel } from '../components/InputLevel'
import { NoteDisplay } from '../components/NoteDisplay'
import { PresetSelector } from '../components/PresetSelector'
import { StatusLabel } from '../components/StatusLabel'
import { TuningMeter } from '../components/TuningMeter'
import { useMicrophone, type MicrophoneStatus } from '../hooks/useMicrophone'
import { usePitchDetection } from '../hooks/usePitchDetection'
import { useReferenceTone } from '../hooks/useReferenceTone'
import { useWakeLock } from '../hooks/useWakeLock'
import { MODE_LABELS } from '../presets/defaultPresets'
import { isPresetCompatibleWithMode } from '../presets/presetLabels'
import type { TuningPreset } from '../types/preset'
import type { AppSettings, PitchStatus, TunerMode } from '../types/tuner'
import { classifyCents } from '../utils/cents'
import { midiToFrequency } from '../utils/frequency'
import { midiToNoteParts } from '../utils/notes'
import { createPitchReading } from '../utils/pitchReading'
import { getTunerFeedback } from '../utils/tunerFeedback'

interface TunerPageProps {
  settings: AppSettings
  mode: TunerMode
  preset: TuningPreset | null
  availablePresets: TuningPreset[]
  selectedStringId: string | null
  onModeChange: (mode: TunerMode) => void
  onPresetSelect: (preset: TuningPreset) => void
  onViewAllPresets: () => void
  onStringChange: (id: string) => void
  onOpenSettings: () => void
}

export function MicrophonePrompt({ status, error, onStart }: { status: MicrophoneStatus; error: string; onStart: () => void }) {
  const denied = status === 'denied'
  const unsupported = status === 'unsupported'
  return (
    <section className={`microphone-prompt${denied || unsupported || status === 'error' ? ' has-error' : ''}`} aria-labelledby="microphone-title">
      <div className="prompt-icon" aria-hidden="true">◉</div>
      <div className="prompt-copy">
        <span className="eyebrow">LOCAL AUDIO PROCESSING</span>
        <h2 id="microphone-title">マイクを有効にする</h2>
        <p className="prompt-description">楽器の音程を検出するためにマイクを使用します。音声は端末内だけで処理し、録音・保存・外部送信は行いません。</p>
        {error && <p className="error-message" role="alert">{error}</p>}
        {denied && (
          <ol className="permission-steps">
            <li>ブラウザのサイト設定を開く</li>
            <li>このサイトのマイク権限を「許可」にする</li>
            <li>ページを再読み込みする</li>
          </ol>
        )}
        {unsupported && <p>Chrome、Safari、Edgeなど、Web Audioとマイク入力に対応したブラウザで開いてください。</p>}
        {!denied && !unsupported && (
          <div className="prompt-action">
            <button className="primary-button mic-primary" type="button" onClick={onStart} disabled={status === 'requesting'}>
              <span aria-hidden="true">◉</span>{status === 'requesting' ? '接続しています…' : 'マイクを使用する'}
            </button>
            <small>タップするとブラウザの権限確認が表示されます</small>
          </div>
        )}
      </div>
    </section>
  )
}

export function TunerPage({ settings, mode, preset, availablePresets, selectedStringId, onModeChange, onPresetSelect, onViewAllPresets, onStringChange, onOpenSettings }: TunerPageProps) {
  const microphone = useMicrophone()
  const detection = usePitchDetection(microphone.session, settings)
  const tone = useReferenceTone()
  const wakeLock = useWakeLock(settings.wakeLock && microphone.status === 'listening')
  const detectedReading = useMemo(
    () => detection.result ? createPitchReading(detection.result, settings, preset, selectedStringId) : null,
    [detection.result, preset, selectedStringId, settings],
  )
  const microphoneActive = microphone.status === 'listening'
  const reading = microphoneActive ? detectedReading : null
  const status: PitchStatus = microphone.status !== 'listening'
    ? 'idle'
    : reading
      ? classifyCents(reading.cents, settings.tolerance)
      : detection.inputStatus === 'no-input' ? 'no-input' : 'listening'
  const previousStatus = useRef<PitchStatus>('idle')
  const [toneMidi, setToneMidi] = useState(69)
  const [hasEnteredConsole, setHasEnteredConsole] = useState(false)

  useEffect(() => {
    if (microphoneActive) setHasEnteredConsole(true)
  }, [microphoneActive])

  useEffect(() => {
    if (status === 'in-tune' && previousStatus.current !== 'in-tune' && settings.vibration && navigator.vibrate) navigator.vibrate(35)
    previousStatus.current = status
  }, [settings.vibration, status])

  useEffect(() => {
    if (!preset?.strings.length) return
    const selected = preset.strings.find((string) => string.id === selectedStringId) ?? preset.strings[0]
    setToneMidi(selected.midi)
  }, [preset, selectedStringId])

  const cents = reading?.cents ?? 0
  const isInTune = status === 'in-tune'
  const selectedToneFrequency = midiToFrequency(toneMidi, settings.referencePitch)
  const toneNote = midiToNoteParts(toneMidi, settings.accidental, settings.noteLanguage, settings.germanB)
  const compatiblePresets = useMemo(() => availablePresets.filter((item) => isPresetCompatibleWithMode(item, mode)), [availablePresets, mode])
  const feedback = useMemo(() => getTunerFeedback({
    microphoneActive,
    inputStatus: detection.inputStatus,
    pitchStatus: status,
    cents,
    hasReading: Boolean(reading),
  }), [cents, detection.inputStatus, microphoneActive, reading, status])
  const showConsole = microphoneActive || hasEnteredConsole

  return (
    <main className={`tuner-page state-${status}`}>
      <header className="system-header">
        <div className="system-title"><span className="system-mark" aria-hidden="true">QT</span><div><strong>TUNER SYSTEM</strong><small>PRECISION AUDIO TERMINAL</small></div></div>
        <button className="icon-button" type="button" onClick={onOpenSettings} aria-label="設定を開く">⚙</button>
      </header>

      <section className="mode-strip" aria-label="チューニングモード">
        <label>
          <span>MODE</span>
          <select value={mode} onChange={(event) => onModeChange(event.target.value as TunerMode)}>
            {Object.entries(MODE_LABELS).filter(([key]) => key !== 'custom').map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            {mode === 'custom' && <option value="custom">{MODE_LABELS.custom}</option>}
          </select>
        </label>
        <div><span>REFERENCE</span><strong>A4 = {settings.referencePitch} Hz</strong></div>
        <div className={`system-dot ${microphone.status}`}><i />{microphone.status === 'listening' ? 'MIC ON' : 'MIC OFF'}</div>
      </section>

      {!showConsole ? (
        <MicrophonePrompt status={microphone.status} error={microphone.error} onStart={() => void microphone.start()} />
      ) : (
        <div className="tuner-console">
          {preset && (
            <div className="preset-row">
              <PresetSelector preset={preset} options={compatiblePresets} onSelect={onPresetSelect} onViewAll={onViewAllPresets} />
              <div className="string-selector" aria-label="対象弦">
                {preset.strings.map((string, index) => {
                  const note = midiToNoteParts(string.midi, settings.accidental, settings.noteLanguage, settings.germanB)
                  const selected = settings.autoString ? reading?.targetLabel === `${note.note}${note.octave}` : selectedStringId === string.id
                  return <button key={string.id} type="button" className={selected ? 'active' : ''} onClick={() => onStringChange(string.id)} disabled={settings.autoString} aria-label={`${index + 1}弦 ${note.note}${note.octave}`}>{note.note}<sup>{note.octave}</sup></button>
                })}
              </div>
            </div>
          )}

          <section className="pitch-panel" aria-label="検出結果">
            <NoteDisplay note={reading?.note ?? '—'} octave={reading?.octave ?? null} target={reading?.targetLabel} active={Boolean(reading)} />
            <div className="deviation-readout">
              <span>DEVIATION</span>
              {settings.showCents
                ? <strong>{reading ? `${reading.cents >= 0 ? '+' : '−'}${Math.abs(reading.cents).toFixed(1)}` : '—.—'}<small> cents</small></strong>
                : <strong className="value-hidden">—</strong>}
              <StatusLabel feedback={feedback} />
            </div>
            <div className="auxiliary-readout">
              {settings.showFrequency && <div><span>FREQUENCY</span><strong>{reading ? reading.frequency.toFixed(2) : '—.—'}<small> Hz</small></strong></div>}
              <div><span>CONFIDENCE</span><strong>{reading ? Math.round(reading.clarity * 100) : 0}<small> %</small></strong></div>
            </div>
          </section>

          <TuningMeter cents={reading?.cents ?? null} range={settings.meterRange} reverse={settings.reverseMeter} inTune={isInTune} />
          <InputLevel rms={detection.rms} status={detection.inputStatus} active={microphoneActive} message={feedback.message} />

          <div className="console-actions">
            <button className="secondary-button mic-stop" type="button" disabled={microphone.status === 'requesting'} onClick={() => microphoneActive ? void microphone.stop() : void microphone.start()}>
              <span aria-hidden="true">{microphoneActive ? '■' : '▶'}</span> {microphoneActive ? 'マイク停止' : 'マイク開始'}
            </button>
            <details className="tone-panel">
              <summary>基準音を再生</summary>
              <div className="tone-controls">
                <label>音名
                  <select value={toneMidi} onChange={(event) => setToneMidi(Number(event.target.value))}>
                    {Array.from({ length: 49 }, (_, index) => 36 + index).map((midi) => {
                      const item = midiToNoteParts(midi, settings.accidental, settings.noteLanguage, settings.germanB)
                      return <option key={midi} value={midi}>{item.note}{item.octave}</option>
                    })}
                  </select>
                </label>
                <button type="button" onClick={() => tone.playing ? tone.stop() : void tone.play(selectedToneFrequency)}>{tone.playing ? '停止' : `${toneNote.note}${toneNote.octave} 再生`}</button>
                <button type="button" onClick={() => void tone.play(settings.referencePitch)}>A4</button>
                <label className="volume-control">音量<input type="range" min="0" max="0.6" step="0.02" value={tone.volume} onChange={(event) => tone.setVolume(Number(event.target.value))} /></label>
              </div>
              {tone.playing && <p role="status">スピーカーの基準音をマイクが検出する場合があります。</p>}
            </details>
          </div>
          <span className="wake-status">WAKE LOCK: {settings.wakeLock ? wakeLock.active ? 'ACTIVE' : wakeLock.supported ? 'STANDBY' : 'UNSUPPORTED' : 'OFF'}</span>
        </div>
      )}
    </main>
  )
}
