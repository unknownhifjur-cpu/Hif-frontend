/* ─── Hif AI Service Worker ────────────────────────────────────────── */
const CACHE_NAME = 'hifai-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/favi-bg.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ── Never intercept these ──────────────────────────────────────────
  // 1. localhost in any form (Vite HMR, dev server, backend)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;

  // 2. Non-GET requests
  if (event.request.method !== 'GET') return;

  // 3. API calls to backend
  if (url.pathname.startsWith('/api/')) return;

  // 4. Anthropic API
  if (url.hostname.includes('anthropic.com')) return;

  // 5. Vite internal paths
  if (url.pathname.startsWith('/@') || url.pathname.includes('__vite')) return;

  // ── Cache-first for same-origin static assets ──────────────────────
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});