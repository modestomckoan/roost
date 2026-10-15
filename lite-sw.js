/* 栖 ROOST · lite service worker */
'use strict';

const VERSION = 'lite-v1';
const SHELL_CACHE = VERSION + '-shell';
const AUDIO_CACHE = VERSION + '-audio';

const SHELL_ASSETS = [
  './lite.html',
  './lite.webmanifest',
  './lite/icon-192.png',
  './lite/icon-512.png',
  './lite/apple-touch-icon.png',
  './lite/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.indexOf('lite-v') !== 0)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

function isLiteShellRequest(url) {
  const path = url.pathname;
  if (path.endsWith('/lite.html') || path.endsWith('/lite.webmanifest')) return true;
  if (path.indexOf('/lite/') !== -1) return true;
  return false;
}

function isAudioRequest(url) {
  const p = url.pathname;
  return /\/audio\/.+\.ogg$/.test(p) || /day\d{2}-\d\.mp3$/.test(p) || /breath-intro\.wav$/.test(p);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (!isLiteShellRequest(url) && !isAudioRequest(url)) return;

  if (isLiteShellRequest(url)) {
    event.respondWith((async () => {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const resp = await fetch(req);
      if (resp && resp.ok) {
        const cache = await caches.open(SHELL_CACHE);
        cache.put(req, resp.clone());
      }
      return resp;
    })());
    return;
  }

  if (isAudioRequest(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE);
      const hit = await cache.match(req);
      const network = fetch(req)
        .then((resp) => {
          if (resp && resp.ok) cache.put(req, resp.clone());
          return resp;
        })
        .catch(() => hit);
      return hit || network;
    })());
  }
});
