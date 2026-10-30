import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { riseIn } from '../animations/transitions'

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function CorazonIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}

function CuerpoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M6 9h12" />
      <path d="M12 9v5" />
      <path d="M9 21l3-7 3 7" />
    </svg>
  )
}

function MenteIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 4a7 7 0 0 0-7 7c0 2 .8 3.7 2 5v4h6v-2h2a2 2 0 0 0 2-2v-2h1.5L17 11a5 5 0 0 0-5-7z" />
      <path d="M10 10a2 2 0 1 1 2 2v1" />
    </svg>
  )
}

function OjoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg {...iconProps} strokeWidth="2.2" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function FlechaIcon({ className }) {
  return (
    <svg {...iconProps} strokeWidth="2.2" className={className}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

function InfoIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

const CATEGORIAS = [
  {
    id: 'emocionales',
    Icon: CorazonIcon,
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
    Icon: CuerpoIcon,
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
    Icon: MenteIcon,
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
    Icon: OjoIcon,
    titulo: 'Señales conductuales',
    senales: [
      'Aislamiento',
      'Evitar actividades',
      'Dificultad para comunicarse',
      'Cambios en rutinas',
    ],
  },
]

const SIGUIENTES_PASOS = [
  {
    to: '/islas/aire/respiracion',
    titulo: 'Respirar un momento',
    descripcion: 'Bajar el ritmo con la respiración de las olas',
  },
  {
    to: '/islas/auxilio',
    titulo: 'Buscar apoyo',
    descripcion: 'Tus personas de confianza y líneas de ayuda',
  },
]

// Versión nocturna del acordeón: el de components/Accordion lo sigue usando
// el Panel de Acompañamiento con su estilo claro.
function CategoriaSenales({ categoria, abierto, onToggle, delay }) {
  const { id, Icon, titulo, senales } = categoria
  const panelId = `senales-${id}`

  return (
    <motion.div
      {...riseIn(delay)}
      className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        aria-controls={panelId}
        className="flex w-full items-center gap-3.5 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-senales-1/60"
      >
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-senales-1/20 text-senales-bg">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex-1 text-[15px] font-semibold text-white">{titulo}</span>
        <span className="whitespace-nowrap text-xs font-semibold text-white/55">
          {senales.length} señales
        </span>
        <motion.span
          animate={{ rotate: abierto ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/50"
        >
          <ChevronIcon className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            id={panelId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ul className="flex flex-wrap gap-2 px-4 pb-4 pl-[74px]">
              {senales.map((senal) => (
                <li
                  key={senal}
                  className="rounded-full border border-senales-1/30 bg-senales-1/[0.14] px-3.5 py-1.5 text-[13.5px] text-senales-bg"
                >
                  {senal}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function IslaSenales() {
  const navigate = useNavigate()
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

  const delayPasos = 0.14 + CATEGORIAS.length * 0.05

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      {/* luz menta: es la isla de las señales */}
      <div className="isla-resplandor isla-resplandor--senales pointer-events-none absolute inset-x-0 top-0 h-[55vh]" aria-hidden="true" />
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/islas" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-6">
          <h1 className="text-[30px] font-semibold leading-tight text-white">Isla de las Señales</h1>
          <p className="mt-1.5 text-[15px] text-white/75">Reconoce las señales de malestar emocional</p>
        </motion.div>

        <motion.p {...riseIn(0.08)} className="mb-6 text-[14px] leading-[1.6] text-white/70">
          Cada persona vive los momentos difíciles de manera distinta. Estas pueden ser algunas
          señales de que podrías necesitar apoyo o acompañamiento.
        </motion.p>

        {CATEGORIAS.map((categoria, index) => (
          <CategoriaSenales
            key={categoria.id}
            categoria={categoria}
            abierto={abiertos.has(categoria.id)}
            onToggle={() => toggleAcordeon(categoria.id)}
            delay={0.14 + index * 0.05}
          />
        ))}

        {/* la información lleva a una acción: respirar o pedir apoyo */}
        <motion.section {...riseIn(delayPasos)} className="mt-8">
          <h2 className="mb-3 text-[17px] font-semibold text-white">¿Te reconoces en algunas?</h2>
          {SIGUIENTES_PASOS.map((paso) => (
            <motion.button
              key={paso.to}
              type="button"
              onClick={() => navigate(paso.to)}
              whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
              className="mb-3 flex w-full items-center gap-4 rounded-xl border border-senales-1/35 bg-senales-1/[0.12] p-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-senales-1/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white">{paso.titulo}</span>
                <span className="block text-[13px] text-white/65">{paso.descripcion}</span>
              </span>
              <FlechaIcon className="h-5 w-5 flex-shrink-0 text-senales-bg" />
            </motion.button>
          ))}
        </motion.section>

        <motion.div
          {...riseIn(delayPasos + 0.05)}
          className="mt-5 flex items-start gap-3 rounded-xl bg-white/[0.04] px-4 py-3.5"
        >
          <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/50" />
          <p className="text-[13.5px] leading-[1.55] text-white/65">
            Estas señales son orientativas, no definitorias. Si sientes que necesitas apoyo, está
            bien buscarlo.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
