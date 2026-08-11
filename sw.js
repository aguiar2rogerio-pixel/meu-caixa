const CACHE_NAME = 'meu-caixa-v1.2'; // Incremente esta versão sempre que mudar o código
const ASSETS = [
  './',
  './index.html',
  './privacidade.html',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Instalação e Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Força o Service Worker a se tornar ativo imediatamente
});

// Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume o controle das abas abertas imediatamente
});

// Estratégia de Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
