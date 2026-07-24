const CACHE_VERSION = 'lavu-studio-v12';
const CACHE_NAME = `lavu-studio-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'favicon.svg',
    'logo.png',
    'herma_templates.json',
    'sortiment.json',
    'locations.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching static assets');
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn(`[SW] Cache skipped ${url}:`, err)))
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            const networkFetch = fetch(event.request).then(response => {
                if (response && response.ok) {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
                }
                return response;
            }).catch(() => null);

            return cached || networkFetch || new Response('Offline resource unavailable', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain' }
            });
        })
    );
});