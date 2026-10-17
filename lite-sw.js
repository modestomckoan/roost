/* 栖 ROOST · lite service worker
 * 设计原则：
 *  1) 只对 lite 自己的资源负责；index.html / survey.html / 旧版 js/css 一律放行网络，绝不读写缓存。
 *  2) 页面导航（lite.html）：网络优先（network-first），在线时永远拿到最新版，离线才回退缓存，
 *     避免老用户被 service worker 旧缓存卡在旧版 / 白屏。
 *  3) v3 分片、场景图、图标等静态资源：cache-first（内容稳定，命中即用），首次访问回源后缓存。
 *  4) 音频（audio/*.ogg、dayXX-Y.mp3、breath-intro.wav）：不预拉，首次播放后 cache-first + SWR 更新。
 */
'use strict';

const VERSION = 'lite-v4';
const SHELL_CACHE = VERSION + '-shell';
const AUDIO_CACHE = VERSION + '-audio';

// 生成全部 v3 分片路径（142 片）
const V3N = {'sea-poster':6,'rain':22,'forest':44,'fire':12,'music':7,'seavideo':51};
const v3shards = [];
for (const [key, n] of Object.entries(V3N)) {
  for (let i = 0; i < n; i++) {
    v3shards.push('./lite/v3/v3-' + key + '-p' + String(i).padStart(3, '0') + '.js');
  }
}

// 壳资源：逐项写入，单个 404 不影响整体安装
const SHELL_ASSETS = [
  './lite.html',
  './lite.webmanifest',
  './lite/icon.svg',
  './lite/v3/manifest.json',
  ...v3shards
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
    // 只保留当前版本的两个缓存，其余（含所有旧版 lite-v1/v2/v3）全部清掉
    const keep = new Set([SHELL_CACHE, AUDIO_CACHE]);
    await Promise.all(
      keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

function isLiteShellRequest(url) {
  const path = url.pathname;
  if (path.endsWith('/lite.html') || path.endsWith('/lite.webmanifest')) return true;
  if (path.indexOf('/lite/') !== -1) return true; // lite/v3/*、lite/scenes/* 与 lite/icon.svg
  return false;
}

function isNavigation(req, url) {
  return req.mode === 'navigate' || url.pathname.endsWith('/lite.html');
}

function isAudioRequest(url) {
  const p = url.pathname;
  return /\/audio\/.+\.ogg$/.test(p) || /day\d{2}-\d\.mp3$/.test(p) || /breath-intro\.wav$/.test(p);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 旧版资源：完全放行，不碰缓存 —— 绝不污染 index.html 等
  if (!isLiteShellRequest(url) && !isAudioRequest(url)) return;

  if (isLiteShellRequest(url)) {
    // 页面导航：网络优先，保证更新；网络失败（离线）才回退缓存
    if (isNavigation(req, url)) {
      event.respondWith((async () => {
        try {
          const resp = await fetch(req);
          if (resp && resp.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(req, resp.clone());
          }
          return resp;
        } catch (e) {
          const hit = await caches.match(req, { ignoreSearch: true });
          if (hit) return hit;
          throw e;
        }
      })());
      return;
    }
    // 其它静态资源（v3 分片 / 场景图 / 图标 / manifest）：cache-first
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
    // 音频：cache-first + stale-while-revalidate（首次播完后缓存，不预拉）
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

// 允许页面通过 postMessage 触发立即接管
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
