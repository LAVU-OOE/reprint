const CACHE_VERSION = 'lavu-studio-v9';
const CACHE_NAME = `lavu-studio-${CACHE_VERSION}`;
const STATIC_ASSETS = [
    '.',
    'index.html',
    'manifest.json',
    'site.webmanifest',
    'assets/icons/favicon.svg',
    'assets/icons/logo.png',
    'assets/icons/favicon-96x96.png',
    'assets/icons/apple-touch-icon.png',
    'assets/icons/web-app-manifest-192x192.png',
    'assets/icons/web-app-manifest-512x512.png'
];
const DYNAMIC_JSON_URLS = [
    'https://raw.githubusercontent.com/LAVU-OOE/Etiketten-Druckstudio/refs/heads/main/assets/js/locations.json',
    'https://raw.githubusercontent.com/LAVU-OOE/Etiketten-Druckstudio/refs/heads/main/assets/js/sortiment.json'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll([...STATIC_ASSETS, ...DYNAMIC_JSON_URLS]);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Installation failed:', err);
            })
    );
});
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('lavu-studio-') && name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET') return;
    if (DYNAMIC_JSON_URLS.some(jsonUrl => url.href === jsonUrl)) {
        event.respondWith(
            fetch(request, { cache: 'no-store' })
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, clonedResponse);
                        })
                        .catch(err => console.warn('[SW] Cache put failed:', err));
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('[SW] Serving JSON from cache');
                                return cachedResponse;
                            }
                            return new Response(JSON.stringify({ error: 'Offline - Data not available' }), {
                                status: 503,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        });
                })
        );
        return;
    }
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, clonedResponse);
                        })
                        .catch(err => console.warn('[SW] Cache put failed:', err));
                    return response;
                })
                .catch(() => {
                    return caches.match('/index.html')
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('[SW] Serving offline fallback page');
                                return cachedResponse;
                            }
                            return new Response(
                                '<html><body><h1>Offline</h1><p>Bitte verbinden Sie sich mit dem Internet, um die App zu nutzen.</p></body></html>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        });
                })
        );
        return;
    }
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Background cache update
                    fetch(request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.ok) {
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(request, networkResponse);
                                    })
                                    .catch(err => console.warn('[SW] Background cache update failed:', err));
                            }
                        })
                        .catch(() => { });
                    return cachedResponse;
                }
                return fetch(request)
                    .then(response => {
                        if (response && response.ok) {
                            const clonedResponse = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, clonedResponse);
                                })
                                .catch(err => console.warn('[SW] Cache put failed:', err));
                        }
                        return response;
                    })
                    .catch(err => {
                        console.warn('[SW] Fetch failed:', err);
                        return new Response('Network error', { status: 503 });
                    });
            })
    );
});
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});