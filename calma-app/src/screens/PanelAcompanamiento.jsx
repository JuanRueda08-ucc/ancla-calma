import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ScreenHeader from '../components/ScreenHeader'
import Accordion from '../components/Accordion'
import { riseIn } from '../animations/transitions'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const CATEGORIAS = [
  {
    id: 'emocionales',
    icono: '❤️',
    iconBg: '#FDEAF0',
    titulo: 'Señales emocionales',
    senales: [
      'Expresiones de angustia o malestar',
      'Cambios en el tono emocional',
      'Irritabilidad o sensibilidad aumentada',
      'Retraimiento emocional',
    ],
  },
  {
    id: 'fisicas',
    icono: '🧍',
    iconBg: '#EAF2FD',
    titulo: 'Señales físicas',
    senales: [
      'Tensión visible en el cuerpo',
      'Expresiones de cansancio',
      'Cambios en la respiración',
      'Inquietud o agitación',
    ],
  },
  {
    id: 'cognitivas',
    icono: '🧠',
    iconBg: '#F3EAFD',
    titulo: 'Señales cognitivas',
    senales: [
      'Dificultad para seguir conversaciones',
      'Expresiones de confusión',
      'Preocupación evidente',
    ],
  },
  {
    id: 'conductuales',
    icono: '👁️',
    iconBg: '#FFF8EA',
    titulo: 'Señales conductuales',
    senales: [
      'Evitación de interacciones',
      'Cambios en patrones habituales',
      'Dificultad para expresarse',
    ],
  },
]

const PRINCIPIOS_CLAVE = [
  'Escuchar sin asumir',
  'Evitar etiquetar',
  'Acompañar sin juzgar',
  'Preguntar antes de intervenir',
]

const COMO_ACOMPANAR = [
  'Escucha activamente sin interrumpir',
  'Valida sus emociones: "Es comprensible que te sientas así"',
  'Ofrece tu presencia: "Estoy aquí contigo"',
  'Pregunta: "¿Qué necesitas en este momento?"',
  'Respeta su ritmo y espacio',
]

const QUE_EVITAR = [
  'No minimices: evita "no es para tanto"',
  'No compares: "otros lo tienen peor"',
  'No des soluciones apresuradas',
  'No juzgues sus sentimientos',
  'No fuerces a hablar si no está listo/a',
]

const MENSAJES_RAPIDOS = [
  'Estoy aquí contigo.',
  '¿Quieres hablar?',
  '¿Cómo puedo ayudarte?',
  'Tómate el tiempo que necesites.',
  'No estás solo/a en esto.',
]

// TODO: poblar dinámicamente desde el Faro de la persona acompañada en vez de hardcodear
const HERRAMIENTAS_APOYO = [
  { icon: '🎵', label: 'Escuchar música tranquila' },
  { icon: '🚶', label: 'Dar un paseo' },
  { icon: '📞', label: 'Llamar a alguien de confianza' },
  { icon: '🫁', label: 'Respirar profundo' },
]

const boxClass = 'mb-4 rounded-[20px] bg-white px-5 py-[18px] shadow-[0_8px_20px_rgba(0,0,0,0.04)]'

