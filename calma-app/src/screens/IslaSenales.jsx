import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const CATEGORIAS = [
  {
    id: 'emocionales',
    icono: '❤️',
    iconBg: '#FDEAF0',
    titulo: 'Señales emocionales',
    senales: [
      'Sentir angustia',
      'Irritabilidad',
      'Tristeza',
      'Sensación de desconexión',
      'Cambios en el estado de ánimo',
    ],
  },
  {
    id: 'fisicas',
    icono: '🧍',
    iconBg: '#EAF2FD',
    titulo: 'Señales físicas',
    senales: [
      'Tensión corporal',
      'Cansancio',
      'Respiración acelerada',
      'Cambios en el sueño',
      'Molestias físicas',
    ],
  },
  {
    id: 'cognitivas',
    icono: '🧠',
    iconBg: '#F3EAFD',
    titulo: 'Señales cognitivas',
    senales: [
      'Pensamientos repetitivos',
      'Dificultad para concentrarse',
      'Sensación de confusión',
      'Preocupación constante',
    ],
  },
  {
    id: 'conductuales',
    icono: '👁️',
    iconBg: '#FFF8EA',
    titulo: 'Señales conductuales',
    senales: [
      'Aislamiento',
      'Evitar actividades',
      'Dificultad para comunicarse',
      'Cambios en rutinas',
    ],
  },
]

function Acordeon({ categoria, abierto, onToggle, delay }) {
  return (
    <motion.div
      {...riseIn(delay)}
      className="mb-3 overflow-hidden rounded-[22px] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="flex w-full items-center gap-3.5 px-[18px] py-4 text-left"
      >
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xl"
          style={{ background: categoria.iconBg }}
        >
          {categoria.icono}
        </span>
        <span className="flex-1 text-[15px] font-bold text-ink">{categoria.titulo}</span>
        <span className="whitespace-nowrap text-xs font-semibold text-ink-soft">
          {categoria.senales.length} señales
        </span>
        <motion.span
          animate={{ rotate: abierto ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#B7B0A4]"
        >
          ⌄
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-[18px] pb-4 pl-[68px]">
              {categoria.senales.map((senal) => (
                <div
                  key={senal}
                  className="rounded-[14px] bg-acomp-bg px-3.5 py-2.5 text-[13.5px] text-[#175C4A]"
                >
                  {senal}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function IslaSenales() {
  const [abiertos, setAbiertos] = useState(new Set(['emocionales']))

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

  return (
    <div className="min-h-screen bg-senales-bg">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/islas" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center bg-white text-[26px]"
            style={{ borderRadius: BLOB_RADIUS }}
          >
            👁️
          </div>
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Isla de las Señales</h1>
          <p className="text-sm text-ink-soft">Reconoce las señales de malestar emocional</p>
        </motion.div>

        <motion.div
          {...riseIn(0.08)}
          className="mb-6 rounded-[20px] bg-white px-5 py-4 text-[13.5px] leading-[1.55] text-ink-soft shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
        >
          Cada persona vive los momentos difíciles de manera distinta. Estas pueden ser algunas
          señales de que podrías necesitar apoyo o acompañamiento.
        </motion.div>

        {CATEGORIAS.map((categoria, index) => (
          <Acordeon
            key={categoria.id}
            categoria={categoria}
            abierto={abiertos.has(categoria.id)}
            onToggle={() => toggleAcordeon(categoria.id)}
            delay={0.14 + index * 0.05}
          />
        ))}

        <motion.div
          {...riseIn(0.14 + CATEGORIAS.length * 0.05)}
          className="mt-4 flex items-start gap-3 rounded-[20px] bg-sand-deep px-5 py-4"
        >
          <span className="text-xl">🛡️</span>
          <p className="text-[13.5px] leading-[1.55] text-ink-soft">
            Estas señales son orientativas, no definitorias. Si sientes que necesitas apoyo, está
            bien buscarlo.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
