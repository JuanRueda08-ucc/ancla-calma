import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const PERSONA_CONFIANZA = {
  iniciales: 'MG',
  nombre: 'María González',
  etiqueta: 'Persona de confianza',
}

const LINEAS_APOYO = [
  { nombre: 'Bienestar Te Escucha', telefono: '01 8000 113 113' },
  { nombre: 'Línea de la Vida', telefono: '106' },
]

const cardClass =
  'rounded-lg bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.04)]'

export default function IslaAuxilio() {
  const [toast, setToast] = useState(null)
  const toastTimeout = useRef(null)

  const showToast = (message) => {
    console.log(message)
    setToast(message)
    window.clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-auxilio-1 to-auxilio-2">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/islas" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center bg-white/70 text-[26px]"
            style={{ borderRadius: BLOB_RADIUS }}
          >
            🤝
          </div>
          <h1 className="mb-1.5 text-[26px] font-semibold text-white">Isla del Auxilio</h1>
          <p className="text-sm text-white/[0.85]">Tu red de apoyo está aquí</p>
        </motion.div>

        <motion.div {...riseIn(0.08)} className={`mb-4 ${cardClass}`}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-base font-bold text-auxilio-1">
              {PERSONA_CONFIANZA.iniciales}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">{PERSONA_CONFIANZA.nombre}</p>
              <p className="text-xs text-ink-soft">{PERSONA_CONFIANZA.etiqueta}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-acomp-1" />
                <span className="text-xs font-medium text-acomp-1">Disponible</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast(`Llamando a ${PERSONA_CONFIANZA.nombre}… (simulado)`)}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-lg text-auxilio-1"
              aria-label={`Llamar a ${PERSONA_CONFIANZA.nombre}`}
            >
              📞
            </button>
          </div>
        </motion.div>

        <motion.button
          {...riseIn(0.16)}
          type="button"
          onClick={() => showToast('Ubicación compartida (simulado)')}
          className={`mb-8 flex w-full items-center gap-3 rounded-full bg-white py-3.5 pl-4 pr-5 text-left shadow-[0_8px_22px_rgba(0,0,0,0.04)]`}
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-senales-bg text-base text-senales-1">
            📍
          </span>
          <span className="text-sm font-semibold text-ink-soft">Compartir mi ubicación</span>
        </motion.button>

        <motion.p {...riseIn(0.22)} className="mb-3 text-sm font-semibold text-white/80">
          Líneas de apoyo profesional
        </motion.p>

        {LINEAS_APOYO.map((linea, index) => (
          <motion.div
            key={linea.nombre}
            {...riseIn(0.28 + index * 0.06)}
            className={`mb-3 flex items-center justify-between ${cardClass}`}
          >
            <div>
              <p className="font-semibold text-ink">{linea.nombre}</p>
              <p className="text-sm font-semibold text-auxilio-1">{linea.telefono}</p>
            </div>
            <button
              type="button"
              onClick={() => showToast(`Llamando a ${linea.nombre}… (simulado)`)}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-lg text-auxilio-1"
              aria-label={`Llamar a ${linea.nombre}`}
            >
              📞
            </button>
          </motion.div>
        ))}
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center px-5"
        >
          <div className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </motion.div>
      )}
    </div>
  )
}