export default function PanelAcompanamiento() {
  const [abiertos, setAbiertos] = useState(new Set(['emocionales']))
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(toastTimeoutRef.current)
  }, [])

  const showToast = (mensaje, duracion = 2000) => {
    setToast(mensaje)
    clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), duracion)
  }

  const toggleAcordeon = (id) => {
    setAbiertos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const copiarMensaje = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // clipboard API puede no estar disponible/permitida; se ignora silenciosamente
    }
    showToast('Copiado', 1500)
  }

  const handleContactar = () => {
    // TODO: integrar con el canal real de contacto de la persona de confianza
    console.log('Contactar a tu persona (simulado)')
    showToast('Contactando… (simulado)')
  }

  const handleLlamar = () => {
    // TODO: integrar con llamada telefónica real
    console.log('Llamar (simulado)')
    showToast('Llamando… (simulado)')
  }

  const handleMensaje = () => {
    // TODO: integrar con mensajería real (SMS/WhatsApp/etc.)
    console.log('Mensaje (simulado)')
    showToast('Abriendo mensaje… (simulado)')
  }

  const handleProbarAlerta = () => {
    // TODO: integrar con el sistema real de alertas/notificaciones push
    console.log('Alerta de prueba enviada (simulado)')
    showToast('Alerta de prueba enviada', 2000)
  }

  let delay = 0
  const nextDelay = () => {
    const current = delay
    delay += 0.05
    return current
  }

  return (
    <div className="relative min-h-screen bg-acomp-bg">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/elegir" />

        <motion.div {...riseIn(nextDelay())} className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center bg-white text-[26px]"
            style={{ borderRadius: BLOB_RADIUS }}
          >
            💚
          </div>
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Panel de Acompañamiento</h1>
          <p className="text-sm text-ink-soft">Guía para apoyar a tu persona</p>
        </motion.div>

        <motion.div {...riseIn(nextDelay())} className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-senales-bg text-lg text-senales-1">
            👁️
          </span>
          <div>
            <p className="mb-1 font-bold text-ink">Entender las señales</p>
            <p className="text-[13.5px] leading-[1.55] text-ink-soft">
              No todas las personas expresan el malestar emocional de la misma manera. Estas son
              algunas posibles señales para acompañar desde la empatía y el cuidado.
            </p>
          </div>
        </motion.div>

        {CATEGORIAS.map((categoria) => (
          <Accordion
            key={categoria.id}
            icono={categoria.icono}
            iconBg={categoria.iconBg}
            titulo={categoria.titulo}
            items={categoria.senales}
            abierto={abiertos.has(categoria.id)}
            onToggle={() => toggleAcordeon(categoria.id)}
            delay={nextDelay()}
          />
        ))}

        <motion.div {...riseIn(nextDelay())} className={boxClass}>
          <p className="mb-3 font-bold text-ink">Principios clave</p>
          <ul className="list-disc space-y-2 pl-5 text-[13.5px] leading-[1.6] text-ink-soft marker:text-acomp-2">
            {PRINCIPIOS_CLAVE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...riseIn(nextDelay())} className={boxClass}>
          <p className="mb-0.5 font-bold text-ink">👂 Cómo acompañar</p>
          <p className="mb-3 text-xs italic text-ink-soft">
            Principios de primeros auxilios psicológicos
          </p>
          <ul className="list-disc space-y-2 pl-5 text-[13.5px] leading-[1.6] text-ink-soft marker:text-acomp-2">
            {COMO_ACOMPANAR.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...riseIn(nextDelay())} className={boxClass}>
          <p className="mb-3 font-bold text-ink">🛡️ Qué evitar</p>
          <ul className="list-disc space-y-2 pl-5 text-[13.5px] leading-[1.6] text-ink-soft marker:text-faro-1">
            {QUE_EVITAR.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...riseIn(nextDelay())} className={boxClass}>
          <p className="mb-3 font-bold text-ink">💬 Mensajes de apoyo rápido</p>
          <div className="flex flex-col gap-2">
            {MENSAJES_RAPIDOS.map((mensaje) => (
              <button
                key={mensaje}
                type="button"
                onClick={() => copiarMensaje(mensaje)}
                className="rounded-2xl bg-sand px-4 py-3 text-left text-[13.5px] italic text-ink"
              >
                "{mensaje}"
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div {...riseIn(nextDelay())} className={`${boxClass} bg-faro-bg`}>
          <p className="mb-0.5 font-bold text-ink">💡 Herramientas de apoyo</p>
          <p className="mb-3 text-xs text-ink-soft">
            Estas son algunas herramientas que suelen ayudarle en momentos difíciles.
          </p>
          <div className="flex flex-col gap-2">
            {HERRAMIENTAS_APOYO.map((herramienta) => (
              <div
                key={herramienta.label}
                className="rounded-2xl bg-white px-4 py-3 text-[13.5px] text-ink"
              >
                {herramienta.icon} {herramienta.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          {...riseIn(nextDelay())}
          type="button"
          onClick={handleContactar}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-acomp-1 to-[#22A78C] py-4 text-[15px] font-bold text-white shadow-[0_14px_26px_rgba(47,191,159,0.2)]"
        >
          👤 Contactar a tu persona
        </motion.button>

        <motion.div {...riseIn(nextDelay())} className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={handleLlamar}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-acomp-2 to-[#3E6FC4] py-3.5 text-sm font-bold text-white"
          >
            📞 Llamar
          </button>
          <button
            type="button"
            onClick={handleMensaje}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#48C97A] to-[#2FA968] py-3.5 text-sm font-bold text-white"
          >
            💬 Mensaje
          </button>
        </motion.div>

        <motion.div {...riseIn(nextDelay())} className="text-center">
          <button
            type="button"
            onClick={handleProbarAlerta}
            className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-black/[0.15] px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft"
          >
            🔔 Probar alerta
          </button>
        </motion.div>
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
