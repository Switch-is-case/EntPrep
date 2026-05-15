const CACHE_NAME = 'ent-prep-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  OFFLINE_URL,
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/manifest.webmanifest'
];

// 1. Install - Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

// 2. Activate - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clientsClaim(), // Become available to all clients immediately
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('PWA: Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// 3. Fetch - Strategy implementation
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // EXCLUDE ADMIN AND API ADMIN
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
    return; // Let the browser handle these directly
  }

  // Ignore API requests (NetworkOnly)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch((err) => {
        console.error('PWA: API Fetch failed:', err);
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Navigation requests: NetworkFirst with Offline Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Other assets: CacheFirst or StaleWhileRevalidate
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return fetchResponse;
      }).catch((err) => {
        console.error('PWA: Static asset fetch failed:', err);
        // We could return a placeholder image or similar here if needed
      });
    })
  );
});
