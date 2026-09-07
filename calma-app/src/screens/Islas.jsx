import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const ISLAS = [
  {
    to: '/islas/auxilio',
    emoji: '🌊',
    title: 'Isla del Auxilio',
    description: 'Contacto de emergencia',
    variant: 'dark',
    background: 'bg-[linear-gradient(120deg,#FF7A59,#FFB199)]',
    shadow: 'shadow-[0_14px_30px_rgba(255,122,89,0.22)]',
    blobBg: 'bg-white/[0.55]',
  },
  {
    to: '/islas/aire',
    emoji: '🍃',
    title: 'Isla del Aire',
    description: 'Respiración y calma',
    variant: 'dark',
    background: 'bg-[linear-gradient(120deg,#002E6B,#0A4B94)]',
    shadow: 'shadow-[0_14px_30px_rgba(0,46,107,0.28)]',
    blobBg: 'bg-white/[0.55]',
  },
  {
    to: '/islas/faro',
    emoji: '🔥',
    title: 'Isla del Faro',
    description: 'Tus recursos personales',
    variant: 'light',
    background: 'bg-[linear-gradient(120deg,#F2A93B,#FFD37A)]',
    shadow: 'shadow-[0_14px_30px_rgba(242,169,59,0.25)]',
    blobBg: 'bg-white/[0.55]',
  },
  {
    to: '/islas/senales',
    emoji: '👁️',
    title: 'Isla de las Señales',
    description: 'Reconoce el malestar emocional',
    variant: 'light',
    background: 'bg-white border-[1.5px] border-solid border-[#E4E9E7]',
    shadow: 'shadow-[0_10px_24px_rgba(0,0,0,0.05)]',
    blobBg: 'bg-senales-bg',
  },
]

function IslaCard({ to, emoji, title, description, variant, background, shadow, blobBg, delay }) {
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
      className={`relative mb-4 flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-xl p-5 ${background} ${shadow}`}
    >
      <div
        className={`flex h-16 w-16 flex-shrink-0 items-center justify-center text-[26px] ${blobBg}`}
        style={{ borderRadius: BLOB_RADIUS }}
      >
        {emoji}
      </div>
      <div>
        <h3 className={`mb-0.5 text-lg font-semibold ${isDark ? 'text-white' : 'text-ink'}`}>
          {title}
        </h3>
        <p className={`text-[13.5px] ${isDark ? 'text-white/[0.85]' : 'text-ink-soft'}`}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function Islas() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F1] to-[#F7EEDF]">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/elegir" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <p className="mb-1.5 text-[15px] text-ink-soft">Elige a dónde ir</p>
          <h1 className="text-[30px] font-semibold text-ink">
            ¿Qué necesitas en este momento?
          </h1>
        </motion.div>

        {ISLAS.map((isla, index) => (
          <IslaCard key={isla.to} {...isla} delay={0.08 * (index + 1)} />
        ))}
      </div>
    </div>
  )
}
