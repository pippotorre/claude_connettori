/* Service worker: app shell in cache, data.json "stale-while-revalidate". */
const VERSION = "v1-2026-11-08";
const SHELL = `shell-${VERSION}`;
const DATA_CACHE = "data";
const FILES = [
  "./", "index.html", "style.css", "app.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("shell-") && k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => { if(e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET" || url.origin !== location.origin) return;

  // data.json: risposta immediata dalla cache, aggiornamento in rete in parallelo
  if(url.pathname.endsWith("/data.json")){
    e.respondWith((async () => {
      const cache = await caches.open(DATA_CACHE);
      const cached = await cache.match("data.json");
      const network = fetch(e.request, {cache:"no-cache"}).then(async res => {
        if(res.ok){
          const fresh = await res.clone().text();
          const old = cached ? await cached.clone().text() : null;
          await cache.put("data.json", res.clone());
          if(old && old !== fresh){
            const clients = await self.clients.matchAll();
            clients.forEach(c => c.postMessage("data-updated"));
          }
        }
        return res;
      }).catch(() => null);
      if(cached){ e.waitUntil(network); return cached; }
      return (await network) || new Response("{}", {headers:{"Content-Type":"application/json"}});
    })());
    return;
  }

  // shell: cache prima, poi rete
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(r => r || fetch(e.request).catch(() => caches.match("index.html")))
  );
});
