import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CerrarIcon } from './Iconos'

const CLAVE_DESCARTADO = 'calma:instalar-descartado'

function yaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// iPhone/iPad (incluido el iPad que se presenta como Mac con pantalla táctil)
function esIOS() {
  const ua = window.navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
}

function leerDescartado() {
  try {
    return localStorage.getItem(CLAVE_DESCARTADO) === '1'
  } catch {
    return false
  }
}

function CompartirIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  )
}

// Invitación a instalar Calma en el teléfono. Android/Chrome muestran el
// diálogo nativo (beforeinstallprompt); en iPhone no existe ese diálogo, así
// que se explica el paso "Compartir → Agregar a pantalla de inicio".
export default function InstalarApp() {
  const [eventoInstalar, setEventoInstalar] = useState(null)
  const [visible, setVisible] = useState(() => !yaInstalada() && !leerDescartado() && esIOS())
  const ios = esIOS()

  useEffect(() => {
    if (yaInstalada() || leerDescartado()) return undefined
    const alPoderInstalar = (evento) => {
      evento.preventDefault()
      setEventoInstalar(evento)
      setVisible(true)
    }
    const alInstalar = () => setVisible(false)
    window.addEventListener('beforeinstallprompt', alPoderInstalar)
    window.addEventListener('appinstalled', alInstalar)
    return () => {
      window.removeEventListener('beforeinstallprompt', alPoderInstalar)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  const descartar = () => {
    setVisible(false)
    try {
      localStorage.setItem(CLAVE_DESCARTADO, '1')
    } catch {
      // sin almacenamiento: solo se oculta por ahora
    }
  }

  const instalar = async () => {
    if (!eventoInstalar) return
    eventoInstalar.prompt()
    await eventoInstalar.userChoice.catch(() => null)
    setEventoInstalar(null)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (ios || eventoInstalar) && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          aria-labelledby="instalar-titulo"
          className="relative mt-6 flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.08] p-4 pr-11"
        >
          <img src="/icons/icon-192.png" alt="" className="h-11 w-11 flex-shrink-0 rounded-[10px]" />
          <div className="min-w-0">
            <h2 id="instalar-titulo" className="text-[15px] font-semibold text-white">
              Lleva Calma en tu teléfono
            </h2>
            {ios ? (
              <p className="mt-1 text-[13px] leading-snug text-white/75">
                Toca <CompartirIcon className="inline h-4 w-4 -translate-y-px" />{' '}
                <span className="font-semibold text-white">Compartir</span> y luego{' '}
                <span className="font-semibold text-white">Agregar a pantalla de inicio</span>. Abre
                como una app y funciona sin conexión.
              </p>
            ) : (
              <>
                <p className="mt-1 text-[13px] leading-snug text-white/75">
                  Ábrela como una app desde tu pantalla de inicio, incluso sin conexión.
                </p>
                <button
                  type="button"
                  onClick={instalar}
                  className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-bold text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  Instalar
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={descartar}
            aria-label="No mostrar de nuevo"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-white/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            <CerrarIcon className="h-4 w-4" />
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
