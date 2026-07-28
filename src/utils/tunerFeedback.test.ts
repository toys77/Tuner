import { describe, expect, it } from 'vitest'
import type { InputStatus, PitchStatus } from '../types/tuner'
import { getTunerFeedback } from './tunerFeedback'

function feedback(inputStatus: InputStatus, pitchStatus: PitchStatus, cents = 0, hasReading = false, microphoneActive = true) {
  return getTunerFeedback({ microphoneActive, inputStatus, pitchStatus, cents, hasReading })
}

describe('tuner feedback states', () => {
  it('uses short, stable main labels for every input state', () => {
    expect(feedback('no-input', 'idle', 0, false, false)).toMatchObject({ label: 'マイク停止中', english: 'MIC OFF' })
    expect(feedback('no-input', 'no-input')).toMatchObject({ label: '入力待ち', message: '1本の弦を鳴らしてください。' })
    expect(feedback('low', 'listening')).toMatchObject({ label: '入力不足', english: 'INPUT LOW' })
    expect(feedback('high', 'listening')).toMatchObject({ label: '入力過多', english: 'INPUT HIGH' })
    expect(feedback('clipping', 'listening')).toMatchObject({ label: '入力過多', english: 'CLIPPING' })
    expect(feedback('ok', 'listening')).toMatchObject({ label: '検出中', english: 'LISTENING' })
  })

  it('maps stable pitch readings without changing the detection result', () => {
    expect(feedback('ok', 'near', -3, true)).toMatchObject({ label: '安定待ち' })
    expect(feedback('ok', 'far', -22, true)).toMatchObject({ label: '低い' })
    expect(feedback('ok', 'in-tune', 0.5, true)).toMatchObject({ label: '適正' })
    expect(feedback('ok', 'far', 22, true)).toMatchObject({ label: '高い' })
  })

  it('keeps guidance concise and available for every state', () => {
    const states = [
      feedback('no-input', 'idle', 0, false, false),
      feedback('no-input', 'no-input'),
      feedback('low', 'listening'),
      feedback('high', 'listening'),
      feedback('clipping', 'listening'),
      feedback('ok', 'listening'),
      feedback('ok', 'near', 2, true),
      feedback('ok', 'low', -8, true),
      feedback('ok', 'in-tune', 0, true),
      feedback('ok', 'high', 8, true),
    ]
    expect(states.every((state) => state.message.length > 0)).toBe(true)
    expect(states.find((state) => state.key === 'clipping')?.message).toBe('入力音が大きすぎます。端末を楽器から離してください。')
  })
})
