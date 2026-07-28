import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_PRESETS } from '../presets/defaultPresets'
import { PresetSelector } from './PresetSelector'

const options = DEFAULT_PRESETS.filter((preset) => preset.mode === 'bass5')
const selected = options[0]

describe('tuner preset selector', () => {
  it('exposes dialog state and restores focus after Escape', async () => {
    render(<PresetSelector preset={selected} options={options} onSelect={vi.fn()} onViewAll={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: /選択中のプリセット: 5弦ベース、レギュラー/ })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'プリセットを選択' })).toHaveAttribute('id', trigger.getAttribute('aria-controls'))
    await waitFor(() => expect(screen.getByRole('button', { name: '選択中: レギュラー' })).toHaveFocus())

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('selects immediately, closes, and returns focus to the trigger', async () => {
    const onSelect = vi.fn()
    render(<PresetSelector preset={selected} options={options} onSelect={onSelect} onViewAll={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: /プリセットを変更/ })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: '半音下げ' }))

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'bass5-half-down' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('closes when the backdrop is pressed and opens the full preset view on request', async () => {
    const onViewAll = vi.fn()
    render(<PresetSelector preset={selected} options={options} onSelect={vi.fn()} onViewAll={onViewAll} />)
    const trigger = screen.getByRole('button', { name: /プリセットを変更/ })
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog.parentElement!)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'すべてのプリセットを見る' }))
    expect(onViewAll).toHaveBeenCalledOnce()
  })
})
