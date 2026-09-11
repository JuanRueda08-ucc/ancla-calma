import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { riseIn } from '../animations/transitions'
import AccountMenu from '../components/AccountMenu'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const CAMINOS = [
  {
    to: '/islas',
    emoji: '🌊',
    title: 'Necesito ayuda',
    description:
      'Explora herramientas de calma, contacto de emergencia y tu bitácora emocional.',
    gradient: 'from-auxilio-1 to-auxilio-2',
    shadow: 'shadow-[0_16px_34px_rgba(255,122,89,0.22)]',
    delay: 0.12,
  },
  {
    to: '/acompanamiento',
    emoji: '💚',
    title: 'Quiero ayudar',
    description: 'Aprende a reconocer señales y acompañar a alguien que lo necesita.',
    gradient: 'from-acomp-1 to-acomp-2',
    shadow: 'shadow-[0_16px_34px_rgba(47,191,159,0.20)]',
    delay: 0.22,
  },
]

function CaminoCard({ to, emoji, title, description, gradient, shadow, delay }) {
  const navigate = useNavigate()

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
      className={`flex w-full cursor-pointer flex-col items-start gap-[14px] rounded-xl bg-gradient-to-br px-6 py-7 text-left mb-[18px] ${gradient} ${shadow}`}
    >
      <div
        className="flex h-16 w-16 items-center justify-center bg-white/70 text-[26px]"
        style={{ borderRadius: BLOB_RADIUS }}
      >
        {emoji}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-sm leading-normal text-white/[0.85]">{description}</p>
      <div className="-mt-[34px] flex h-[38px] w-[38px] self-end items-center justify-center rounded-full bg-white/[0.22] text-white">
        →
      </div>
    </motion.div>
  )
}

export default function ElegirCamino() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F1] to-[#EAF0F7]">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <div className="flex justify-end">
          <AccountMenu />
        </div>

        <motion.div {...riseIn(0)} className="mb-9 mt-5 text-center">
          <h1 className="mb-2 text-[28px] font-semibold text-ink">¿Qué necesitas hoy?</h1>
          <p className="text-[14.5px] text-ink-soft">
            Elige el camino que se ajuste a este momento
          </p>
        </motion.div>

        {CAMINOS.map((camino) => (
          <CaminoCard key={camino.to} {...camino} />
        ))}
      </div>
    </div>
  )
}
