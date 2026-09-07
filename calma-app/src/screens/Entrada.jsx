import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import '../styles/entrada.css'
import { riseIn } from '../animations/transitions'
import StarField from '../components/StarField'

export default function Entrada() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  return (
    <div className="entrada-bg relative min-h-screen overflow-hidden text-white">
      <StarField />

      <div className="relative z-[3] flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
        <motion.div
          {...riseIn(0)}
          className="mb-2 font-display uppercase tracking-[2px] text-[64px] text-white"
        >
          Calma
        </motion.div>

        <motion.p
          {...riseIn(0.15)}
          className="mb-[46px] font-sans text-[14.5px] tracking-[.3px] text-white/75"
        >
          Un espacio para ti, contigo donde estés
        </motion.p>

        <motion.div {...riseIn(0.3)} className="relative mb-10 h-[200px] w-[220px]">
          <motion.div
            className="entrada-beam absolute left-1/2 top-[38px] -ml-[130px] h-[260px] w-[260px]"
            animate={reduceMotion ? { rotate: -16 } : { rotate: [-16, 16, -16] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 5, ease: 'easeInOut', repeat: Infinity }
            }
          />

          <svg viewBox="0 0 220 200" width="220" height="200" className="relative z-[2]">
            {/* isla */}
            <ellipse cx="110" cy="182" rx="95" ry="14" fill="#04122A" />
            <path
              d="M40 182 C55 150 90 150 110 150 C130 150 165 150 180 182 Z"
              fill="#0A2A57"
            />
            {/* olas */}
            <path
              d="M0 190 Q 20 182 40 190 T 80 190 T 120 190 T 160 190 T 200 190 T 220 190"
              stroke="rgba(255,255,255,.35)"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M0 178 Q 20 172 40 178 T 80 178 T 120 178 T 160 178 T 200 178 T 220 178"
              stroke="rgba(255,255,255,.2)"
              strokeWidth="2"
              fill="none"
            />
            {/* faro */}
            <rect x="100" y="70" width="20" height="82" rx="3" fill="#FFF8EA" />
            <rect x="100" y="70" width="20" height="16" className="fill-faro-1" />
            <rect x="100" y="102" width="20" height="16" className="fill-faro-1" />
            <rect x="100" y="134" width="20" height="18" className="fill-faro-1" />
            <polygon points="92,70 128,70 110,44" fill="#E85C41" />
            <rect x="104" y="36" width="12" height="12" rx="2" fill="#FFE8B8" />
            <circle cx="110" cy="42" r="5" fill="#FFF6DD" />
          </svg>
        </motion.div>

        <motion.button
          {...riseIn(0.45)}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/elegir')}
          className="relative z-[3] rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,.28)]"
        >
          Comenzar
        </motion.button>
      </div>
    </div>
  )
}
