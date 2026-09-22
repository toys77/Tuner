import { useCallback, useEffect, useRef, useState } from 'react'
import { MicrophoneError, openMicrophone, type MicrophoneSession } from '../audio/microphone'

export type MicrophoneStatus = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported' | 'error'

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
  const startingRef = useRef(false)
  const mountedRef = useRef(true)

  const stop = useCallback(async () => {
    const current = sessionRef.current
    sessionRef.current = null
    setSession(null)
    setStatus('idle')
    if (current) await current.close()
  }, [])

  const start = useCallback(async () => {
    if (sessionRef.current || startingRef.current) return
    startingRef.current = true
    setStatus('requesting')
    setError('')
    try {
      const next = await openMicrophone()
      if (!mountedRef.current) {
        await next.close()
        return
      }
      sessionRef.current = next
      setSession(next)
      setStatus('listening')
    } catch (caught) {
      if (!mountedRef.current) return
      if (caught instanceof MicrophoneError) {
        setStatus(caught.code === 'denied' ? 'denied' : caught.code === 'unsupported' ? 'unsupported' : 'error')
        setError(caught.message)
      } else {
        setStatus('error')
        setError('マイクを開始できませんでした。')
      }
    } finally {
      startingRef.current = false
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      const current = sessionRef.current
      sessionRef.current = null
      if (current) void current.close()
    }
  }, [])

  return { status, error, session, start, stop }
}
