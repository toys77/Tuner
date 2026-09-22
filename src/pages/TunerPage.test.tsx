import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MicrophonePrompt } from './TunerPage'

describe('microphone permission guidance', () => {
  it('explains local-only processing before requesting permission', () => {
    render(<MicrophonePrompt status="idle" error="" onStart={vi.fn()} />)
    expect(screen.getByText(/端末内だけで処理/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'マイクを使用する' })).toBeInTheDocument()
  })

  it('shows recovery steps when permission is denied', () => {
    render(<MicrophonePrompt status="denied" error="マイクの使用が許可されていません。" onStart={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('許可されていません')
    expect(screen.getByText('ブラウザのサイト設定を開く')).toBeInTheDocument()
    expect(screen.getByText(/マイク権限を「許可」/)).toBeInTheDocument()
    expect(screen.getByText('ページを再読み込みする')).toBeInTheDocument()
  })

  it('offers gesture-based audio activation without asking for permission again', () => {
    render(<MicrophonePrompt status="needs-activation" error="" onStart={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '音声解析を開始する' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '音声解析を開始' })).toBeInTheDocument()
    expect(screen.getByText(/マイク権限を取り直す操作ではありません/)).toBeInTheDocument()
    expect(screen.getByText('マイク権限はそのまま保持されます')).toBeInTheDocument()
  })
})
