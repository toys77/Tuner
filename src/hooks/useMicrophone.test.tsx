import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requestMicrophoneStream: vi.fn(),
  connectMicrophoneStream: vi.fn(),
}))

vi.mock('../audio/microphone', async (importOriginal) => ({
  ...await importOriginal<typeof import('../audio/microphone')>(),
  requestMicrophoneStream: mocks.requestMicrophoneStream,
  connectMicrophoneStream: mocks.connectMicrophoneStream,
}))

vi.mock('../utils/platform', () => ({ isCurrentIosStandalone: () => true }))

import { useMicrophone } from './useMicrophone'

describe('useMicrophone on an iOS Home Screen app', () => {
  beforeEach(() => {
    mocks.requestMicrophoneStream.mockReset()
    mocks.connectMicrophoneStream.mockReset()
  })

  it('keeps the granted stream and activates Web Audio on the next tap', async () => {
    const stop = vi.fn()
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
    const session = {
      stream,
      context: { state: 'running' },
      analyser: {},
      closeAudio: vi.fn(async () => undefined),
      close: vi.fn(async () => undefined),
    }
    mocks.requestMicrophoneStream.mockResolvedValue(stream)
    mocks.connectMicrophoneStream.mockResolvedValue(session)

    const { result, unmount } = renderHook(() => useMicrophone())

    await act(async () => result.current.start())
    expect(result.current.status).toBe('needs-activation')
    expect(mocks.requestMicrophoneStream).toHaveBeenCalledOnce()
    expect(mocks.connectMicrophoneStream).not.toHaveBeenCalled()

    await act(async () => result.current.start())
    await waitFor(() => expect(result.current.status).toBe('listening'))
    expect(mocks.requestMicrophoneStream).toHaveBeenCalledOnce()
    expect(mocks.connectMicrophoneStream).toHaveBeenCalledWith(stream)

    unmount()
    expect(session.close).toHaveBeenCalledOnce()
  })
})
