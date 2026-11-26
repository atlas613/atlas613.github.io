// 26.11.2026: the atlas as an app on the phone or the computer (tools/site.sh puts this file at the root of the site).
// The network first, always, so that a new version is never stuck behind an old one; without a network, the last copy that was seen
// (the page, the fonts, the icons). The files of the classroom (PDF, Word) are big: they come from the network, as without this worker.
const C = 'atlas-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon.svg', 'icon-192.png'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url), same = u.origin === location.origin, font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !font) return;
  if (same && /\.(pdf|docx|txt)$/i.test(u.pathname)) return;
  e.respondWith(fetch(r).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./') : null)).then(m => m || Response.error())));
});
