/* ─── Hif AI Service Worker ────────────────────────────────────────── */
const CACHE_NAME = 'hifai-v1';

// Assets to pre-cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/favi-bg.png',
];

/* Install — pre-cache shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* Fetch — network-first for API, cache-first for assets */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always go network for API calls
  if (
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('anthropic.com') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // Cache-first for same-origin static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only cache successful same-origin responses
        if (
          response.ok &&
          response.type === 'basic' &&
          !url.pathname.startsWith('/api/')
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});