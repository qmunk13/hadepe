// Service Worker for Kalender Interaktif Nusantara (PWA)
const CACHE_NAME = 'kalender-nusantara-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        return caches.match('/');
      });
    })
  );
});
