import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TunerFeedback } from '../utils/tunerFeedback'
import { InputLevel } from './InputLevel'
import { StatusLabel } from './StatusLabel'

const waiting: TunerFeedback = {
  key: 'waiting',
  label: '入力待ち',
  english: 'WAITING',
  message: '1本の弦を鳴らしてください。',
  symbol: '◇',
}

const clipping: TunerFeedback = {
  key: 'clipping',
  label: '入力過多',
  english: 'CLIPPING',
  message: '入力音が大きすぎます。端末を楽器から離してください。',
  symbol: '!',
}

describe('fixed tuner feedback regions', () => {
  it('updates status text inside one persistent live region', () => {
    const { rerender } = render(<StatusLabel feedback={waiting} />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveTextContent('入力待ち')
    expect(region.querySelector('.pitch-status__english')).toHaveTextContent('WAITING')

    rerender(<StatusLabel feedback={clipping} />)
    expect(screen.getByRole('status')).toBe(region)
    expect(region).toHaveTextContent('入力過多')
    expect(region.querySelector('.pitch-status__english')).toHaveTextContent('CLIPPING')
  })

  it('keeps the microphone message element mounted for empty and long messages', () => {
    const { rerender } = render(<InputLevel rms={0} status="no-input" active={false} message="" />)
    const feedbackRegion = screen.getByLabelText('マイク入力状態')
    const message = feedbackRegion.querySelector('.microphone-feedback__message')
    expect(message).toBeInTheDocument()
    expect(message?.textContent).toBe('\u00a0')
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0')

    rerender(<InputLevel rms={1} status="clipping" active message={clipping.message} />)
    expect(feedbackRegion.querySelector('.microphone-feedback__message')).toBe(message)
    expect(message).toHaveTextContent(clipping.message)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100')
  })
})
