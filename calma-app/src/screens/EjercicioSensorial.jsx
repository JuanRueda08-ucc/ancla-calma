import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuidedExerciseShell from '../components/GuidedExerciseShell'
import OceanShaderBackground from '../components/OceanShaderBackground'
import supportsWebGL from '../utils/supportsWebGL'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/ejercicios'


function InstructionCard({ children }) {
  return (
    <div className="relative mx-auto max-w-[460px] overflow-hidden rounded-[20px] border border-cielo/[0.14] bg-white/[0.08] px-8 py-8 text-base leading-[1.6] text-cielo/90">
      {supportsWebGL() && <OceanShaderBackground interactive intensity={0.6} />}
      <p className="pointer-events-none relative z-[1]">{children}</p>
    </div>
  )
}

export default function EjercicioSensorial() {
  const navigate = useNavigate()
  const [pasoIndex, setPasoIndex] = useState(0)
  const textos = useTextos(TEXTOS)
  const t = textos.sensorial
  const PASOS = t.pasos
  const esUltimoPaso = pasoIndex === PASOS.length - 1
  const paso = PASOS[pasoIndex]

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
      durationSeconds={240}
      onBack={salir}
      footerLabel={t.pie}
    >
      <div className="text-center">
        <h2 className="mb-1.5 text-xl font-semibold text-cielo">{paso.titulo}</h2>
        <p className="mb-5 text-xs text-cielo/50">{t.toca}</p>
        <InstructionCard>{paso.texto}</InstructionCard>
        <button
          type="button"
          onClick={handleContinuar}
          className="mt-8 rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
        >
          {esUltimoPaso ? textos.finalizar : textos.continuar}
        </button>
      </div>
    </GuidedExerciseShell>
  )
}
