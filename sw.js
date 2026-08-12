const CACHE_NAME = 'meu-caixa-v3.1'; // ⬆️ Altere este número a cada nova versão enviada

const ASSETS = [
  '/',
  'index.html',
  'privacidade.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'css/style.css',
  'js/app.js',
  'js/storage.js',
  'js/ui.js',
  'js/premium.js',
  'paginas/premium.html'
];

// 1. INSTALAÇÃO — Baixa a versão nova ignorando o cache do navegador
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usa cache: 'reload' para obrigar a baixar direto do GitHub/Servidor, sem pegar o cache local
      const stack = ASSETS.map((url) => {
        return fetch(url, { cache: 'reload' }).then((response) => {
          if (!response.ok) throw new Error(`Falha ao baixar ${url}`);
          return cache.put(url, response);
        });
      });
      return Promise.all(stack);
    })
  );
});

// 2. ATIVAÇÃO — Deleta qualquer cache antigo e assume a aba atual
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Apagando cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. REQUISIÇÕES (Network First com Fallback para Cache)
self.addEventListener('fetch', (event) => {
  // Ignora requisições de extensões ou APIs externas
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a rede respondeu com sucesso, atualiza o cache local
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se estiver OFFLINE, busca no cache local
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          console.warn('⚠️ Não encontrado no cache offline:', event.request.url);
        });
      })
  );
});
