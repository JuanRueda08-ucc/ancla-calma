import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/islas.css'
import ScreenHeader from '../components/ScreenHeader'
import { riseIn } from '../animations/transitions'

// Islas vistas desde arriba, como en una carta náutica (viewBox 0 0 120 100).
// La costa se dibuja una sola vez y se repite con trazos gruesos para el agua
// poco profunda y la orilla de arena, así ambas siguen las bahías y penínsulas.
// Cada isla tiene su propia silueta e islotes para que el archipiélago no se vea repetido.
function Isla({ costa, landClass, children }) {
  return (
    <svg viewBox="0 0 120 100" className="h-auto w-full overflow-visible" aria-hidden="true">
      <g className="fill-aire-accent stroke-aire-accent" strokeWidth="18" strokeLinejoin="round" opacity="0.14">
        {costa.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="fill-faro-bg stroke-faro-bg" strokeWidth="7" strokeLinejoin="round" opacity="0.9">
        {costa.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className={landClass}>
        {costa.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {children}
    </svg>
  )
}

function IslaAuxilio() {
  return (
    <Isla
      costa={[
        'M30 46 C28 34 40 26 50 30 C56 22 70 22 76 30 C88 28 96 38 92 48 C98 56 92 68 80 68 C76 78 60 80 54 72 C42 76 30 70 32 60 C24 56 24 48 30 46 Z',
        'M100 72 C100 68 106 68 106 72 C106 76 100 76 100 72 Z',
      ]}
      landClass="fill-auxilio-1"
    >
      {/* boya salvavidas vista desde arriba */}
      <circle cx="61" cy="50" r="12" fill="none" className="stroke-faro-bg" strokeWidth="7" />
      <circle cx="61" cy="50" r="12" fill="none" className="stroke-auxilio-2" strokeWidth="7" strokeDasharray="9.4 9.4" />
    </Isla>
  )
}

function IslaAire() {
  return (
    <Isla
      costa={[
        'M24 54 C22 44 32 36 44 38 C50 30 64 30 70 36 C80 32 94 38 94 48 C94 56 86 58 80 56 C76 62 82 70 72 72 C62 74 56 66 50 68 C40 72 26 66 24 54 Z',
        'M14 36 C14 31 21 31 21 36 C21 40 14 40 14 36 Z',
      ]}
      landClass="fill-aire-accent"
    >
      {/* remolinos de viento */}
      <g fill="none" className="stroke-brand-navy" strokeWidth="3" strokeLinecap="round">
        <path d="M36 46 H62 C70 46 72 37 65 36 C60 35 58 40 61 42" />
        <path d="M42 56 H70 C78 56 79 66 72 66 C67 66 66 61 69 60" />
        <path d="M34 63 H52" />
      </g>
    </Isla>
  )
}

function IslaFaro() {
  return (
    <Isla
      costa={[
        'M34 40 C40 28 58 26 68 32 C80 30 90 40 88 52 C86 62 76 66 70 62 C66 70 54 74 46 68 C36 70 28 60 32 52 C28 48 30 42 34 40 Z',
        'M96 70 C96 66 101 66 101 70 C101 73 96 73 96 70 Z',
        'M104 62 C104 59 108 59 108 62 C108 65 104 65 104 62 Z',
      ]}
      landClass="fill-faro-1"
    >
      {/* el faro desde arriba: torre redonda con su luz encendida y el haz sobre el agua */}
      <defs>
        <linearGradient id="islasHazFaro" x1="60" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" className="text-faro-2" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" className="text-faro-2" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M60 49 L118 20 L122 40 Z" fill="url(#islasHazFaro)" />
      <circle cx="60" cy="49" r="14" className="fill-faro-2" opacity="0.55" />
      <circle cx="60" cy="49" r="8" className="fill-faro-bg" />
      <circle cx="60" cy="49" r="4" className="fill-faro-1" />
    </Isla>
  )
}

function IslaSenales() {
  return (
    <Isla
      costa={[
        'M28 50 C26 38 38 30 48 34 C54 26 72 26 76 36 C86 36 94 46 90 56 C86 66 74 66 70 72 C62 78 50 74 46 68 C36 68 28 60 28 50 Z',
        'M16 70 C16 66 22 66 22 70 C22 74 16 74 16 70 Z',
      ]}
      landClass="fill-senales-1"
    >
      {/* mástil con banderas de señales */}
      <line x1="56" y1="66" x2="56" y2="33" className="stroke-faro-bg" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M57 34 L76 39 L57 45 Z" className="fill-faro-2" />
      <path d="M57 46 L72 50 L57 55 Z" className="fill-auxilio-1" />
    </Isla>
  )
}

const ISLAS = [
  {
    to: '/islas/auxilio',
    title: 'Isla del Auxilio',
    description: 'Contacto de emergencia',
    Dibujo: IslaAuxilio,
  },
  {
    to: '/islas/aire',
    title: 'Isla del Aire',
    description: 'Respiración y calma',
    Dibujo: IslaAire,
  },
  {
    to: '/islas/faro',
    title: 'Isla del Faro',
    description: 'Tus recursos personales',
    Dibujo: IslaFaro,
  },
  {
    to: '/islas/senales',
    title: 'Isla de las Señales',
    description: 'Reconoce el malestar emocional',
    Dibujo: IslaSenales,
  },
]

// Las islas alternan lado (izquierda/derecha). El dibujo ocupa el 36% del ancho,
// así que su centro queda en el 18% o el 82%: la ruta punteada une esos puntos.
function Ruta({ haciaDerecha }) {
  const d = haciaDerecha ? 'M18 0 C18 60 82 40 82 100' : 'M82 0 C82 60 18 40 18 100'
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="-my-3 h-14 w-full" aria-hidden="true">
      <path
        d={d}
        fill="none"
        className="stroke-faro-2"
        strokeWidth="2"
        strokeDasharray="2 7"
        strokeLinecap="round"
        opacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function IslaParada({ to, title, description, Dibujo, invertida, delay }) {
  const navigate = useNavigate()

  return (
    <motion.button
      {...riseIn(delay)}
      type="button"
      onClick={() => navigate(to)}
      whileTap={{ scale: 0.97, transition: { duration: 0.15 } }}
      className={`group flex w-full items-center gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-faro-2/70 ${
        invertida ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <div className="w-[36%] shrink-0 transition-transform duration-200 group-hover:scale-105">
        <Dibujo />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold leading-snug text-white sm:text-xl">{title}</h2>
        <p className="mt-1 text-[13.5px] text-white/70 sm:text-sm">{description}</p>
      </div>
    </motion.button>
  )
}

export default function Islas() {
  return (
    <div className="islas-bg relative min-h-[100dvh] overflow-hidden text-white">
      {/* textura de oleaje, apenas visible */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="islasOleaje" width="90" height="70" patternUnits="userSpaceOnUse">
            <path d="M8 20 q6 -5 12 0 t12 0" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M52 54 q6 -5 12 0 t12 0" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1.4" strokeLinecap="round" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islasOleaje)" />
      </svg>

      <div className="relative z-[2] mx-auto max-w-[540px] px-6 pb-16 pt-10">
        <ScreenHeader backTo="/elegir" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-6 mt-[2vh]">
          <h1 className="text-[30px] font-semibold leading-tight sm:text-[36px]">¿A dónde quieres ir?</h1>
          <p className="mt-2 text-[15px] text-white/70">Cada isla guarda un tipo de ayuda</p>
        </motion.div>

        <div className="flex flex-col">
          {ISLAS.map((isla, index) => (
            <div key={isla.to}>
              {index > 0 && <Ruta haciaDerecha={index % 2 === 1} />}
              <IslaParada {...isla} invertida={index % 2 === 1} delay={0.1 + 0.1 * index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
