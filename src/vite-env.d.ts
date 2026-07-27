/// <reference types="vite/client" />

interface WakeLockSentinel extends EventTarget {
  released: boolean
  release(): Promise<void>
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>
}

interface Navigator {
  wakeLock?: WakeLock
}
