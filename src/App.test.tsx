import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const microphone = vi.hoisted(() => ({
  start: vi.fn(async () => undefined),
  stop: vi.fn(async () => undefined),
  status: 'idle' as const,
  error: '',
  session: null,
}))

vi.mock('./hooks/useMicrophone', () => ({ useMicrophone: () => microphone }))

import App from './App'
import { savePresetSelection } from './stores/presetStore'

describe('preset selection restoration', () => {
  beforeEach(() => microphone.start.mockClear())
  afterEach(() => localStorage.clear())

  it('starts the microphone automatically once and keeps it across page navigation', async () => {
    render(<App />)
    await waitFor(() => expect(microphone.start).toHaveBeenCalledOnce())

    fireEvent.click(screen.getByRole('button', { name: /PRESETS/ }))
    fireEvent.click(screen.getByRole('button', { name: /SETTINGS/ }))
    fireEvent.click(screen.getByRole('button', { name: /TUNER/ }))
    expect(microphone.start).toHaveBeenCalledOnce()
  })

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
