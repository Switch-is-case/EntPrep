importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  // Force update the service worker
  self.skipWaiting();
  workbox.core.clientsClaim();

  // Precache the offline page
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('offline-cache').then((cache) => {
        return cache.add('/~offline');
      })
    );
  });

  const { registerRoute } = workbox.routing;
  const { StaleWhileRevalidate, CacheFirst, NetworkOnly, NetworkFirst } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;

  // Cache Google Fonts
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    })
  );

  // Cache Static Assets (Images)
  registerRoute(
    ({ request }) => request.destination === 'image',
    new StaleWhileRevalidate({
      cacheName: 'images',
    })
  );

  // Cache Static Assets (JS/CSS)
  registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  // Default API caching: NetworkOnly (Don't cache sensitive data)
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkOnly()
  );

  // Navigation requests: NetworkFirst (Fallback to offline page if needed)
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
      cacheName: 'pages',
      plugins: [
        {
          handlerDidError: async () => {
            return caches.match('/~offline');
          },
        },
      ],
    })
  );
}
