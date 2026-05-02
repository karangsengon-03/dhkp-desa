// DHKP Desa Karang Sengon — Service Worker
// Strategy: network-first halaman, cache-first assets statis
// Broadcast ke client saat ada versi baru

const CACHE_VERSION = 'dhkp-v__BUILD_HASH__';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const PAGES_CACHE   = `${CACHE_VERSION}-pages`;

const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install: pre-cache static assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: hapus cache lama + claim clients ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );

  // Broadcast ke semua tab: ada update tersedia
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
    });
  });
});

// ── Fetch ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Abaikan non-GET dan request luar origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API Firestore — selalu network, jangan di-cache
  if (url.hostname.includes('firestore') || url.hostname.includes('firebase')) return;

  // Static assets (_next/static, icons, manifest) → cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon-32x32.png' ||
    url.pathname === '/apple-touch-icon.png'
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Halaman → network-first, fallback ke cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          caches.open(PAGES_CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
