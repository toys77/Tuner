import { useEffect, useMemo, useState } from 'react'
import { BottomNavigation, type AppPage } from './components/BottomNavigation'
import { MODE_DEFAULT_PRESET, DEFAULT_PRESETS } from './presets/defaultPresets'
import { PresetsPage } from './pages/PresetsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TunerPage } from './pages/TunerPage'
import { loadCustomPresets, saveCustomPresets } from './stores/presetStore'
import { loadSettings, resetSettings, saveSettings } from './stores/settingsStore'
import type { TuningPreset } from './types/preset'
import type { TunerMode } from './types/tuner'

export default function App() {
  const [page, setPage] = useState<AppPage>('tuner')
  const [settings, setSettings] = useState(loadSettings)
  const [customPresets, setCustomPresets] = useState(loadCustomPresets)
  const [mode, setMode] = useState<TunerMode>('chromatic')
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [selectedStringId, setSelectedStringId] = useState<string | null>(null)
  const allPresets = useMemo(() => [...DEFAULT_PRESETS, ...customPresets], [customPresets])
  const activePreset = allPresets.find((item) => item.id === activePresetId) ?? null

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.dataset.theme = settings.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'dark' ? '#292925' : '#ded8c8')
  }, [settings])

  useEffect(() => { saveCustomPresets(customPresets) }, [customPresets])

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
      {page === 'tuner' && <TunerPage settings={settings} mode={mode} preset={activePreset} selectedStringId={selectedStringId} onModeChange={changeMode} onStringChange={(id) => { setSelectedStringId(id); if (settings.autoString) setSettings({ ...settings, autoString: false }) }} onOpenSettings={() => setPage('settings')} />}
      {page === 'presets' && <PresetsPage customPresets={customPresets} onCustomPresetsChange={setCustomPresets} onSelect={selectPreset} />}
      {page === 'settings' && <SettingsPage settings={settings} onChange={setSettings} onReset={() => setSettings(resetSettings())} />}
      <BottomNavigation page={page} onChange={setPage} />
    </div>
  )
}
