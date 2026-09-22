import { useCallback, useEffect, useRef, useState } from 'react'
import { connectMicrophoneStream, MicrophoneError, requestMicrophoneStream, type MicrophoneSession } from '../audio/microphone'
import { isCurrentIosStandalone } from '../utils/platform'

export type MicrophoneStatus = 'idle' | 'requesting' | 'needs-activation' | 'listening' | 'denied' | 'unsupported' | 'error'

export interface MicrophoneController {
  status: MicrophoneStatus
  error: string
  session: MicrophoneSession | null
  start: () => Promise<void>
  stop: () => Promise<void>
}

export function useMicrophone(): MicrophoneController {
  const [status, setStatus] = useState<MicrophoneStatus>('idle')
  const [error, setError] = useState('')
  const [session, setSession] = useState<MicrophoneSession | null>(null)
  const sessionRef = useRef<MicrophoneSession | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startingRef = useRef(false)
  const mountedRef = useRef(true)
  const wasHiddenRef = useRef(false)

  const showFailure = useCallback((caught: unknown) => {
    if (!mountedRef.current) return
    if (caught instanceof MicrophoneError) {
      if (caught.code === 'activation') {
        setStatus('needs-activation')
      } else {
        setStatus(caught.code === 'denied' ? 'denied' : caught.code === 'unsupported' ? 'unsupported' : 'error')
      }
      setError(caught.message)
      return
    }
    setStatus('error')
    setError('マイクを開始できませんでした。')
  }, [])

  const stop = useCallback(async () => {
    const current = sessionRef.current
    const pendingStream = streamRef.current
    sessionRef.current = null
    streamRef.current = null
    setSession(null)
    setStatus('idle')
    setError('')
    if (current) {
      await current.close()
    } else {
      pendingStream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const start = useCallback(async () => {
    if (sessionRef.current || startingRef.current) return
    startingRef.current = true
    setStatus('requesting')
    setError('')
    try {
      let stream = streamRef.current
      if (!stream) {
        stream = await requestMicrophoneStream()
        streamRef.current = stream

        // iOSのホーム画面版は、権限取得とは別にユーザー操作内でAudioContextを
        // 作る必要がある。ストリームは保持し、次のタップでは権限を再要求しない。
        if (isCurrentIosStandalone()) {
          if (mountedRef.current) setStatus('needs-activation')
          return
        }
      }

      const next = await connectMicrophoneStream(stream)
      if (!mountedRef.current) {
        await next.close()
        return
      }
      sessionRef.current = next
      setSession(next)
      setStatus('listening')
    } catch (caught) {
      showFailure(caught)
    } finally {
      startingRef.current = false
    }
  }, [showFailure])

  useEffect(() => {
    if (!isCurrentIosStandalone()) return

    const requireFreshActivation = () => {
      if (!wasHiddenRef.current || document.visibilityState !== 'visible') return
      wasHiddenRef.current = false
      const current = sessionRef.current
      if (!current) return

      sessionRef.current = null
      streamRef.current = current.stream
      setSession(null)
      setStatus('needs-activation')
      setError('ホーム画面版の音声解析を再開するには、一度タップしてください。')
      void current.closeAudio()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHiddenRef.current = true
        return
      }
      requireFreshActivation()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', requireFreshActivation)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pageshow', requireFreshActivation)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      const current = sessionRef.current
      const pendingStream = streamRef.current
      sessionRef.current = null
      streamRef.current = null
      if (current) {
        void current.close()
      } else {
        pendingStream?.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return { status, error, session, start, stop }
}
