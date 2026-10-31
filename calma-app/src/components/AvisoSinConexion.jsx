import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

  return (
    <AnimatePresence>
      {!enLinea && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          role="status"
          className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4"
        >
          <p className="max-w-[460px] rounded-full bg-white px-4 py-2 text-center text-[13px] font-medium leading-snug text-ink shadow-lg">
            Sin conexión: las líneas de ayuda y los ejercicios funcionan; lo demás vuelve al
            reconectarte.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
