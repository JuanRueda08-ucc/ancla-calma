import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import AccountMenu from '../components/AccountMenu'
import { riseIn } from '../animations/transitions'
import { getEntradas, guardarEntrada, eliminarEntrada } from '../utils/bitacoraStorage'
import { obtenerAudio, guardarAudio } from '../utils/audioStorage'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'
const LOCAL_STORAGE_KEY = 'calma:bitacora'
const LEGACY_AUDIO_DB_NAME = 'calma-audio'
const LEGACY_AUDIO_STORE_NAME = 'notas'
const cardClass = 'rounded-lg bg-white p-5 text-center shadow-[0_8px_22px_rgba(0,0,0,0.04)]'

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

function leerEntradasLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Lee el audio de una entrada vieja directamente de la IndexedDB que usaba
// la versión anterior de audioStorage.js, solo para el flujo de migración.
function leerAudioLegacy(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open(LEGACY_AUDIO_DB_NAME)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(LEGACY_AUDIO_STORE_NAME)) {
        request.result.createObjectStore(LEGACY_AUDIO_STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onerror = () => resolve(null)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(LEGACY_AUDIO_STORE_NAME)) {
        db.close()
        resolve(null)
        return
      }
      const tx = db.transaction(LEGACY_AUDIO_STORE_NAME, 'readonly')
      const getRequest = tx.objectStore(LEGACY_AUDIO_STORE_NAME).get(id)
      getRequest.onsuccess = () => resolve(getRequest.result ? getRequest.result.blob : null)
      getRequest.onerror = () => resolve(null)
      tx.oncomplete = () => db.close()
    }
  })
}

function eliminarBaseAudioLegacy() {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(LEGACY_AUDIO_DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  })
}

