import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuidedExerciseShell from '../components/GuidedExerciseShell'

const PASOS = [
  {
    emoji: '👁️',
    numero: '5',
    titulo: '5 cosas que puedes ver',
    texto: 'Observa tu alrededor y nombra 5 cosas que puedas ver, sin apurarte.',
  },
  {
    emoji: '✋',
    numero: '4',
    titulo: '4 cosas que puedes tocar',
    texto: 'Nota la textura de algo cerca de ti: tu ropa, una superficie, tu propia piel.',
  },
  {
    emoji: '👂',
    numero: '3',
    titulo: '3 cosas que puedes escuchar',
    texto: 'Enfoca tu atención en los sonidos cercanos, incluso los más sutiles.',
  },
  {
    emoji: '👃',
    numero: '2',
    titulo: '2 cosas que puedes oler',
    texto: 'Percibe algún aroma en el ambiente, o el olor de tu propia piel o ropa.',
  },
  {
    emoji: '👅',
    numero: '1',
    titulo: '1 cosa que puedes saborear',
    texto: 'Nota el sabor en tu boca en este momento, o toma un sorbo de algo.',
  },
]

export default function EjercicioGrounding() {
  const navigate = useNavigate()
  const [pasoIndex, setPasoIndex] = useState(0)
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
      totalSteps={PASOS.length}
      currentStep={pasoIndex + 1}
      durationSeconds={180}
      onBack={salir}
      footerLabel="Ejercicio de grounding • 3 min"
    >
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-2 border-aire-accent bg-white/10 text-4xl">
          {paso.emoji}
        </div>
        <p className="mb-5 text-3xl font-bold text-aire-accent">{paso.numero}</p>
        <h2 className="mb-4 text-2xl font-semibold text-white">{paso.titulo}</h2>
        <div className="mx-auto mb-3 max-w-[420px] rounded-[20px] border border-white/[0.14] bg-white/[0.08] px-5 py-4 text-sm leading-[1.55] text-white/90">
          {paso.texto}
        </div>
        <p className="mb-8 text-xs text-white/55">Respira suavemente mientras observas</p>
        <button
          type="button"
          onClick={handleContinuar}
          className="rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
        >
          {esUltimoPaso ? 'Finalizar' : 'Continuar'}
        </button>
      </div>
    </GuidedExerciseShell>
  )
}
