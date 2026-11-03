import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuidedExerciseShell from '../components/GuidedExerciseShell'
import OceanShaderBackground from '../components/OceanShaderBackground'
import supportsWebGL from '../utils/supportsWebGL'
import { AvancePaso, CierreEjercicio } from '../components/AvancePaso'
import { useRitmoPasos } from '../utils/useRitmoPasos'

// 4 min en 4 pasos: un minuto por paso, avanzando solo
const DURACION_S = 240
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
  const textos = useTextos(TEXTOS)
  const t = textos.sensorial
  const PASOS = t.pasos
  const [pausado, setPausado] = useState(false)
  const ritmo = useRitmoPasos(PASOS.length, (DURACION_S * 1000) / PASOS.length, pausado)
  const pasoIndex = ritmo.indice
  const esUltimoPaso = pasoIndex === PASOS.length - 1
  const paso = PASOS[pasoIndex]

  const salir = () => navigate('/islas/aire/puerto-seguro')

  return (
    <GuidedExerciseShell
      title={t.titulo}
      totalSteps={PASOS.length}
      currentStep={ritmo.terminado ? PASOS.length + 1 : pasoIndex + 1}
      durationSeconds={DURACION_S}
      onPausaCambio={setPausado}
      onBack={salir}
      footerLabel={t.pie}
    >
      {ritmo.terminado ? (
        <CierreEjercicio texto={t.cierre} onFinalizar={salir} />
      ) : (
        <div className="text-center">
          <h2 className="mb-1.5 text-xl font-semibold text-cielo">{paso.titulo}</h2>
          <p className="mb-5 text-xs text-cielo/50">{t.toca}</p>
          <InstructionCard>{paso.texto}</InstructionCard>
          <div className="mt-6">
            <AvancePaso progreso={ritmo.progreso} restanteS={ritmo.restanteS} esUltimo={esUltimoPaso} />
          </div>
          <button
            type="button"
            onClick={ritmo.siguiente}
            className="rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
          >
            {esUltimoPaso ? textos.finalizar : textos.continuar}
          </button>
        </div>
      )}
    </GuidedExerciseShell>
  )
}
