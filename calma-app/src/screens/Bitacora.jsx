import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import VoiceNoteRecorder from '../components/VoiceNoteRecorder'
import TranscribeMicButton from '../components/TranscribeMicButton'
import { riseIn } from '../animations/transitions'
import { guardarEntrada } from '../utils/bitacoraStorage'
import { guardarAudio } from '../utils/audioStorage'

const TAGS = [
  { emoji: '😌', label: 'Tranquilidad' },
  { emoji: '😟', label: 'Ansiedad' },
  { emoji: '😤', label: 'Frustración' },
  { emoji: '😴', label: 'Cansancio' },
  { emoji: '😊', label: 'Alegría' },
  { emoji: '😔', label: 'Soledad' },
  { emoji: '😨', label: 'Miedo' },
  { emoji: '☀️', label: 'Esperanza' },
  { emoji: '😵', label: 'Confusión' },
  { emoji: '🍵', label: 'Calma' },
  { emoji: '😠', label: 'Irritabilidad' },
  { emoji: '💪', label: 'Motivación' },
  { emoji: '😩', label: 'Saturación' },
  { emoji: '🥺', label: 'Nostalgia' },
  { emoji: '😌', label: 'Alivio' },
  { emoji: '😶', label: 'Desconexión' },
  { emoji: '😟', label: 'Inseguridad' },
  { emoji: '🙏', label: 'Gratitud' },
  { emoji: '😖', label: 'Estrés' },
  { emoji: '🥹', label: 'Sensibilidad' },
]

const CAMPOS_INICIALES = {
  sintiendo: '',
  ocurrio: '',
  necesito: '',
  ayudoHoy: '',
}

const CAMPOS_CONFIG = [
  { key: 'sintiendo', label: '¿Qué estoy sintiendo?', placeholder: 'Describe tus emociones...' },
  { key: 'ocurrio', label: '¿Qué ocurrió?', placeholder: 'Cuéntame qué sucedió...' },
  { key: 'necesito', label: '¿Qué necesito ahora?', placeholder: '¿Qué te ayudaría en este momento?' },
  { key: 'ayudoHoy', label: '¿Qué me ayudó hoy?', placeholder: 'Algo positivo o que te reconfortó...' },
]

// Una pregunta a la vez: emociones, las 4 preguntas y la nota de voz.
const PASO_EMOCIONES = 0
const PASO_NOTA = CAMPOS_CONFIG.length + 1
const TOTAL_PASOS = CAMPOS_CONFIG.length + 2

// Las preguntas van en tarjetas blancas, como hojas de diario sobre la noche:
// así escribir sigue siendo cómodo y el micrófono/grabadora no cambian.
const fieldClass =
  'relative mb-4 rounded-lg bg-white px-5 py-[18px] shadow-[0_8px_22px_rgba(0,0,0,0.12)] focus-within:ring-4 focus-within:ring-white/30'

