import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuidedExerciseShell from '../components/GuidedExerciseShell'
import OceanShaderBackground from '../components/OceanShaderBackground'
import supportsWebGL from '../utils/supportsWebGL'

const PASOS = [
  {
    titulo: 'Escucha atenta',
    texto: 'Cierra los ojos y escucha los sonidos a tu alrededor.',
  },
  {
    titulo: 'Enfoque visual',
    texto: 'Encuentra un objeto y observa todos sus detalles.',
  },
  {
    titulo: 'Respira el aire',
    texto: 'Inhala profundamente y nota si hay algún aroma en el ambiente.',
  },
  {
    titulo: 'Siente tu cuerpo',
    texto:
      'Nota los puntos de contacto entre tu cuerpo y la superficie donde estás: tus pies en el suelo, tu espalda en la silla.',
  },
]

function InstructionCard({ children }) {
  return (
    <div className="relative mx-auto max-w-[460px] overflow-hidden rounded-[20px] border border-white/[0.14] bg-white/[0.08] px-8 py-8 text-base leading-[1.6] text-white/90">
      {supportsWebGL() && <OceanShaderBackground interactive intensity={0.6} />}
      <p className="pointer-events-none relative z-[1]">{children}</p>
    </div>
  )
}

export default function EjercicioSensorial() {
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
      durationSeconds={240}
      onBack={salir}
      footerLabel="Ejercicios sensoriales • 4 min"
    >
      <div className="text-center">
        <h2 className="mb-1.5 text-xl font-semibold text-white">{paso.titulo}</h2>
        <p className="mb-5 text-xs text-white/50">Toca el recuadro para interactuar</p>
        <InstructionCard>{paso.texto}</InstructionCard>
        <button
          type="button"
          onClick={handleContinuar}
          className="mt-8 rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
        >
          {esUltimoPaso ? 'Finalizar' : 'Continuar'}
        </button>
      </div>
    </GuidedExerciseShell>
  )
}
