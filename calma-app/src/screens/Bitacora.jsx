import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import VoiceNoteRecorder from '../components/VoiceNoteRecorder'
import TranscribeMicButton from '../components/TranscribeMicButton'
import { riseIn } from '../animations/transitions'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

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

const fieldClass = 'relative mb-4 rounded-lg bg-white px-5 py-[18px] shadow-[0_8px_22px_rgba(0,0,0,0.04)]'

export default function Bitacora() {
  const [tagsActivos, setTagsActivos] = useState(new Set())
  const [emocionLibre, setEmocionLibre] = useState('')
  const [campos, setCampos] = useState(CAMPOS_INICIALES)
  const [notaVozBlob, setNotaVozBlob] = useState(null)
  const [notaVozDuracion, setNotaVozDuracion] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  // Cambiar esta key fuerza a React a desmontar/remontar VoiceNoteRecorder al
  // guardar, reutilizando su cleanup ya probado (stream, mediaRecorder, object
  // URL) en vez de intentar resetearlo de forma imperativa.
  const [formResetKey, setFormResetKey] = useState(0)
  const toastTimeout = useRef(null)

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

  const handleGuardar = () => {
    if (!hayContenido) return

    // TODO: reemplazar por la llamada real al backend/almacenamiento persistente.
    // notaVozBlob es un Blob de audio en memoria — en la integración real se
    // subiría aquí (ej. como FormData al endpoint, o convertido a base64 si el
    // backend lo requiere así) antes de descartarlo. No hace falta revocar su
    // object URL manualmente en este punto: al cambiar formResetKey más abajo,
    // VoiceNoteRecorder se desmonta y su propio cleanup ya se encarga de eso.
    console.log('Entrada guardada (simulado):', {
      tags: [...tagsActivos],
      emocionLibre,
      ...campos,
      notaVoz: notaVozBlob ? { size: notaVozBlob.size, duracion: notaVozDuracion } : null,
    })

    setToastVisible(true)
    clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToastVisible(false), 2000)

    setTagsActivos(new Set())
    setEmocionLibre('')
    setCampos(CAMPOS_INICIALES)
    setNotaVozBlob(null)
    setNotaVozDuracion(null)
    setFormResetKey((prev) => prev + 1)
  }

  return (
    <div className="relative min-h-screen bg-sand">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/islas" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center bg-auxilio-bg text-[26px]"
            style={{ borderRadius: BLOB_RADIUS }}
          >
            📖
          </div>
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Tu bitácora emocional</h1>
          <p className="text-sm text-ink-soft">Un espacio para reflexionar y registrar</p>
        </motion.div>

        <motion.div {...riseIn(0.08)}>
          <p className="mb-3 text-[15px] font-semibold text-ink">
            ¿Cómo te sientes? (puedes elegir varias)
          </p>
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
                      ? 'inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-transparent bg-gradient-to-br from-auxilio-1 to-auxilio-2 px-[15px] py-[9px] text-[13.5px] font-semibold text-white shadow-[0_8px_18px_rgba(255,122,89,0.22)]'
                      : 'inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-black/[0.07] bg-white px-[15px] py-[9px] text-[13.5px] font-semibold text-ink-soft'
                  }
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              )
            })}
          </div>

          <div className={fieldClass}>
            <label className="mb-2 block text-[15.5px] font-semibold text-ink">
              O describe tu emoción:
            </label>
            <input
              type="text"
              value={emocionLibre}
              onChange={(e) => setEmocionLibre(e.target.value)}
              placeholder="Ej: esperanzado, perdido, inspirado..."
              className="w-full border-none bg-transparent pr-9 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />
            <div className="absolute right-4 top-3.5">
              <TranscribeMicButton value={emocionLibre} onTranscript={setEmocionLibre} />
            </div>
          </div>
        </motion.div>

        <motion.div
          {...riseIn(0.14)}
          className="mb-[22px] rounded-[18px] bg-senales-bg px-[18px] py-3.5 text-[13.5px] leading-[1.5] text-[#1F5C51]"
        >
          No tienes que escribirlo todo. Puedes registrar solo lo que necesites en este momento.
        </motion.div>

        {CAMPOS_CONFIG.map((campo, index) => (
          <motion.div key={campo.key} {...riseIn(0.18 + index * 0.04)} className={fieldClass}>
            <label className="mb-2 block text-[15.5px] font-semibold text-ink">
              {campo.label}
            </label>
            <textarea
              value={campos[campo.key]}
              onChange={(e) => handleCampoChange(campo.key, e.target.value)}
              placeholder={campo.placeholder}
              className="h-11 w-full resize-none border-none bg-transparent pr-9 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />
            <div className="absolute right-4 top-3.5">
              <TranscribeMicButton
                value={campos[campo.key]}
                onTranscript={(nuevoValor) => handleCampoChange(campo.key, nuevoValor)}
              />
            </div>
          </motion.div>
        ))}

        <motion.div {...riseIn(0.34)} className="mb-[22px]">
          <VoiceNoteRecorder
            key={formResetKey}
            onRecordingChange={(blob, duracion) => {
              setNotaVozBlob(blob)
              setNotaVozDuracion(duracion)
            }}
          />
          <p className="mt-2 px-1 text-xs text-ink-soft">
            Cualquier otra cosa que quieras decirte a ti mismo/a más adelante
          </p>
        </motion.div>

        <motion.div {...riseIn(0.38)}>
          <button
            type="button"
            disabled={!hayContenido}
            onClick={handleGuardar}
            className="w-full rounded-full bg-gradient-to-br from-faro-1 to-[#FF9C4A] py-[17px] text-center text-[15.5px] font-bold text-white shadow-[0_14px_28px_rgba(242,169,59,0.25)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            💾 Guardar entrada
          </button>
        </motion.div>
      </div>

      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center px-5"
        >
          <div className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg">
            Entrada guardada
          </div>
        </motion.div>
      )}
    </div>
  )
}
