import type { InputStatus, PitchStatus } from '../types/tuner'

export type TunerFeedbackKey =
  | 'stopped'
  | 'waiting'
  | 'input-low'
  | 'input-high'
  | 'clipping'
  | 'detecting'
  | 'stabilizing'
  | 'low'
  | 'in-tune'
  | 'high'

export interface TunerFeedback {
  key: TunerFeedbackKey
  label: string
  english: string
  message: string
  symbol: string
}

const FEEDBACK: Record<TunerFeedbackKey, TunerFeedback> = {
  stopped: {
    key: 'stopped',
    label: 'マイク停止中',
    english: 'MIC OFF',
    message: 'マイクを開始すると音程を検出します。',
    symbol: '◇',
  },
  waiting: {
    key: 'waiting',
    label: '入力待ち',
    english: 'WAITING',
    message: '1本の弦を鳴らしてください。',
    symbol: '◇',
  },
  'input-low': {
    key: 'input-low',
    label: '入力不足',
    english: 'INPUT LOW',
    message: 'もう少し強く1本の弦を鳴らすか、端末を楽器へ近づけてください。',
    symbol: '△',
  },
  'input-high': {
    key: 'input-high',
    label: '入力過多',
    english: 'INPUT HIGH',
    message: '端末を少し楽器から離してください。',
    symbol: '△',
  },
  clipping: {
    key: 'clipping',
    label: '入力過多',
    english: 'CLIPPING',
    message: '入力音が大きすぎます。端末を楽器から離してください。',
    symbol: '!',
  },
  detecting: {
    key: 'detecting',
    label: '検出中',
    english: 'LISTENING',
    message: '音程を検出しています。',
    symbol: '◇',
  },
  stabilizing: {
    key: 'stabilizing',
    label: '安定待ち',
    english: 'STABILIZING',
    message: '弦を1本だけ鳴らし、音が安定するまで少し待ってください。',
    symbol: '◇',
  },
  low: {
    key: 'low',
    label: '低い',
    english: 'LOW',
    message: '音程が低いです。少し高く調整してください。',
    symbol: '◀',
  },
  'in-tune': {
    key: 'in-tune',
    label: '適正',
    english: 'IN TUNE',
    message: '音程が合っています。',
    symbol: '◆',
  },
  high: {
    key: 'high',
    label: '高い',
    english: 'HIGH',
    message: '音程が高いです。少し低く調整してください。',
    symbol: '▶',
  },
}

interface TunerFeedbackOptions {
  microphoneActive: boolean
  inputStatus: InputStatus
  pitchStatus: PitchStatus
  cents: number
  hasReading: boolean
}

export function getTunerFeedback({ microphoneActive, inputStatus, pitchStatus, cents, hasReading }: TunerFeedbackOptions): TunerFeedback {
  if (!microphoneActive) return FEEDBACK.stopped
  if (inputStatus === 'no-input') return FEEDBACK.waiting
  if (inputStatus === 'low') return FEEDBACK['input-low']
  if (inputStatus === 'high') return FEEDBACK['input-high']
  if (inputStatus === 'clipping') return FEEDBACK.clipping
  if (!hasReading || pitchStatus === 'listening' || pitchStatus === 'idle') return FEEDBACK.detecting
  if (pitchStatus === 'near') return FEEDBACK.stabilizing
  if (pitchStatus === 'in-tune') return FEEDBACK['in-tune']
  if (pitchStatus === 'low') return FEEDBACK.low
  if (pitchStatus === 'high') return FEEDBACK.high
  return cents < 0 ? FEEDBACK.low : FEEDBACK.high
}
