import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { riseIn } from '../animations/transitions'

function AnclaIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 7.5V21" />
      <path d="M8 11h8" />
      <path d="M4.5 14a7.5 7.5 0 0 0 15 0" />
    </svg>
  )
}

function BitacoraIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H18v-3" />
      <path d="M9 8h5" />
    </svg>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

const SECUNDARIAS = [
  {
    to: '/islas/aire/puerto-seguro',
    title: 'Puerto seguro',
    description: 'Grounding, relajación y ejercicios sensoriales',
    Icon: AnclaIcon,
  },
  {
    to: '/bitacora',
    title: 'Escribir en la bitácora',
    description: 'Pon en palabras cómo te sientes',
    Icon: BitacoraIcon,
  },
]

function OpcionFila({ to, title, description, Icon, delay }) {
  const navigate = useNavigate()

  return (
    <motion.button
      {...riseIn(delay)}
      type="button"
      onClick={() => navigate(to)}
      whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
      className="mb-3 flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aire-accent/60"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-aire-accent">
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-white">{title}</span>
        <span className="block text-[13px] text-white/60">{description}</span>
      </span>
      <ChevronIcon className="h-5 w-5 flex-shrink-0 text-white/40" />
    </motion.button>
  )
}

export default function IslaAireMenu() {
  const navigate = useNavigate()

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      {/* brisa turquesa: es la isla del aire */}
      <div className="isla-resplandor isla-resplandor--aire pointer-events-none absolute inset-x-0 top-0 h-[55vh]" aria-hidden="true" />
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/islas" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-8">
          <h1 className="text-[30px] font-semibold leading-tight text-white">Isla del Aire</h1>
          <p className="mt-1.5 text-[15px] text-white/75">¿Qué quieres hacer?</p>
        </motion.div>

        {/* la respiración es la herramienta principal de la isla */}
        <motion.button
          {...riseIn(0.08)}
          type="button"
          onClick={() => navigate('/islas/aire/respiracion')}
          whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
          className="mb-5 w-full overflow-hidden rounded-xl border border-aire-accent/30 bg-aire-accent/[0.12] px-6 pb-4 pt-6 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aire-accent/60"
        >
          <span className="block text-[22px] font-semibold leading-tight text-white">
            Respira como las olas
          </span>
          <span className="mt-1.5 block text-sm text-white/70">
            Inhala y exhala al ritmo del mar
          </span>
          <svg viewBox="0 0 300 48" preserveAspectRatio="none" className="mt-5 h-12 w-full" aria-hidden="true">
            <path
              d="M0 30 C 25 10, 50 10, 75 30 S 125 50, 150 30 S 200 10, 225 30 S 275 50, 300 30"
              fill="none"
              className="stroke-aire-accent"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M0 40 C 25 24, 50 24, 75 40 S 125 56, 150 40 S 200 24, 225 40 S 275 56, 300 40"
              fill="none"
              className="stroke-aire-accent"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </motion.button>

        {SECUNDARIAS.map((opcion, index) => (
          <OpcionFila key={opcion.to} {...opcion} delay={0.16 + 0.08 * index} />
        ))}
      </div>
    </div>
  )
}
