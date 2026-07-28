const BASE_PATH = '/Tuner/'
const CACHE_PREFIX = 'quiet-tuner-'
const CACHE_NAME = 'quiet-tuner-v3'
const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/icon.svg`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
  `${BASE_PATH}icons/icon-maskable-512.png`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    const staleCaches = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
    const needsLegacyRecovery = staleCaches.some((key) => key === 'quiet-tuner-v1' || key === 'quiet-tuner-v2')
    await Promise.all(staleCaches.map((key) => caches.delete(key)))
    await self.clients.claim()

    if (needsLegacyRecovery) {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      clients
        .filter((client) => new URL(client.url).pathname.startsWith(BASE_PATH))
        .forEach((client) => { void client.navigate(client.url) })
    }
  })())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request)
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(BASE_PATH, response.clone())
        }
        return response
      } catch {
        return (await caches.match(event.request)) || (await caches.match(BASE_PATH)) || Response.error()
      }
    })())
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME)
        await cache.put(event.request, response.clone())
      }
      return response
    })),
  )
})
