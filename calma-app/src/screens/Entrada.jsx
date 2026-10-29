import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import '../styles/entrada.css'
import { riseIn } from '../animations/transitions'
import StarField from '../components/StarField'
import AccountMenu from '../components/AccountMenu'

// Posición de la linterna dentro del viewBox del faro (0 0 160 360), en %:
// el haz y el halo se anclan aquí.
const LANTERN_X = '50%'
const LANTERN_Y = '26%'

// El faro y su reflejo comparten caja: el reflejo va en una capa aparte por
// encima del mar, así que ambas capas usan exactamente la misma geometría.
const SCENE_ANCHOR = 'pointer-events-none absolute bottom-0 right-[-6%] h-full sm:right-[6%]'
const LIGHTHOUSE_BOX = 'absolute bottom-[21%] right-0 aspect-[160/360] h-[min(58dvh,600px)]'

const RAILING_X = [50, 58, 66, 74, 86, 94, 102, 110]
const MULLION_X = [72, 80, 88]

export default function Entrada() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  return (
    <div className="entrada-bg relative min-h-[100dvh] overflow-hidden text-white">
      <StarField />

      {/* escena: faro anclado a la derecha, sangrando fuera del borde */}
      <motion.div {...riseIn(0.2)} className={SCENE_ANCHOR} aria-hidden="true">
        <div className={LIGHTHOUSE_BOX}>
          <div
            className="absolute h-0 w-0"
            style={{ left: LANTERN_X, top: LANTERN_Y }}
          >
            <motion.div
              className="entrada-beam absolute left-0 top-0"
              initial={{ rotate: 214 }}
              animate={reduceMotion ? { rotate: 214 } : { rotate: [196, 236, 196] }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 10, ease: 'easeInOut', repeat: Infinity }
              }
            />
            <div className="entrada-halo absolute -left-[70px] -top-[70px] h-[140px] w-[140px] rounded-full" />
          </div>

          <svg viewBox="0 0 160 360" className="relative h-full w-full overflow-visible">
            <defs>
              <clipPath id="entradaTowerClip">
                <path d="M54 300 L63 126 L97 126 L106 300 Z" />
              </clipPath>
              <radialGradient id="entradaLampGrad" cx="50%" cy="55%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" className="text-faro-2" stopColor="currentColor" />
                <stop offset="100%" className="text-faro-1" stopColor="currentColor" />
              </radialGradient>
            </defs>

            {/* acantilado: se sale del viewBox (overflow visible) hasta el borde de la pantalla */}
            <path
              d="M14 360 L22 318 C30 306 40 300 52 296 L108 294 C122 290 134 284 146 286 C170 290 190 300 220 298 C260 296 300 304 400 306 L400 360 Z"
              className="fill-brand-navyDeep"
            />
            <path
              d="M22 318 C30 306 40 300 52 296 L70 296 C56 304 44 316 38 334 L30 360 L14 360 Z"
              className="fill-aire-2"
              opacity="0.55"
            />

            {/* torre: tronco esbelto, cara iluminada a la izquierda */}
            <path d="M54 300 L63 126 L97 126 L106 300 Z" className="fill-faro-bg" />
            <g clipPath="url(#entradaTowerClip)">
              <rect x="40" y="168" width="80" height="26" className="fill-faro-1" />
              <rect x="40" y="236" width="80" height="26" className="fill-faro-1" />
              {/* sombra del lado derecho, hacia el navy de marca */}
              <path d="M84 120 L84 300 L120 300 L120 120 Z" className="fill-brand-navy" opacity="0.38" />
            </g>

            {/* puerta y ventana */}
            <path d="M74 300 L74 284 Q80 276 86 284 L86 300 Z" className="fill-brand-navyDeep" />
            <rect x="77" y="206" width="6" height="14" rx="3" className="fill-faro-2" />
            <rect x="77" y="144" width="6" height="12" rx="3" className="fill-faro-2" />

            {/* galería con barandal */}
            <rect x="46" y="118" width="68" height="8" rx="2" className="fill-brand-navyDeep" />
            <line x1="48" y1="104" x2="112" y2="104" className="stroke-faro-bg" strokeWidth="1.4" opacity="0.7" />
            {RAILING_X.map((x) => (
              <line key={x} x1={x} y1="104" x2={x} y2="118" className="stroke-faro-bg" strokeWidth="1" opacity="0.45" />
            ))}

            {/* sala de luz */}
            <rect x="64" y="80" width="32" height="38" className="fill-faro-2" opacity="0.35" />
            <circle cx="80" cy="94" r="10" fill="url(#entradaLampGrad)" />
            {MULLION_X.map((x) => (
              <line key={x} x1={x} y1="80" x2={x} y2="118" className="stroke-brand-navyDeep" strokeWidth="1.2" opacity="0.7" />
            ))}
            <rect x="64" y="80" width="32" height="38" fill="none" className="stroke-brand-navyDeep" strokeWidth="1.6" />

            {/* techo y remate */}
            <path d="M58 81 L80 58 L102 81 Z" className="fill-brand-navyDeep" />
            <path d="M58 81 L80 58 L80 81 Z" className="fill-aire-2" opacity="0.6" />
            <line x1="80" y1="58" x2="80" y2="46" className="stroke-brand-navyDeep" strokeWidth="2" strokeLinecap="round" />
            <circle cx="80" cy="45" r="2.4" className="fill-faro-2" />
          </svg>
        </div>
      </motion.div>

      {/* mar: ocupa todo el ancho, por delante de la base del acantilado */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] w-full"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="entradaSeaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="text-aire-2" stopColor="currentColor" />
            <stop offset="100%" className="text-brand-navyDeep" stopColor="currentColor" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="100" fill="url(#entradaSeaGrad)" />
        <line x1="0" y1="0.5" x2="400" y2="0.5" className="stroke-aire-accent" strokeWidth="1" opacity="0.35" vectorEffect="non-scaling-stroke" />
        <path d="M0 22 Q 25 16 50 22 T 100 22 T 150 22 T 200 22 T 250 22 T 300 22 T 350 22 T 400 22" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path d="M0 52 Q 25 45 50 52 T 100 52 T 150 52 T 200 52 T 250 52 T 300 52 T 350 52 T 400 52" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* reflejo de la linterna: misma caja que el faro, pintado por encima del mar */}
      <motion.div {...riseIn(0.2)} className={SCENE_ANCHOR} aria-hidden="true">
        <div className={LIGHTHOUSE_BOX}>
          <div className="entrada-reflection absolute left-1/2 top-full h-[36%] w-[12%] -translate-x-1/2" />
        </div>
      </motion.div>

      <motion.div {...riseIn(0)} className="absolute right-6 top-6 z-[4]">
        <AccountMenu buttonClassName="bg-white/20 text-white" />
      </motion.div>

      <div className="relative z-[3] mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-7 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[18vh] sm:px-12">
        <motion.h1
          {...riseIn(0)}
          className="entrada-wordmark font-display uppercase leading-[0.9] tracking-[2px] text-white"
        >
          Calma
        </motion.h1>

        <motion.p
          {...riseIn(0.15)}
          className="mt-4 max-w-[15rem] font-sans text-[15px] leading-relaxed text-white/75 sm:max-w-xs sm:text-base"
        >
          Un espacio para ti, contigo donde estés
        </motion.p>

        <motion.button
          {...riseIn(0.45)}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/elegir')}
          className="mt-auto self-start rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-faro-2"
        >
          Comenzar
        </motion.button>
      </div>
    </div>
  )
}
