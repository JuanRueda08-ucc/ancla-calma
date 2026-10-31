import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/elegirCamino.css'
import { riseIn } from '../animations/transitions'
import InstalarApp from '../components/InstalarApp'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'

// Salvavidas: pedir ayuda en medio del agua.
function SalvavidasIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      {/* aro de radio 11 a 24: el centro queda hueco y deja ver la franja */}
      <circle cx="32" cy="32" r="17.5" fill="none" className="stroke-faro-bg" strokeWidth="13" />
      <g className="fill-auxilio-1">
        <path d="M24 9.4 A24 24 0 0 1 40 9.4 L36.4 21.9 A11 11 0 0 0 27.6 21.9 Z" />
        <path d="M24 54.6 A24 24 0 0 0 40 54.6 L36.4 42.1 A11 11 0 0 1 27.6 42.1 Z" />
        <path d="M9.4 24 A24 24 0 0 0 9.4 40 L21.9 36.4 A11 11 0 0 1 21.9 27.6 Z" />
        <path d="M54.6 24 A24 24 0 0 1 54.6 40 L42.1 36.4 A11 11 0 0 0 42.1 27.6 Z" />
      </g>
      <circle cx="32" cy="32" r="24" fill="none" className="stroke-brand-navyDeep" strokeWidth="1.5" opacity="0.35" />
      <circle cx="32" cy="32" r="11" fill="none" className="stroke-brand-navyDeep" strokeWidth="1.5" opacity="0.35" />
    </svg>
  )
}

// Farol de mano: llevar luz a alguien más.
function FarolIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <path d="M24 12 Q32 2 40 12" fill="none" className="stroke-brand-navyDeep" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="22" y="12" width="20" height="6" rx="2" className="fill-brand-navyDeep" />
      <circle cx="32" cy="34" r="17" className="fill-faro-2" opacity="0.45" />
      <rect x="23" y="18" width="18" height="30" rx="3" className="fill-faro-bg" />
      <circle cx="32" cy="33" r="6" className="fill-faro-1" />
      <circle cx="32" cy="33" r="3" className="fill-faro-bg" />
      <line x1="32" y1="18" x2="32" y2="48" className="stroke-brand-navyDeep" strokeWidth="1.5" opacity="0.35" />
      <rect x="20" y="48" width="24" height="6" rx="2" className="fill-brand-navyDeep" />
    </svg>
  )
}

const CAMINOS = [
  {
    to: '/islas',
    title: 'Necesito ayuda',
    description:
      'Explora herramientas de calma, contacto de emergencia y tu bitácora emocional.',
    Icon: SalvavidasIcon,
    band: 'bg-gradient-to-r from-auxilio-1 to-faro-1 shadow-[0_18px_44px_rgba(255,122,89,0.28)]',
    delay: 0.2,
  },
  {
    to: '/acompanamiento',
    title: 'Quiero ayudar',
    description: 'Aprende a reconocer señales y acompañar a alguien que lo necesita.',
    Icon: FarolIcon,
    band: 'bg-gradient-to-r from-acomp-1 to-acomp-2 shadow-[0_18px_44px_rgba(47,191,159,0.24)]',
    delay: 0.32,
  },
]

function CaminoBand({ to, title, description, Icon, band, delay }) {
  const navigate = useNavigate()

  return (
    <motion.button
      {...riseIn(delay)}
      type="button"
      onClick={() => navigate(to)}
      whileHover={{ x: -4, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
      // Contenida y redondeada en todos los tamaños: en móvil la franja que
      // salía por el borde derecho se veía cortada, no como un haz de luz.
      className={`flex w-full items-center gap-4 rounded-xl px-6 py-6 text-left text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 sm:px-8 ${band}`}
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-[22px] font-semibold leading-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-navyDeep/80">{description}</p>
      </div>
      <div className="h-16 w-16 shrink-0 sm:h-20 sm:w-20">
        <Icon />
      </div>
    </motion.button>
  )
}

export default function ElegirCamino() {
  const [searchParams] = useSearchParams()
  const cuentaEliminada = searchParams.get('cuenta_eliminada') === '1'

  return (
    <div className="elegir-bg relative min-h-[100dvh] overflow-hidden text-white">
      <StarField />

      <div className="relative z-[2] mx-auto flex min-h-[100dvh] max-w-[620px] flex-col px-6 pb-[18vh] pt-10">
        <ScreenHeader backTo="/" accountButtonClassName="bg-white/20 text-white" />

        {cuentaEliminada && (
          <motion.div
            {...riseIn(0)}
            className="mb-5 rounded-lg bg-acomp-1/15 px-4 py-3 text-sm font-semibold text-acomp-bg"
          >
            Tu cuenta fue eliminada
          </motion.div>
        )}

        <motion.div {...riseIn(0)} className="mb-8 mt-[3vh] sm:mb-10 sm:mt-[6vh]">
          <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">
            ¿Qué necesitas hoy?
          </h1>
          <p className="mt-3 text-[15px] text-white/70">Elige el camino que se ajuste a este momento</p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {CAMINOS.map((camino) => (
            <CaminoBand key={camino.to} {...camino} />
          ))}
        </div>

        <InstalarApp />
      </div>

      {/* el mar de Entrada, visto más de cerca */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] w-full"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="elegirSeaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="text-aire-2" stopColor="currentColor" />
            <stop offset="100%" className="text-brand-navyDeep" stopColor="currentColor" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="100" fill="url(#elegirSeaGrad)" />
        <line x1="0" y1="0.5" x2="400" y2="0.5" className="stroke-aire-accent" strokeWidth="1" opacity="0.35" vectorEffect="non-scaling-stroke" />
        <path d="M0 34 Q 25 26 50 34 T 100 34 T 150 34 T 200 34 T 250 34 T 300 34 T 350 34 T 400 34" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
