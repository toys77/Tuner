import type { AppSettings } from '../types/tuner'

interface SettingsPageProps {
  settings: AppSettings
  onChange: (settings: AppSettings) => void
  onReset: () => void
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="toggle-row"><span><strong>{label}</strong>{description && <small>{description}</small>}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>
}

export function SettingsPage({ settings, onChange, onReset }: SettingsPageProps) {
  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => onChange({ ...settings, [key]: value })
  return (
    <main className="content-page settings-page">
      <header className="page-header"><div><span className="eyebrow">SYSTEM CONFIGURATION</span><h1>設定</h1></div><span className="config-version">CFG / 01</span></header>
      <section className="settings-group">
        <div className="section-heading"><h2>PITCH REFERENCE</h2><span>基準ピッチ</span></div>
        <div className="reference-setting">
          <div className="reference-number"><span>A4</span><input type="number" min="415" max="466" step="1" value={settings.referencePitch} onChange={(event) => update('referencePitch', Number(event.target.value))} aria-label="基準ピッチ" /><small>Hz</small></div>
          <input type="range" min="415" max="466" step="1" value={settings.referencePitch} onChange={(event) => update('referencePitch', Number(event.target.value))} aria-label="基準ピッチスライダー" />
          <div className="quick-values">{[432, 440, 442].map((value) => <button key={value} className={settings.referencePitch === value ? 'active' : ''} onClick={() => update('referencePitch', value)}>{value} Hz</button>)}</div>
        </div>
      </section>
      <section className="settings-group">
        <div className="section-heading"><h2>DETECTION</h2><span>検出と表示</span></div>
        <div className="settings-list detection-settings">
          <div className="setting-subgroup">
            <div className="setting-subgroup-title"><span>01</span><div><strong>判定幅</strong><small>TOLERANCE</small></div></div>
            <label className="setting-control primary-setting"><span><strong>適正判定幅</strong><small>±{settings.tolerance.inTune} cents</small></span><input type="range" min="1" max="8" step="1" value={settings.tolerance.inTune} onChange={(event) => update('tolerance', { ...settings.tolerance, inTune: Number(event.target.value), near: Math.max(settings.tolerance.near, Number(event.target.value) + 1) })} /></label>
            <label className="setting-control"><span><strong>ほぼ適正の幅</strong><small>±{settings.tolerance.near} cents</small></span><input type="range" min={settings.tolerance.inTune + 1} max="12" step="1" value={settings.tolerance.near} onChange={(event) => update('tolerance', { ...settings.tolerance, near: Number(event.target.value), slight: Math.max(settings.tolerance.slight, Number(event.target.value) + 1) })} /></label>
            <label className="setting-control"><span><strong>少し調整の幅</strong><small>±{settings.tolerance.slight} cents</small></span><input type="range" min={settings.tolerance.near + 1} max="30" step="1" value={settings.tolerance.slight} onChange={(event) => update('tolerance', { ...settings.tolerance, slight: Number(event.target.value) })} /></label>
          </div>
          <div className="setting-subgroup">
            <div className="setting-subgroup-title"><span>02</span><div><strong>入力 / 解析</strong><small>INPUT & ANALYSIS</small></div></div>
            <label className="setting-control primary-setting"><span><strong>入力感度</strong><small>{settings.inputSensitivity.toFixed(1)}×</small></span><input type="range" min="0.5" max="2" step="0.1" value={settings.inputSensitivity} onChange={(event) => update('inputSensitivity', Number(event.target.value))} /></label>
            <label className="setting-control"><span><strong>平滑化</strong><small>{Math.round(settings.smoothing * 100)}%</small></span><input type="range" min="0.15" max="0.9" step="0.05" value={settings.smoothing} onChange={(event) => update('smoothing', Number(event.target.value))} /></label>
            <label className="setting-control"><span><strong>無音判定</strong><small>{settings.silenceTimeout} ms</small></span><input type="range" min="300" max="2000" step="100" value={settings.silenceTimeout} onChange={(event) => update('silenceTimeout', Number(event.target.value))} /></label>
            <Toggle label="自動弦判定" description="対象プリセットから最も近い弦を選択" checked={settings.autoString} onChange={(value) => update('autoString', value)} />
          </div>
          <div className="setting-subgroup">
            <div className="setting-subgroup-title"><span>03</span><div><strong>表示</strong><small>DISPLAY</small></div></div>
            <label className="select-row primary-setting"><span><strong>メーター範囲</strong><small>中央付近の感度</small></span><select value={settings.meterRange} onChange={(event) => update('meterRange', Number(event.target.value) as 25 | 50)}><option value="50">±50 cents</option><option value="25">±25 cents</option></select></label>
            <Toggle label="セント値を表示" checked={settings.showCents} onChange={(value) => update('showCents', value)} />
            <Toggle label="周波数を表示" checked={settings.showFrequency} onChange={(value) => update('showFrequency', value)} />
            <Toggle label="メーター方向を反転" checked={settings.reverseMeter} onChange={(value) => update('reverseMeter', value)} />
          </div>
        </div>
      </section>
      <section className="settings-group">
        <div className="section-heading"><h2>NOTATION & APPEARANCE</h2><span>表記と外観</span></div>
        <div className="settings-list">
          <label className="select-row"><span><strong>テーマ</strong></span><select value={settings.theme} onChange={(event) => update('theme', event.target.value as AppSettings['theme'])}><option value="light">ライト</option><option value="dark">ダーク</option></select></label>
          <label className="select-row"><span><strong>音名表記</strong></span><select value={settings.accidental} onChange={(event) => update('accidental', event.target.value as AppSettings['accidental'])}><option value="sharp">シャープ（♯）</option><option value="flat">フラット（♭）</option></select></label>
          <label className="select-row"><span><strong>音名言語</strong></span><select value={settings.noteLanguage} onChange={(event) => update('noteLanguage', event.target.value as AppSettings['noteLanguage'])}><option value="western">英語音名（C D E）</option><option value="solfege">日本語音名（ド レ ミ）</option></select></label>
          <Toggle label="ドイツ式 B / H 表記" checked={settings.germanB} onChange={(value) => update('germanB', value)} />
        </div>
      </section>
      <section className="settings-group">
        <div className="section-heading"><h2>DEVICE</h2><span>端末機能</span></div>
        <div className="settings-list">
          <Toggle label="振動フィードバック" description="適正になった瞬間だけ短く振動" checked={settings.vibration} onChange={(value) => update('vibration', value)} />
          <Toggle label="画面スリープ防止" description="対応ブラウザでチューニング中に有効" checked={settings.wakeLock} onChange={(value) => update('wakeLock', value)} />
        </div>
      </section>
      <section className="privacy-panel"><span className="eyebrow">PRIVACY / OFFLINE</span><h2>音声は端末の外へ出ません</h2><p>マイク音声はブラウザ内のメモリでリアルタイム解析し、録音・保存・外部送信を行いません。基本機能はオフラインでも利用できます。</p></section>
      <button className="danger-button" onClick={() => { if (confirm('すべての設定を初期値へ戻しますか？')) onReset() }}>設定を初期化</button>
    </main>
  )
}
