import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FlechaAtrasIcon, SilencioIcon, SonidoIcon } from '../components/Iconos'
import { useVolverA } from '../utils/useVolverA'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/ejercicios'

const NUMERO_FASES = 4
const ESCALA_POR_FASE = [1.25, 1.25, 0.85, 0.85]
// Inhala/Exhala animan durante 4s; ambos Sostén fijan el valor sin transición.
const DURACION_TRANSICION_POR_FASE = [4, 0, 4, 0]
const DURACION_FASE_MS = 4000

export default function EjercicioRespiracion() {
  const navigate = useNavigate()
  const volverA = useVolverA('/islas/aire')
  const [faseIndex, setFaseIndex] = useState(0)
  const [sonidoActivo, setSonidoActivo] = useState(true)
  const t = useTextos(TEXTOS).respiracion

  useEffect(() => {
    const id = setInterval(() => {
      setFaseIndex((prev) => (prev + 1) % NUMERO_FASES)
    }, DURACION_FASE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden respiracion-bg text-cielo">
      <div className="relative z-[3] mx-auto max-w-[620px] px-5 pb-20 pt-[calc(2.5rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            type="button"
            onClick={() => navigate(volverA)}
            aria-label={t.volver}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/[0.12] text-base text-cielo"
          >
            <FlechaAtrasIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setSonidoActivo((prev) => !prev)}
            aria-label={sonidoActivo ? t.silenciar : t.activarSonido}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/[0.12] text-base text-cielo"
          >
            {sonidoActivo ? <SonidoIcon className="h-5 w-5" /> : <SilencioIcon className="h-5 w-5" />}
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
              animate={{ scale: ESCALA_POR_FASE[faseIndex] }}
              transition={{
                duration: DURACION_TRANSICION_POR_FASE[faseIndex],
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
                  {t.fases[faseIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </div>

          <h1 className="mb-2 text-2xl font-semibold text-cielo">{t.titulo}</h1>
          <p className="mb-[22px] text-[14.5px] text-cielo/75">
            {t.subtitulo}
          </p>

          <div className="mx-auto max-w-[420px] rounded-[20px] border border-cielo/[0.14] bg-white/[0.08] px-5 py-4 text-sm leading-[1.55] text-cielo/90">
            {t.explicacion}
          </div>

          <p className="mt-[22px] text-[12.5px] text-cielo/55">
            {t.pie}
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