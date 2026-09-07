import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const FASES = ['Inhala…', 'Sostén…', 'Exhala…', 'Sostén…']
const ESCALA_POR_FASE = [1.25, 1.25, 0.85, 0.85]
// Inhala/Exhala animan durante 4s; ambos Sostén fijan el valor sin transición.
const DURACION_TRANSICION_POR_FASE = [4, 0, 4, 0]
const DURACION_FASE_MS = 4000

export default function EjercicioRespiracion() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [faseIndex, setFaseIndex] = useState(0)
  const [sonidoActivo, setSonidoActivo] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setFaseIndex((prev) => (prev + 1) % FASES.length)
    }, DURACION_FASE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,#0A4B94_0%,#002E6B_62%)] text-white">
      <div className="relative z-[3] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            type="button"
            onClick={() => navigate('/islas/aire')}
            aria-label="Volver"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/[0.12] text-base text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setSonidoActivo((prev) => !prev)}
            aria-label={sonidoActivo ? 'Silenciar' : 'Activar sonido'}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/[0.12] text-base text-white"
          >
            {sonidoActivo ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="my-6 mb-[60px] h-1 overflow-hidden rounded bg-white/[0.15]">
          <i className="block h-full w-[38%] rounded bg-aire-accent" />
        </div>

        <div className="relative z-[2] text-center">
          <div className="mb-10 flex justify-center">
            <motion.div
              className="flex h-[210px] w-[210px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#EAF7FB_55%,#6FE3D6_130%)] shadow-[0_0_0_18px_rgba(111,227,214,0.10),0_0_60px_rgba(111,227,214,0.35)]"
              initial={{ scale: 0.85 }}
              animate={{ scale: reduceMotion ? 1 : ESCALA_POR_FASE[faseIndex] }}
              transition={{
                duration: reduceMotion ? 0 : DURACION_TRANSICION_POR_FASE[faseIndex],
                ease: 'easeInOut',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={faseIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[22px] font-semibold text-aire-1"
                >
                  {FASES[faseIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </div>

          <h2 className="mb-2 text-2xl font-semibold text-white">Respiración de caja</h2>
          <p className="mb-[22px] text-[14.5px] text-white/75">
            Sigue el ritmo de las olas del océano
          </p>

          <div className="mx-auto max-w-[420px] rounded-[20px] border border-white/[0.14] bg-white/[0.08] px-5 py-4 text-sm leading-[1.55] text-white/90">
            Esta técnica de respiración ayuda a regular el sistema nervioso y reducir el
            desborde emocional.
          </div>

          <p className="mt-[22px] text-[12.5px] text-white/55">
            4 segundos cada fase • Repetición continua
          </p>
        </div>
      </div>

      <svg
        className="absolute inset-x-0 bottom-0 z-[1] w-full opacity-50"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          fillOpacity="0.08"
          d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L0,120Z"
        />
      </svg>
    </div>
  )
}
