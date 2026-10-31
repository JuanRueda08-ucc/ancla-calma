import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Identificador de cada build: el service worker se registra con ?v=<id>,
// así cada despliegue instala uno nuevo y descarta la versión anterior.
const BUILD_ID = Date.now().toString(36)

// Escribe /precache.json con todos los archivos del build (JS, CSS,
// imágenes), para que public/sw.js los guarde y la app abra sin conexión.
// (No se usa vite-plugin-pwa: aún no soporta Vite 8 de forma confiable.)
function listaPrecache() {
  return {
    name: 'calma-lista-precache',
    apply: 'build',
    generateBundle(_, bundle) {
      const archivos = Object.keys(bundle)
        .filter((nombre) => !nombre.endsWith('.map') && nombre !== 'index.html')
        .map((nombre) => `/${nombre}`)
        .sort()
      this.emitFile({
        type: 'asset',
        fileName: 'precache.json',
        source: JSON.stringify({ version: BUILD_ID, archivos }),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), listaPrecache()],
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(BUILD_ID),
  },
})
