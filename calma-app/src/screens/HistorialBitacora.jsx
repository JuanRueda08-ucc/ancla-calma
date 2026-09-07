import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'
import { getEntradas, eliminarEntrada } from '../utils/bitacoraStorage'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const TAG_EMOJIS = {
  Tranquilidad: '😌',
  Ansiedad: '😟',
  Frustración: '😤',
  Cansancio: '😴',
  Alegría: '😊',
  Soledad: '😔',
  Miedo: '😨',
  Esperanza: '☀️',
  Confusión: '😵',
  Calma: '🍵',
  Irritabilidad: '😠',
  Motivación: '💪',
  Saturación: '😩',
  Nostalgia: '🥺',
  Alivio: '😌',
  Desconexión: '😶',
  Inseguridad: '😟',
  Gratitud: '🙏',
  Estrés: '😖',
  Sensibilidad: '🥹',
}

const PREGUNTAS = [
  { key: 'queEstoySintiendo', label: '¿Qué estoy sintiendo?' },
  { key: 'queOcurrio', label: '¿Qué ocurrió?' },
  { key: 'queNecesito', label: '¿Qué necesito ahora?' },
  { key: 'queMeAyudo', label: '¿Qué me ayudó hoy?' },
]

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

function formatDuracion(totalSeconds) {
  const segundos = Math.round(totalSeconds || 0)
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}

function obtenerFragmento(entrada) {
  const candidato = PREGUNTAS.map((p) => entrada[p.key]).find((valor) => valor && valor.trim() !== '')
  if (!candidato) return null
  return candidato.length > 100 ? `${candidato.slice(0, 100)}…` : candidato
}

function EntradaCard({ entrada, delay, onEliminar }) {
  const [abierto, setAbierto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const fragmento = obtenerFragmento(entrada)
  const preguntasConContenido = PREGUNTAS.filter(
    (p) => entrada[p.key] && entrada[p.key].trim() !== ''
  )

  return (
    <motion.div
      {...riseIn(delay)}
      className="mb-4 overflow-hidden rounded-lg bg-white shadow-[0_8px_22px_rgba(0,0,0,0.04)]"
    >
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-expanded={abierto}
        className="w-full px-5 py-[18px] text-left"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <span className="text-[13px] font-semibold text-ink-soft">
            {formatoFecha.format(new Date(entrada.fecha))}
          </span>
          <motion.span
            animate={{ rotate: abierto ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 text-[#B7B0A4]"
          >
            ⌄
          </motion.span>
        </div>

        {entrada.tags?.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {entrada.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-black/[0.07] bg-white px-2.5 py-1 text-xs font-semibold text-ink-soft"
              >
                {TAG_EMOJIS[tag] && <span>{TAG_EMOJIS[tag]}</span>}
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {fragmento && <p className="text-[14.5px] leading-[1.5] text-ink">{fragmento}</p>}

        {entrada.tieneNotaDeVoz && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft">
            <span>🎙️</span>
            <span>Nota de voz • {formatDuracion(entrada.notaVozDuracion)}</span>
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="detalle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-5 pb-4">
              {entrada.emocionLibre && entrada.emocionLibre.trim() !== '' && (
                <div>
                  <p className="mb-1 text-[13px] font-semibold text-ink">O describe tu emoción</p>
                  <p className="text-[14px] leading-[1.5] text-ink-soft">{entrada.emocionLibre}</p>
                </div>
              )}

              {preguntasConContenido.map((p) => (
                <div key={p.key}>
                  <p className="mb-1 text-[13px] font-semibold text-ink">{p.label}</p>
                  <p className="text-[14px] leading-[1.5] text-ink-soft">{entrada[p.key]}</p>
                </div>
              ))}

              <div className="flex justify-end pt-1">
                {confirmando ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmando(false)
                      }}
                      className="rounded-full bg-ink/10 px-3.5 py-1.5 text-xs font-semibold text-ink"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEliminar(entrada.id)
                      }}
                      className="rounded-full bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmando(true)
                    }}
                    aria-label="Eliminar entrada"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-sm text-ink"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HistorialBitacora() {
  const [entradas, setEntradas] = useState([])

  useEffect(() => {
    const cargadas = [...getEntradas()].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
    setEntradas(cargadas)
  }, [])

  const handleEliminar = (id) => {
    eliminarEntrada(id)
    setEntradas((prev) => prev.filter((entrada) => entrada.id !== id))
  }

  return (
    <div className="relative min-h-screen bg-sand">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/bitacora" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center bg-auxilio-bg text-[26px]"
            style={{ borderRadius: BLOB_RADIUS }}
          >
            🕰️
          </div>
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Tu historial</h1>
          <p className="text-sm text-ink-soft">Todo lo que has registrado hasta ahora</p>
        </motion.div>

        {entradas.length === 0 ? (
          <motion.div {...riseIn(0.1)} className="mt-6 text-center">
            <p className="mx-auto max-w-[380px] text-[15px] leading-[1.6] text-ink-soft">
              Todavía no tienes entradas guardadas. Cuando registres algo en tu bitácora,
              aparecerá aquí.
            </p>
            <Link
              to="/bitacora"
              className="mt-5 inline-block rounded-full bg-gradient-to-br from-faro-1 to-[#FF9C4A] px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(242,169,59,0.25)]"
            >
              Ir a la bitácora
            </Link>
          </motion.div>
        ) : (
          entradas.map((entrada, index) => (
            <EntradaCard
              key={entrada.id}
              entrada={entrada}
              delay={0.05 * index}
              onEliminar={handleEliminar}
            />
          ))
        )}
      </div>
    </div>
  )
}
