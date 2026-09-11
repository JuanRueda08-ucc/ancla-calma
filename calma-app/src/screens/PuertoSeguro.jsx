import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { riseIn } from '../animations/transitions'
import { NIGHT_SKY_BG } from '../styles/nightSky'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const EJERCICIOS = [
  {
    to: '/islas/aire/puerto-seguro/grounding',
    emoji: '🌀',
    title: 'Ejercicios de grounding',
    description: '5-4-3-2-1 para conectar con el presente',
    duracion: '3 min',
  },
  {
    to: '/islas/aire/puerto-seguro/relajacion-muscular',
    emoji: '🧘',
    title: 'Relajación muscular',
    description: 'Libera la tensión de tu cuerpo',
    duracion: '5 min',
  },
  {
    to: '/islas/aire/puerto-seguro/sensorial',
    emoji: '✨',
    title: 'Ejercicios sensoriales',
    description: 'Conecta con tus sentidos',
    duracion: '4 min',
  },
]

function EjercicioRow({ to, emoji, title, description, duracion, delay }) {
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
      className="group mb-4 flex w-full cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4"
    >
      <div
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-white/10 text-2xl"
        style={{ borderRadius: BLOB_RADIUS }}
      >
        {emoji}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/60">{description}</p>
      </div>
      <span className="whitespace-nowrap text-xs text-white/50">{duracion}</span>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-150 group-hover:scale-[1.08]">
        <span className="pl-0.5">▶</span>
      </div>
    </motion.div>
  )
}

export default function PuertoSeguro() {
  return (
    <div className={`relative min-h-screen overflow-hidden ${NIGHT_SKY_BG}`}>
      <StarField />

      <div className="relative z-[3] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/islas/aire" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <svg
            viewBox="0 0 100 90"
            width="90"
            height="90"
            className="mx-auto mb-4"
          >
            <ellipse cx="50" cy="82" rx="42" ry="7" fill="#04122A" />
            <path
              d="M18 82 C26 66 40 66 50 66 C60 66 74 66 82 82 Z"
              fill="#0A2A57"
            />
            <rect x="43" y="30" width="14" height="38" rx="2" fill="#FFF8EA" />
            <rect x="43" y="30" width="14" height="11" className="fill-faro-1" />
            <rect x="43" y="52" width="14" height="11" className="fill-faro-1" />
            <polygon points="38,30 62,30 50,14" fill="#E85C41" />
            <rect x="46" y="6" width="8" height="8" rx="2" fill="#FFE8B8" />
            <circle cx="50" cy="10" r="3.5" fill="#FFF6DD" />
          </svg>
          <h1 className="mb-1.5 text-[26px] font-semibold text-white">Puerto Seguro</h1>
          <p className="text-sm text-white/75">Un refugio tranquilo para encontrar calma</p>
        </motion.div>

        {EJERCICIOS.map((ejercicio, index) => (
          <EjercicioRow key={ejercicio.to} {...ejercicio} delay={0.08 * (index + 1)} />
        ))}
      </div>
    </div>
  )
}
