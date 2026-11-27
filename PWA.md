# Mentorixs Hub como aplicativo (PWA)

Só o Hub (hub.mentorixs.com.br). Camada de instalação sobre o mesmo site, banco e login.

Arquivos novos: `manifest.webmanifest`, `sw.js`, `offline.html`, `pwa/*` (ícones).
Arquivos alterados: `index.html`, `404.html` (manifest, splash, registro do service worker, aviso de atualização) e o bundle `index-Mx*.js` (botão "Baixar aplicativo" no rodapé da sidebar).

- Cache: só arquivos estáticos do próprio Hub. Supabase, dados e páginas nunca são guardados.
- Atualização: ao publicar, o usuário vê "Nova versão disponível · Atualizar". Nada recarrega sozinho.
- Para forçar nova versão do cache, troque `VERSAO` em `sw.js`.
- Push: o `sw.js` já trata os eventos `push`/`notificationclick`. Falta o envio real (chaves VAPID, tabela de inscrições e função de envio no Supabase) — não implementado.
