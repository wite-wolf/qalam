const CACHE = 'qalam-v1';
const ASSETS = [
  '/',
  '/app.html',
  '/css/app.css',
  '/js/router.js',
  '/js/whiteboard.js',
  '/js/app.js',
  '/js/pages/home.js',
  '/js/pages/gallery.js',
  '/js/pages/settings.js',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response(' offline', { status: 503 })))
  );
});
