const CACHE_NAME = 'freightflow-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/register',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  // Never cache API calls or auth requests
  if (request.url.includes('/api/') || request.url.includes('/auth')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // If network fails and no cache, serve offline page for navigation
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return cached ?? Response.error();
        });

      return cached ?? fetched;
    }),
  );
});
