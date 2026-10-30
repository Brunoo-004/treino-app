// Service worker: guarda os arquivos do app no aparelho para funcionar offline.
// Estratégia: responde com a cópia salva (rápido, funciona sem internet) e,
// ao mesmo tempo, busca a versão nova na rede para a próxima abertura.

const CACHE = "treino-app-v2";
const ARQUIVOS = [
  "./",
  "index.html",
  "style.css",
  "dados.js",
  "app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

// Apaga caches de versões antigas.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const pedido = event.request;
  if (pedido.method !== "GET" || new URL(pedido.url).origin !== self.location.origin) return;

  const daRede = fetch(pedido).then(async (resposta) => {
    if (resposta.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(pedido, resposta.clone());
    }
    return resposta;
  });
  event.waitUntil(daRede.catch(() => {}));

  event.respondWith(
    caches.match(pedido, { ignoreSearch: true }).then((salvo) => salvo || daRede)
  );
});
