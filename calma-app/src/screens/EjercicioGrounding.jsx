import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuidedExerciseShell from '../components/GuidedExerciseShell'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/ejercicios'

const PASOS = [
  { emoji: '👁️', numero: '5' },
  { emoji: '✋', numero: '4' },
  { emoji: '👂', numero: '3' },
  { emoji: '👃', numero: '2' },
  { emoji: '👅', numero: '1' },
]

export default function EjercicioGrounding() {
  const navigate = useNavigate()
  const [pasoIndex, setPasoIndex] = useState(0)
  const textos = useTextos(TEXTOS)
  const t = textos.grounding
  const esUltimoPaso = pasoIndex === PASOS.length - 1
  const paso = { ...PASOS[pasoIndex], ...t.pasos[pasoIndex] }

  const salir = () => navigate('/islas/aire/puerto-seguro')

  const handleContinuar = () => {
    if (esUltimoPaso) {
      salir()
    } else {
      setPasoIndex((prev) => prev + 1)
    }
  }

  return (
    <GuidedExerciseShell
      title={t.titulo}
      totalSteps={PASOS.length}
      currentStep={pasoIndex + 1}
      durationSeconds={180}
      onBack={salir}
      footerLabel={t.pie}
    >
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-2 border-aire-accent bg-white/10 text-4xl">
          {paso.emoji}
        </div>
        <p className="mb-5 text-3xl font-bold text-aire-accent">{paso.numero}</p>
        <h2 className="mb-4 text-2xl font-semibold text-cielo">{paso.titulo}</h2>
        <div className="mx-auto mb-3 max-w-[420px] rounded-[20px] border border-cielo/[0.14] bg-white/[0.08] px-5 py-4 text-sm leading-[1.55] text-cielo/90">
          {paso.texto}
        </div>
        <p className="mb-8 text-xs text-cielo/55">{t.respira}</p>
        <button
          type="button"
          onClick={handleContinuar}
          className="rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
        >
          {esUltimoPaso ? textos.finalizar : textos.continuar}
        </button>
      </div>
    </GuidedExerciseShell>
  )
}
