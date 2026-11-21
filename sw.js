// Service worker: serve solo per far funzionare l'app offline.
// Mette in cache SOLO i 4 file dell'app. Non tocca né invia i dati dell'utente.
const C = 'scadenze-shell-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // prima la rete (così gli aggiornamenti arrivano), poi la copia offline
  e.respondWith(
    fetch(r).then(res => {
      const copy = res.clone();
      caches.open(C).then(c => c.put(r, copy));
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
