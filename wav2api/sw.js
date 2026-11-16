const CACHE = 'wav2api-3ef553be2f30';
const SHELL = ['./connection-settings.js?build=3ef553be2f30', './', './index.html', './app.css?build=3ef553be2f30',
  './playback-policy.js?build=3ef553be2f30', './app.js?build=3ef553be2f30', './boot.js?build=3ef553be2f30',
  './pkg/wav2api_player.js?build=3ef553be2f30', './pkg/wav2api_player_bg.wasm?build=3ef553be2f30',
  './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('wav2api-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Audio and model lists always come from the live provider/gateway.
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;
  // Never let the dev-only key endpoint touch Cache Storage.
  if (!SHELL.some((path) => new URL(path, self.location.href).pathname === url.pathname)) return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))),
  );
});
