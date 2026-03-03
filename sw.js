const CACHE_NAME = 'quiz-app-v1';

const urlsToCache = [
  'index.html',
  'style.css',
  'script.js',
  'data.js',
  'manifest.json',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
