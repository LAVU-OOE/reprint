const CACHE_NAME = 'lavu-studio-v9';
const STATIC_ASSETS = [
    '/reprint/',
    '/reprint/index.html',
    '/reprint/styles.css',
    '/reprint/script.js',
    '/reprint/manifest.json',
    '/reprint/scripts/i18n.json',
    '/reprint/scripts/formats.json',
    '/reprint/scripts/sortiment.json',
    '/reprint/images/logo.png',
    '/reprint/images/favicon.svg',
    '/reprint/images/favicon-96x96.png',
    '/reprint/images/apple-touch-icon.png',
    '/reprint/images/web-app-manifest-192x192.png',
    '/reprint/images/web-app-manifest-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS)
                    .catch(err => {
                        console.warn('[SW] Some assets failed to cache, but installation continues', err);
                        return Promise.resolve();
                    });
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.hostname === 'sortiment-api.lavu-ooe.workers.dev' ||
        url.hostname === 'locations-api.lavu-ooe.workers.dev') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then(response => {
                        const clone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, clone));
                        return response;
                    })
                    .catch(() => {
                        if (event.request.headers.get('Accept').includes('text/html')) {
                            return caches.match('/reprint/index.html');
                        }
                    });
            })
    );
});