export default function Bitacora() {
  const [tagsActivos, setTagsActivos] = useState(new Set())
  const [emocionLibre, setEmocionLibre] = useState('')
  const [campos, setCampos] = useState(CAMPOS_INICIALES)
  const [notaVozBlob, setNotaVozBlob] = useState(null)
  const [notaVozDuracion, setNotaVozDuracion] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMensaje, setToastMensaje] = useState('')
  const [toastEsError, setToastEsError] = useState(false)
  // Cambiar esta key fuerza a React a desmontar/remontar VoiceNoteRecorder al
  // guardar, reutilizando su cleanup ya probado (stream, mediaRecorder, object
  // URL) en vez de intentar resetearlo de forma imperativa.
  const [formResetKey, setFormResetKey] = useState(0)
  const toastTimeout = useRef(null)
  // Todos los pasos quedan montados (solo se oculta el resto) para no perder
  // lo escrito ni la grabación de VoiceNoteRecorder al ir y volver.
  const [paso, setPaso] = useState(PASO_EMOCIONES)
  const titulosRef = useRef([])

  useEffect(() => {
    return () => {
      clearTimeout(toastTimeout.current)
    }
  }, [])

  const toggleTag = (label) => {
    setTagsActivos((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const handleCampoChange = (key, value) => {
    setCampos((prev) => ({ ...prev, [key]: value }))
  }

  const hayContenido =
    tagsActivos.size > 0 ||
    emocionLibre.trim() !== '' ||
    Object.values(campos).some((valor) => valor.trim() !== '') ||
    notaVozBlob !== null

  const pasoTieneContenido = (indice) => {
    if (indice === PASO_EMOCIONES) return tagsActivos.size > 0 || emocionLibre.trim() !== ''
    if (indice === PASO_NOTA) return notaVozBlob !== null
    return campos[CAMPOS_CONFIG[indice - 1].key].trim() !== ''
  }

  // Al cambiar de paso, el foco va al título nuevo (lectores de pantalla y
  // teclado empiezan donde empieza la pregunta).
  const irAPaso = (indice) => {
    setPaso(indice)
    setTimeout(() => titulosRef.current[indice]?.focus(), 0)
  }

  const handleGuardar = async () => {
    if (!hayContenido) return

    let entradaGuardada
    try {
      entradaGuardada = await guardarEntrada({
        tags: [...tagsActivos],
        emocionLibre,
        queEstoySintiendo: campos.sintiendo,
        queOcurrio: campos.ocurrio,
        queNecesito: campos.necesito,
        queMeAyudo: campos.ayudoHoy,
        tieneNotaDeVoz: notaVozBlob !== null,
        notaVozDuracion,
      })
    } catch {
      setToastEsError(true)
      setToastMensaje('No se pudo guardar. Intenta de nuevo.')
      setToastVisible(true)
      clearTimeout(toastTimeout.current)
      toastTimeout.current = setTimeout(() => setToastVisible(false), 2000)
      return
    }

    if (notaVozBlob !== null) {
      // El audio se sube aparte, a Supabase Storage, usando el id real que
      // la base de datos acaba de generar para la entrada de texto. Si esto
      // falla (ej. problema de red), el texto ya quedó guardado — no
      // interrumpimos el flujo de éxito por un fallo aislado del audio.
      try {
        await guardarAudio(entradaGuardada.id, notaVozBlob)
      } catch (error) {
        console.error('No se pudo guardar el audio de la nota de voz:', error)
      }
    }

    setToastEsError(false)
    setToastMensaje('Entrada guardada')
    setToastVisible(true)
    clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToastVisible(false), 2000)

    setTagsActivos(new Set())
    setEmocionLibre('')
    setCampos(CAMPOS_INICIALES)
    setNotaVozBlob(null)
    setNotaVozDuracion(null)
    setFormResetKey((prev) => prev + 1)
    setPaso(PASO_EMOCIONES)
  }

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/islas" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-8">
          <h1 className="text-[30px] font-semibold leading-tight text-white">Tu bitácora emocional</h1>
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <p className="text-[15px] text-white/75">Un espacio para reflexionar y registrar</p>
            <Link
              to="/bitacora/historial"
              className="inline-flex items-center gap-1 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
            >
              Ver historial
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Progreso: un segmento por paso */}
        <motion.div {...riseIn(0.06)} className="mb-5">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: TOTAL_PASOS }, (_, indice) => (
              <span
                key={indice}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  indice <= paso ? 'bg-faro-2' : 'bg-white/15'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-[13px] text-white/60">
            Paso {paso + 1} de {TOTAL_PASOS}
            {paso === PASO_EMOCIONES && ' · No tienes que responder todo'}
          </p>
        </motion.div>

        {/* Paso 1: emociones */}
        <section hidden={paso !== PASO_EMOCIONES} aria-labelledby="bitacora-paso-0">
          <h2
            id="bitacora-paso-0"
            ref={(el) => (titulosRef.current[PASO_EMOCIONES] = el)}
            tabIndex={-1}
            className="mb-1 text-[22px] font-semibold leading-tight text-white focus:outline-none"
          >
            ¿Cómo te sientes?
          </h2>
          <p className="mb-4 text-[14px] text-white/65">Puedes elegir varias, o describirlo con tus palabras.</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const activo = tagsActivos.has(tag.label)
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  aria-pressed={activo}
                  className={
                    activo
                      ? 'inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-transparent bg-gradient-to-br from-auxilio-1 to-auxilio-2 px-[15px] py-[9px] text-[13.5px] font-semibold text-white shadow-[0_8px_18px_rgba(255,122,89,0.3)]'
                      : 'inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-white/15 bg-white/[0.06] px-[15px] py-[9px] text-[13.5px] font-semibold text-white/85'
                  }
                >
                  <span aria-hidden="true">{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              )
            })}
          </div>

          <div className={fieldClass}>
            <label htmlFor="bitacora-emocion" className="mb-2 block text-[15.5px] font-semibold text-ink">
              O describe tu emoción:
            </label>
            <input
              id="bitacora-emocion"
              type="text"
              value={emocionLibre}
              onChange={(e) => setEmocionLibre(e.target.value)}
              placeholder="Ej: esperanzado, perdido, inspirado..."
              className="w-full border-none bg-transparent pr-9 text-[14.5px] text-ink placeholder:text-ink-soft/50 focus:outline-none"
            />
            <div className="absolute right-4 top-3.5">
              <TranscribeMicButton value={emocionLibre} onTranscript={setEmocionLibre} />
            </div>
          </div>
        </section>

        {/* Pasos 2 a 5: una pregunta cada uno, con más espacio para escribir */}
        {CAMPOS_CONFIG.map((campo, indice) => {
          const numero = indice + 1
          return (
            <section key={campo.key} hidden={paso !== numero} aria-labelledby={`bitacora-paso-${numero}`}>
              <h2
                id={`bitacora-paso-${numero}`}
                ref={(el) => (titulosRef.current[numero] = el)}
                tabIndex={-1}
                className="mb-4 text-[22px] font-semibold leading-tight text-white focus:outline-none"
              >
                {campo.label}
              </h2>
              <div className={fieldClass}>
                <label htmlFor={`bitacora-${campo.key}`} className="sr-only">
                  {campo.label}
                </label>
                <textarea
                  id={`bitacora-${campo.key}`}
                  value={campos[campo.key]}
                  onChange={(e) => handleCampoChange(campo.key, e.target.value)}
                  placeholder={campo.placeholder}
                  className="h-40 w-full resize-none border-none bg-transparent pr-9 text-[15px] leading-relaxed text-ink placeholder:text-ink-soft/50 focus:outline-none"
                />
                <div className="absolute right-4 top-3.5">
                  <TranscribeMicButton
                    value={campos[campo.key]}
                    onTranscript={(nuevoValor) => handleCampoChange(campo.key, nuevoValor)}
                  />
                </div>
              </div>
            </section>
          )
        })}

        {/* Último paso: nota de voz (opcional) */}
        <section hidden={paso !== PASO_NOTA} aria-labelledby={`bitacora-paso-${PASO_NOTA}`}>
          <h2
            id={`bitacora-paso-${PASO_NOTA}`}
            ref={(el) => (titulosRef.current[PASO_NOTA] = el)}
            tabIndex={-1}
            className="mb-1 text-[22px] font-semibold leading-tight text-white focus:outline-none"
          >
            ¿Algo más que quieras decirte?
          </h2>
          <p className="mb-4 text-[14px] text-white/65">
            Una nota de voz para escucharte más adelante. Es opcional.
          </p>
          <VoiceNoteRecorder
            key={formResetKey}
            onRecordingChange={(blob, duracion) => {
              setNotaVozBlob(blob)
              setNotaVozDuracion(duracion)
            }}
          />
        </section>

        {/* Navegación entre pasos */}
        <div className="mt-6 flex items-center gap-3">
          {paso > PASO_EMOCIONES && (
            <button
              type="button"
              onClick={() => irAPaso(paso - 1)}
              className="rounded-full px-5 py-3.5 text-[15px] font-semibold text-white/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              Atrás
            </button>
          )}
          {paso < PASO_NOTA ? (
            <button
              type="button"
              onClick={() => irAPaso(paso + 1)}
              className={`ml-auto rounded-full px-8 py-3.5 text-[15px] font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${
                pasoTieneContenido(paso)
                  ? 'bg-white text-brand-navyDeep'
                  : 'border border-white/30 text-white'
              }`}
            >
              {pasoTieneContenido(paso) ? 'Siguiente' : 'Saltar'}
            </button>
          ) : (
            <button
              type="button"
              disabled={!hayContenido}
              onClick={handleGuardar}
              className="ml-auto flex-1 rounded-full bg-gradient-to-br from-faro-1 to-faro-2 py-[15px] text-center text-[15.5px] font-bold text-brand-navyDeep shadow-[0_14px_28px_rgba(242,169,59,0.25)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              Guardar entrada
            </button>
          )}
        </div>

        {/* Para dejarla a medias: guardar desde cualquier paso */}
        {paso < PASO_NOTA && hayContenido && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleGuardar}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
            >
              Guardar ahora
            </button>
          </div>
        )}
      </div>

      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center px-5"
        >
          <div
            className={`rounded-full px-5 py-3 text-sm font-medium shadow-lg ${
              // sobre la noche un toast oscuro se pierde: el de éxito va en blanco
              toastEsError ? 'bg-red-500 text-white' : 'bg-white text-ink'
            }`}
          >
            {toastMensaje}
          </div>
        </motion.div>
      )}
    </div>
  )
}
