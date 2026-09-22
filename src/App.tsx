import { useEffect, useMemo, useRef, useState } from 'react'
import { BottomNavigation, type AppPage } from './components/BottomNavigation'
import { useMicrophone } from './hooks/useMicrophone'
import { MODE_DEFAULT_PRESET, DEFAULT_PRESETS } from './presets/defaultPresets'
import { PresetsPage } from './pages/PresetsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TunerPage } from './pages/TunerPage'
import { loadCustomPresets, loadPresetSelection, saveCustomPresets, savePresetSelection } from './stores/presetStore'
import { loadSettings, resetSettings, saveSettings } from './stores/settingsStore'
import type { TuningPreset } from './types/preset'
import type { TunerMode } from './types/tuner'

export default function App() {
  const [page, setPage] = useState<AppPage>('tuner')
  const microphone = useMicrophone()
  const autoStartAttempted = useRef(false)
  const [settings, setSettings] = useState(loadSettings)
  const [customPresets, setCustomPresets] = useState(loadCustomPresets)
  const [initialSelection] = useState(loadPresetSelection)
  const [mode, setMode] = useState<TunerMode>(initialSelection.mode)
  const [activePresetId, setActivePresetId] = useState<string | null>(initialSelection.activePresetId)
  const [selectedStringId, setSelectedStringId] = useState<string | null>(initialSelection.selectedStringId)
  const allPresets = useMemo(() => [...DEFAULT_PRESETS, ...customPresets], [customPresets])
  const activePreset = allPresets.find((item) => item.id === activePresetId) ?? null

  useEffect(() => {
    if (autoStartAttempted.current) return
    autoStartAttempted.current = true
    void microphone.start()
  }, [microphone.start])

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.dataset.theme = settings.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'dark' ? '#292925' : '#ded8c8')
  }, [settings])

  useEffect(() => { saveCustomPresets(customPresets) }, [customPresets])

  useEffect(() => {
    if (!activePresetId) return
    const restoredPreset = allPresets.find((item) => item.id === activePresetId)
    if (!restoredPreset) {
      setMode('chromatic')
      setActivePresetId(null)
      setSelectedStringId(null)
      return
    }
    if (mode !== restoredPreset.mode) setMode(restoredPreset.mode)
    if (!restoredPreset.strings.some((string) => string.id === selectedStringId)) setSelectedStringId(restoredPreset.strings[0]?.id ?? null)
  }, [activePresetId, allPresets, mode, selectedStringId])

  useEffect(() => {
    savePresetSelection({ mode, activePresetId, selectedStringId })
  }, [activePresetId, mode, selectedStringId])

  const selectPreset = (preset: TuningPreset) => {
    setActivePresetId(preset.id)
    setMode(preset.mode)
    setSelectedStringId(preset.strings[0]?.id ?? null)
    setPage('tuner')
  }

  const changeMode = (nextMode: TunerMode) => {
    setMode(nextMode)
    if (nextMode === 'chromatic') {
      setActivePresetId(null)
      setSelectedStringId(null)
      return
    }
    if (nextMode === 'custom') return
    const preset = allPresets.find((item) => item.id === MODE_DEFAULT_PRESET[nextMode]) ?? null
    setActivePresetId(preset?.id ?? null)
    setSelectedStringId(preset?.strings[0]?.id ?? null)
  }

  return (
    <div className="app-shell">
      <div className="background-grid" aria-hidden="true" />
      {page === 'tuner' && <TunerPage microphone={microphone} settings={settings} mode={mode} preset={activePreset} availablePresets={allPresets} selectedStringId={selectedStringId} onModeChange={changeMode} onPresetSelect={selectPreset} onViewAllPresets={() => setPage('presets')} onStringChange={(id) => { setSelectedStringId(id); if (settings.autoString) setSettings({ ...settings, autoString: false }) }} onOpenSettings={() => setPage('settings')} />}
      {page === 'presets' && <PresetsPage customPresets={customPresets} activePresetId={activePresetId} onCustomPresetsChange={setCustomPresets} onSelect={selectPreset} />}
      {page === 'settings' && <SettingsPage settings={settings} onChange={setSettings} onReset={() => setSettings(resetSettings())} />}
      <BottomNavigation page={page} onChange={setPage} />
    </div>
  )
}
