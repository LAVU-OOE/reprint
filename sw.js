const CACHE_NAME = 'reprint-studio-v9';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/scripts/script.js',
  '/scripts/i18n.json',
  '/scripts/formats.json',
  '/scripts/sortiment.json',
  '/images/web-app-manifest-192x192.png',
  '/images/web-app-manifest-512x512.png',
  '/images/apple-touch-icon.png',
  '/images/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached file if it exists, otherwise fetch from network
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache valid responses
            if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      }).catch(() => {
        // If offline and file isn't cached, you can provide an offline fallback here if desired.
      })
  );
});