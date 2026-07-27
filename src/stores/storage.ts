export interface StorageAdapter {
  get<T>(key: string, fallback: T): T
  set<T>(key: string, value: T): void
  remove(key: string): void
}

export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = globalThis.localStorage?.getItem(key)
      if (!raw) return fallback
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T
      if (fallback !== null && typeof fallback === 'object' && parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...fallback, ...parsed } as T
      }
      return parsed as T
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable in private browsing. Runtime settings still work.
    }
  },
  remove(key: string): void {
    try { globalThis.localStorage?.removeItem(key) } catch { /* no-op */ }
  },
}
