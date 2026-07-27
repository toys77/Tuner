import { useEffect, useState } from 'react'

export function useWakeLock(enabled: boolean) {
  const [active, setActive] = useState(false)
  const [supported] = useState(() => Boolean(navigator.wakeLock))

  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false
    const request = async () => {
      if (!enabled || !navigator.wakeLock || document.visibilityState !== 'visible') return
      try {
        sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) await sentinel.release()
        else setActive(true)
        sentinel.addEventListener('release', () => setActive(false))
      } catch {
        setActive(false)
      }
    }
    const onVisibility = () => { if (document.visibilityState === 'visible') void request() }
    void request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      if (sentinel && !sentinel.released) void sentinel.release()
    }
  }, [enabled])

  return { active, supported }
}
