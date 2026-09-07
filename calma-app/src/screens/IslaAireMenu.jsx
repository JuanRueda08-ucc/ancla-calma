import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const OPCIONES = [
  {
    to: '/islas/aire/respiracion',
    emoji: '🌊',
    title: 'Respira como las olas',
    variant: 'light',
    background: 'bg-white',
    shadow: 'shadow-[0_10px_24px_rgba(0,0,0,0.05)]',
    blobBg: 'bg-aire-glow',
  },
  {
    to: '/islas/aire/puerto-seguro',
    emoji: '⚓',
    title: 'Puerto seguro',
    variant: 'dark',
    background: 'bg-[linear-gradient(120deg,#001B44,#002E6B)]',
    shadow: 'shadow-[0_14px_30px_rgba(0,27,68,0.35)]',
    blobBg: 'bg-white/[0.7]',
  },
  {
    to: '/bitacora',
    emoji: '📖',
    title: 'Escribir en la bitácora',
    variant: 'light',
    background: 'bg-white',
    shadow: 'shadow-[0_10px_24px_rgba(0,0,0,0.05)]',
    blobBg: 'bg-faro-bg',
  },
]

function OpcionCard({ to, emoji, title, variant, background, shadow, blobBg, delay }) {
  const navigate = useNavigate()
  const isDark = variant === 'dark'

  const activate = () => navigate(to)

  return (
    <motion.div
      {...riseIn(delay)}
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate()
        }
      }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ y: -2, transition: { duration: 0.15 } }}
      className={`mb-4 flex w-full cursor-pointer items-center gap-4 rounded-xl p-4 ${background} ${shadow}`}
    >
      <div
        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center text-[22px] ${blobBg}`}
        style={{ borderRadius: BLOB_RADIUS }}
      >
        {emoji}
      </div>
      <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-ink'}`}>{title}</h3>
    </motion.div>
  )
}

export default function IslaAireMenu() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-aire-1 via-aire-2 to-[#7592B3]">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/islas" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <h1 className="mb-1.5 text-[26px] font-semibold text-white">Isla del Aire</h1>
          <p className="text-sm text-white/80">¿Qué quieres hacer?</p>
        </motion.div>

        {OPCIONES.map((opcion, index) => (
          <OpcionCard key={opcion.to} {...opcion} delay={0.08 * (index + 1)} />
        ))}
      </div>
    </div>
  )
}