function EntradaCard({ entrada, delay, onEliminar }) {
  const [abierto, setAbierto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  // 'idle' | 'loading' | 'ready' | 'unavailable'
  const [audioState, setAudioState] = useState('idle')
  const [isPlaying, setIsPlaying] = useState(false)

  const objectUrlRef = useRef(null)
  const audioElRef = useRef(null)

  const fragmento = obtenerFragmento(entrada)
  const preguntasConContenido = PREGUNTAS.filter(
    (p) => entrada[p.key] && entrada[p.key].trim() !== ''
  )

  // Carga perezosa del audio real (IndexedDB) solo mientras la tarjeta está
  // expandida. Al colapsar o desmontar, revocamos el object URL para no
  // dejar memoria huérfana mientras el usuario navega el historial.
  useEffect(() => {
    if (!abierto || !entrada.tieneNotaDeVoz) return undefined

    let cancelado = false
    setAudioState('loading')

    obtenerAudio(entrada.id)
      .then((blob) => {
        if (cancelado) return
        if (blob) {
          objectUrlRef.current = URL.createObjectURL(blob)
          setAudioState('ready')
        } else {
          setAudioState('unavailable')
        }
      })
      .catch(() => {
        if (!cancelado) setAudioState('unavailable')
      })

    return () => {
      cancelado = true
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setIsPlaying(false)
      setAudioState('idle')
    }
  }, [abierto, entrada.id, entrada.tieneNotaDeVoz])

  const togglePlay = () => {
    const audio = audioElRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

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

              {entrada.tieneNotaDeVoz && (
                <div>
                  <p className="mb-1 text-[13px] font-semibold text-ink">Nota de voz</p>
                  {audioState === 'ready' ? (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlay()
                        }}
                        aria-label={isPlaying ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-base text-auxilio-1"
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </button>
                      <span className="text-[13.5px] text-ink-soft">
                        {formatDuracion(entrada.notaVozDuracion)}
                      </span>
                      <audio
                        ref={audioElRef}
                        src={objectUrlRef.current ?? undefined}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  ) : audioState === 'loading' ? (
                    <p className="text-[13px] text-ink-soft">Cargando audio…</p>
                  ) : (
                    <p className="text-[13px] italic text-ink-soft">Audio no disponible</p>
                  )}
                </div>
              )}

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
  const [cargaEstado, setCargaEstado] = useState('cargando') // 'cargando' | 'error' | 'listo'
  const [entradas, setEntradas] = useState([])

  const [migracionDisponible, setMigracionDisponible] = useState(false)
  const [entradasLocales, setEntradasLocales] = useState([])
  const [migrando, setMigrando] = useState(false)

  const cargarEntradas = async () => {
    setCargaEstado('cargando')
    try {
      const data = await getEntradas()
      setEntradas(data)
      setCargaEstado('listo')

      if (data.length === 0) {
        const locales = leerEntradasLocalStorage()
        if (locales.length > 0) {
          setEntradasLocales(locales)
          setMigracionDisponible(true)
        }
      }
    } catch {
      setCargaEstado('error')
    }
  }

  useEffect(() => {
    cargarEntradas()
  }, [])

  const handleEliminar = async (id) => {
    try {
      await eliminarEntrada(id)
      setEntradas((prev) => prev.filter((entrada) => entrada.id !== id))
    } catch (error) {
      console.error('No se pudo eliminar la entrada:', error)
    }
  }

  const migrarEntradasLocales = async () => {
    setMigrando(true)
    try {
      const ordenadas = [...entradasLocales].sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      )

      for (const entradaLocal of ordenadas) {
        const entradaGuardada = await guardarEntrada({
          tags: entradaLocal.tags ?? [],
          emocionLibre: entradaLocal.emocionLibre,
          queEstoySintiendo: entradaLocal.queEstoySintiendo,
          queOcurrio: entradaLocal.queOcurrio,
          queNecesito: entradaLocal.queNecesito,
          queMeAyudo: entradaLocal.queMeAyudo,
          tieneNotaDeVoz: entradaLocal.tieneNotaDeVoz,
          notaVozDuracion: entradaLocal.notaVozDuracion,
        })

        if (entradaLocal.tieneNotaDeVoz) {
          try {
            const blob = await leerAudioLegacy(entradaLocal.id)
            if (blob) await guardarAudio(entradaGuardada.id, blob)
          } catch (error) {
            console.error('No se pudo migrar el audio de una entrada:', error)
          }
        }
      }

      localStorage.removeItem(LOCAL_STORAGE_KEY)
      await eliminarBaseAudioLegacy()
      setMigracionDisponible(false)
      await cargarEntradas()
    } catch (error) {
      console.error('No se pudieron migrar todas las entradas:', error)
    } finally {
      setMigrando(false)
    }
  }

  const descartarMigracion = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    await eliminarBaseAudioLegacy()
    setMigracionDisponible(false)
  }

  return (
    <div className="relative min-h-screen bg-sand">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <div className="flex items-center justify-between">
          <BackButton to="/bitacora" />
          <AccountMenu />
        </div>

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

        {cargaEstado === 'cargando' && (
          <div className="flex justify-center py-10">
            <span
              aria-hidden="true"
              className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-ink/60"
            />
          </div>
        )}

        {cargaEstado === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 ${cardClass}`}
          >
            <p className="mb-3 text-sm text-ink-soft">
              No pudimos cargar tu historial. Intenta de nuevo.
            </p>
            <button
              type="button"
              onClick={cargarEntradas}
              className="rounded-full bg-gradient-to-br from-faro-1 to-[#FF9C4A] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(242,169,59,0.25)]"
            >
              Reintentar
            </button>
          </motion.div>
        )}

        {cargaEstado === 'listo' && migracionDisponible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 ${cardClass}`}
          >
            <p className="mb-3 text-sm text-ink-soft">
              Encontramos entradas guardadas en este dispositivo. ¿Quieres agregarlas a tu
              cuenta?
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                disabled={migrando}
                onClick={migrarEntradasLocales}
                className="rounded-full bg-gradient-to-br from-faro-1 to-[#FF9C4A] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(242,169,59,0.25)] disabled:opacity-70"
              >
                {migrando ? 'Migrando…' : 'Sí, migrarlas'}
              </button>
              <button
                type="button"
                disabled={migrando}
                onClick={descartarMigracion}
                className="rounded-full bg-black/10 px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-70"
              >
                No, descartar
              </button>
            </div>
          </motion.div>
        )}

        {cargaEstado === 'listo' && entradas.length === 0 && (
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
        )}

        {cargaEstado === 'listo' &&
          entradas.map((entrada, index) => (
            <EntradaCard
              key={entrada.id}
              entrada={entrada}
              delay={0.05 * index}
              onEliminar={handleEliminar}
            />
          ))}
      </div>
    </div>
  )
}
