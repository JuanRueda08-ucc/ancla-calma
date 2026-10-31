import { useEffect, useState } from 'react'

// Aviso global cuando el teléfono pierde la conexión. La app sigue abriendo
// (service worker), pero contactos, bitácora, perfil y ubicación en vivo
// necesitan internet; las líneas de ayuda se pueden llamar igual.
export default function AvisoSinConexion() {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine)

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
    <div role="status" className="bg-white pt-[env(safe-area-inset-top)]">
      <p className="mx-auto max-w-[620px] px-5 py-2 text-center text-[13px] font-medium leading-snug text-ink">
        Sin conexión: las líneas de ayuda y los ejercicios funcionan; lo demás vuelve al
        reconectarte.
      </p>
    </div>
  )
}
