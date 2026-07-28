import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TuningPreset } from '../types/preset'
import { PresetsPage } from './PresetsPage'

describe('preset Japanese display labels', () => {
  it('shows Japanese five-string bass labels and selects by the unchanged id', () => {
    const onSelect = vi.fn()
    const { container } = render(<PresetsPage customPresets={[]} activePresetId="bass5-standard" onCustomPresetsChange={vi.fn()} onSelect={onSelect} />)
    const section = container.querySelector<HTMLElement>('[data-instrument="bass5"]')
    expect(section).not.toBeNull()
    const scope = within(section!)

    expect(scope.getAllByText('5弦ベース').length).toBeGreaterThan(0)
    expect(scope.getByText('レギュラー')).toBeInTheDocument()
    expect(scope.getByText('半音下げ')).toBeInTheDocument()
    expect(scope.getByText('全音下げ')).toBeInTheDocument()
    expect(scope.getByText('ドロップA')).toBeInTheDocument()

    fireEvent.click(scope.getByText('半音下げ').closest('button')!)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'bass5-half-down' }))
  })

  it('preserves a saved custom name and localizes the legacy default instrument in the editor', () => {
    const custom: TuningPreset = {
      id: 'saved-custom',
      name: 'Standard',
      instrument: 'Custom Instrument',
      mode: 'custom',
      strings: [{ id: 'one', note: 'E', octave: 2, midi: 40 }],
    }
    render(<PresetsPage customPresets={[custom]} activePresetId="saved-custom" onCustomPresetsChange={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(screen.getByText('カスタム楽器')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '編集' }))
    expect(screen.getByLabelText('プリセット名')).toHaveValue('Standard')
    expect(screen.getByLabelText('楽器名')).toHaveValue('カスタム楽器')
  })
})
