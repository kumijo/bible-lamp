const CACHE="lamp-v2";
const CORE=["./","index.html","kjv.json","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  // The page itself: network first so updates arrive, cache when offline
  if(req.mode==="navigate"||url.pathname.endsWith(".html")||url.pathname.endsWith("/")){
    e.respondWith(fetch(req).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));}return res;})
      .catch(()=>caches.match(req).then(h=>h||caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok&&(url.origin===self.location.origin||url.hostname.includes("fonts."))){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));}
    return res;})));
});
