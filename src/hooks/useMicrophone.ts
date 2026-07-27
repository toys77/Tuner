import { useCallback, useEffect, useRef, useState } from 'react'
import { MicrophoneError, openMicrophone, type MicrophoneSession } from '../audio/microphone'

export type MicrophoneStatus = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported' | 'error'

export function useMicrophone() {
  const [status, setStatus] = useState<MicrophoneStatus>('idle')
  const [error, setError] = useState('')
  const [session, setSession] = useState<MicrophoneSession | null>(null)
  const sessionRef = useRef<MicrophoneSession | null>(null)

  const stop = useCallback(async () => {
    const current = sessionRef.current
    sessionRef.current = null
    setSession(null)
    setStatus('idle')
    if (current) await current.close()
  }, [])

  const start = useCallback(async () => {
    if (sessionRef.current || status === 'requesting') return
    setStatus('requesting')
    setError('')
    try {
      const next = await openMicrophone()
      sessionRef.current = next
      setSession(next)
      setStatus('listening')
    } catch (caught) {
      if (caught instanceof MicrophoneError) {
        setStatus(caught.code === 'denied' ? 'denied' : caught.code === 'unsupported' ? 'unsupported' : 'error')
        setError(caught.message)
      } else {
        setStatus('error')
        setError('マイクを開始できませんでした。')
      }
    }
  }, [status])

  useEffect(() => () => {
    const current = sessionRef.current
    sessionRef.current = null
    if (current) void current.close()
  }, [])

  return { status, error, session, start, stop }
}
