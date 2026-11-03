import { useEffect, useRef, useState } from 'react'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/comun'

// Aviso global cuando el teléfono pierde la conexión. La app sigue abriendo
// (service worker), pero contactos, bitácora, perfil y ubicación en vivo
// necesitan internet; las líneas de ayuda se pueden llamar igual.
export default function AvisoSinConexion() {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine)
  const t = useTextos(TEXTOS)
  const avisoRef = useRef(null)

  // Los botones de las esquinas (EsquinasPantalla) están fuera del flujo:
  // bajan lo que mida este aviso para no quedar encima de él.
  useEffect(() => {
    const raiz = document.documentElement
    const aviso = avisoRef.current
    if (!aviso) {
      raiz.style.removeProperty('--alto-aviso')
      return undefined
    }
    const medir = () => raiz.style.setProperty('--alto-aviso', `${aviso.offsetHeight}px`)
    medir()
    window.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('resize', medir)
      raiz.style.removeProperty('--alto-aviso')
    }
  }, [enLinea])

  useEffect(() => {
    const conectado = () => setEnLinea(true)
    const desconectado = () => setEnLinea(false)
    window.addEventListener('online', conectado)
    window.addEventListener('offline', desconectado)
    return () => {
      window.removeEventListener('online', conectado)
      window.removeEventListener('offline', desconectado)
    }
  }, [])

  if (enLinea) return null

  // Franja dentro del flujo de la página (no flotante): empuja la pantalla
  // hacia abajo en vez de tapar "Volver" y el botón de cuenta.
  return (
    <div ref={avisoRef} role="status" className="bg-white pt-[env(safe-area-inset-top)]">
      <p className="mx-auto max-w-[620px] px-5 py-2 text-center text-[13px] font-medium leading-snug text-ink">
        {t.sinConexion}
      </p>
    </div>
  )
}
