/* Service worker do Mentorixs Hub — camada de instalação/experiência mobile.
   Segurança: nunca guarda dados do sistema. Só arquivos estáticos do próprio Hub
   (código, estilos, ícones). Requisições ao Supabase (outro domínio), páginas e
   dados de clientes passam direto pela rede, sem cache. */
const VERSAO = 'hub-pwa-v5';
const ESTATICOS = `${VERSAO}-estaticos`;
const PRE = ['/offline.html', '/manifest.webmanifest', '/pwa/v3-icon-192.png', '/pwa/v3-icon-512.png', '/pwa/v3-apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(ESTATICOS).then((c) => c.addAll(PRE)));
  /* Não ativa sozinho: espera o usuário tocar em "Atualizar", para não interromper o que ele está fazendo. */
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => !k.startsWith(VERSAO)).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'ATUALIZAR') self.skipWaiting();
});

const ehEstatico = (url) =>
  /^\/(index|browser)-[\w-]+\.(js|css)$/.test(url.pathname) || url.pathname.startsWith('/pwa/') || url.pathname === '/logo-mentorixs.png';

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, fontes etc.: rede direta

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }
  if (ehEstatico(url)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) { const copia = res.clone(); caches.open(ESTATICOS).then((c) => c.put(req, copia)); }
            return res;
          })
      )
    );
  }
});

/* Notificações push: preparado para receber (ver docs). Só exibe se houver um envio real do servidor. */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: 'Mentorixs Hub', body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Mentorixs Hub', { body: d.body || '', icon: '/pwa/v3-icon-192.png', badge: '/pwa/v2-icon-monochrome-512.png', data: { url: d.url || '/' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const alvo = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if ('focus' in c) { c.navigate(alvo); return c.focus(); }
    return self.clients.openWindow(alvo);
  }));
});
