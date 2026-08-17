const CACHE_NAME = 'fk-gracanica-v3';
const PRECACHE = ['/offline.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

function isApi(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/backend/');
}

function isNav(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isStatic(url) {
  return /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (isApi(url)) return;

  if (isNav(event.request)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html').then((r) => r || caches.match('/index.html'))),
    );
    return;
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            const copy = res.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return res;
          }),
      ),
    );
  }
});
