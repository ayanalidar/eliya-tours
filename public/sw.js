// ============================================================
// Eliya Tours service worker — PWA offline shell + offline guides
// ============================================================
const CACHE = 'eliya-tours-v2'
const ASSETS = ['/', '/manifest.json']

// API responses to cache for offline use (destination/season/hotel/adventure data)
const OFFLINE_API_PATTERNS = [
  /\/api\/destinations/,
  /\/api\/seasons/,
  /\/api\/hotels/,
  /\/api\/adventures/,
  /\/api\/offers/,
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Skip cross-origin (Unsplash, Open-Meteo, etc.)
  if (url.origin !== self.location.origin) return

  // Skip _next internals
  if (url.pathname.startsWith('/_next/')) return

  // Cache API GET responses for offline-first guides
  if (url.pathname.startsWith('/api/')) {
    const isCacheable = OFFLINE_API_PATTERNS.some((p) => p.test(url.pathname))
    if (isCacheable) {
      e.respondWith(
        fetch(req)
          .then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
            return res
          })
          .catch(() => caches.match(req))
      )
    }
    return
  }

  if (req.mode === 'navigate') {
    // Network-first for HTML
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    )
  } else {
    // Cache-first for assets
    e.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
      })
    )
  }
})
