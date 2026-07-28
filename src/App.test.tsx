import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { savePresetSelection } from './stores/presetStore'

describe('preset selection restoration', () => {
  afterEach(() => localStorage.clear())

  it('restores the saved mode and keeps the Presets page selection synchronized', () => {
    localStorage.clear()
    savePresetSelection({ mode: 'bass5', activePresetId: 'bass5-standard', selectedStringId: 'string-1' })
    const { container } = render(<App />)

    expect(screen.getByRole('combobox')).toHaveValue('bass5')
    fireEvent.click(screen.getByRole('button', { name: /PRESETS/ }))
    const bassSection = container.querySelector<HTMLElement>('[data-instrument="bass5"]')
    const activePreset = within(bassSection!).getByRole('button', { current: true })
    expect(activePreset).toHaveTextContent('5弦ベース')
    expect(activePreset).toHaveTextContent('レギュラー')
  })
})
