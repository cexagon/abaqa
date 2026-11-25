/* Abaqa: service worker beranda.
   - Shell beranda: disimpan saat install, dilayani dari cache lalu diperbarui di belakang.
   - tk/, latihan-kelas-1/2 dan lab-bu-canni: jaringan dulu, cache sebagai cadangan offline.
   - kebun-hitung/: tidak disentuh (punya sw sendiri). */
const CACHE = 'abaqa-home-v3';
const SHELL = ['./', './index.html', './home/home.css', './home/home.js', './home/kancil.svg', './home/pipo.svg', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  './latihan-kelas-1/aset/open-book.svg', './latihan-kelas-1/aset/books.svg'];
const NETWORK_FIRST = ['tk/', 'latihan-kelas-1/', 'latihan-kelas-2/', 'lab-bu-canni/'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('abaqa-home-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const base = new URL('./', self.registration.scope).pathname;
  const rel = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : null;
  if (rel === null || rel.startsWith('kebun-hitung/')) return;

  if (NETWORK_FIRST.some(p => rel.startsWith(p))) {
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : Response.error()))));
    return;
  }
  /* shell beranda */
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
