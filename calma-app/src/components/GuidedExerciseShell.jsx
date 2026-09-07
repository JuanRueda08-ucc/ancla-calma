import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import StarField from './StarField'
import { NIGHT_SKY_BG } from '../styles/nightSky'

export default function GuidedExerciseShell({
  totalSteps,
  currentStep,
  onBack,
  footerLabel,
  children,
}) {
  const [pausado, setPausado] = useState(false)
  const progreso = (currentStep / totalSteps) * 100

  return (
    <div className={`relative min-h-screen overflow-hidden ${NIGHT_SKY_BG} text-white`}>
      <StarField />

      <div className="relative z-[3] mx-auto flex min-h-screen max-w-[620px] flex-col px-5 pb-10 pt-10">
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            type="button"
            onClick={() => setPausado((prev) => !prev)}
            aria-label={pausado ? 'Reanudar' : 'Pausar'}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/[0.12] text-base text-white"
          >
            {pausado ? '▶' : '⏸'}
          </button>
          <button
            type="button"
            onClick={onBack}
            aria-label="Cerrar"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/[0.12] text-base text-white"
          >
            ×
          </button>
        </div>

        <div className="my-6 h-1 overflow-hidden rounded bg-white/[0.15]">
          <motion.div
            className="h-full rounded bg-aire-accent"
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-[12.5px] text-white/55">{footerLabel}</p>
      </div>
    </div>
  )
}
