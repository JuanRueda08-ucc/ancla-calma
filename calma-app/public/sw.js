// Service worker de Calma: permite abrir la app sin conexión.
//
// - Al instalarse guarda la versión publicada completa (la lista la genera
//   el build en /precache.json): pantallas, imágenes e íconos. Así sin
//   internet abren las líneas de ayuda, la respiración y Puerto Seguro.
// - Navegación: primero la red (siempre lo más nuevo); sin conexión, la
//   copia guardada de la app.
// - Nunca guarda datos personales ni en vivo: Supabase, mapas y WhatsApp
//   siempre van directo a la red.
//
// Cada build registra este archivo con ?v=<id del build>, así cada
// despliegue instala un service worker nuevo y borra la versión anterior.

const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const CACHE_APP = `calma-app-${VERSION}`
const CACHE_FUENTES = 'calma-fuentes'
const ORIGENES_FUENTES = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://fonts.cdnfonts.com']
const SIEMPRE = [
  '/',
  '/manifest.webmanifest',
  '/icons/calma-icon.svg',
  '/icons/favicon-32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_APP)
      let archivos = []
      try {
        const respuesta = await fetch('/precache.json', { cache: 'no-store' })
        if (respuesta.ok) archivos = (await respuesta.json()).archivos
      } catch {
        // sin lista (ej. desarrollo): se guarda solo lo básico
      }
      await cache.addAll([...SIEMPRE, ...archivos])
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const nombres = await caches.keys()
      await Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith('calma-app-') && nombre !== CACHE_APP)
          .map((nombre) => caches.delete(nombre)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Pantallas de la app (rutas de React Router): red primero, copia sin conexión.
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match('/', { cacheName: CACHE_APP })) || Response.error()),
    )
    return
  }

  // Archivos propios (JS, CSS, imágenes con hash, íconos): caché primero.
  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))) {
    event.respondWith(
      (async () => {
        const guardada = await caches.match(request, { cacheName: CACHE_APP })
        if (guardada) return guardada
        const respuesta = await fetch(request)
        if (respuesta.ok) (await caches.open(CACHE_APP)).put(request, respuesta.clone())
        return respuesta
      })(),
    )
    return
  }

  // Tipografías: se usa la copia guardada y se actualiza por detrás.
  if (ORIGENES_FUENTES.includes(url.origin)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_FUENTES)
        const guardada = await cache.match(request)
        const red = fetch(request)
          .then((respuesta) => {
            if (respuesta.ok || respuesta.type === 'opaque') cache.put(request, respuesta.clone())
            return respuesta
          })
          .catch(() => guardada)
        return guardada || red
      })(),
    )
  }

  // Todo lo demás (Supabase, mapas, WhatsApp): sin interceptar.
})
