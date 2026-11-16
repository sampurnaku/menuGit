// Service worker menu utama. Hanya menangani file milik menu ini (aman dipasang di repo
// sampurnaku.github.io yang satu alamat dengan aplikasi lain). Halaman diambil dari internet dulu,
// lalu memakai simpanan bila offline atau lebih dari 4 detik tanpa jawaban.
const VERSI='menu-v1';
const FILE=['','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const BASE=new URL('./',self.location).pathname;
const MILIK=new Set(FILE.map(f=>BASE+f));
const BATAS_MS=4000;
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSI).then(c=>c.addAll(FILE.map(f=>new Request(BASE+f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('menu-')&&n!==VERSI).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
const ambil=r=>fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const c=res.clone();caches.open(VERSI).then(ca=>ca.put(r,c))}return res});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||!MILIK.has(u.pathname))return; // selain file menu: biarkan browser
  const lama=new Promise((_,tolak)=>setTimeout(tolak,BATAS_MS));
  e.respondWith(Promise.race([ambil(r),lama]).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||ambil(r))));
});
