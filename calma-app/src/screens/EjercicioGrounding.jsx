import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuidedExerciseShell from '../components/GuidedExerciseShell'
import { AvancePaso, CierreEjercicio } from '../components/AvancePaso'
import { useRitmoPasos } from '../utils/useRitmoPasos'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/ejercicios'

const DURACION_S = 180

const PASOS = [
  { emoji: '👁️', numero: '5' },
  { emoji: '✋', numero: '4' },
  { emoji: '👂', numero: '3' },
  { emoji: '👃', numero: '2' },
  { emoji: '👅', numero: '1' },
]

export default function EjercicioGrounding() {
  const navigate = useNavigate()
  const [pausado, setPausado] = useState(false)
  // 3 min en 5 pasos: 36 s por paso, avanzando solo
  const ritmo = useRitmoPasos(PASOS.length, (DURACION_S * 1000) / PASOS.length, pausado)
  const pasoIndex = ritmo.indice
  const textos = useTextos(TEXTOS)
  const t = textos.grounding
  const esUltimoPaso = pasoIndex === PASOS.length - 1
  const paso = { ...PASOS[pasoIndex], ...t.pasos[pasoIndex] }

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
          <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-2 border-aire-accent bg-white/10 text-4xl">
            {paso.emoji}
          </div>
          <p className="mb-5 text-3xl font-bold text-aire-accent">{paso.numero}</p>
          <h2 className="mb-4 text-2xl font-semibold text-cielo">{paso.titulo}</h2>
          <div className="mx-auto mb-3 max-w-[420px] rounded-[20px] border border-cielo/[0.14] bg-white/[0.08] px-5 py-4 text-sm leading-[1.55] text-cielo/90">
            {paso.texto}
          </div>
          <p className="mb-5 text-xs text-cielo/55">{t.respira}</p>
          <AvancePaso progreso={ritmo.progreso} restanteS={ritmo.restanteS} esUltimo={esUltimoPaso} />
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
