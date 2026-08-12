const CACHE_NAME = 'meu-caixa-v3.0'; // ⬆️ Versão atualizada — força recarregamento completo
const ASSETS = [
  './',
  './index.html',
  './privacidade.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  
  // ✅ NOVOS — Estilos
  './css/style.css',
  
  // ✅ NOVOS — Scripts organizados
  './js/app.js',
  './js/storage.js',
  './js/ui.js',
  './js/premium.js',
  
  // ✅ NOVO — Tela Premium
  './paginas/premium.html'
];

// Instalação — cacheia todos os arquivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Ativa imediatamente
});

// Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Removendo cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume controle de todas as abas
});

// Estratégia: Network First → Atualiza online, usa cache se estiver offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a rede responder, atualiza o cache
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 🔌 Sem internet → responde do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          console.warn('⚠️ Recurso não encontrado no cache:', event.request.url);
        });
      })
  );
});
