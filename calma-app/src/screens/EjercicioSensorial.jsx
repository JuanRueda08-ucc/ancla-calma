import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import GuidedExerciseShell from '../components/GuidedExerciseShell'

const PASOS = [
  {
    titulo: 'Escucha atenta',
    texto: 'Cierra los ojos y escucha los sonidos a tu alrededor.',
  },
  {
    titulo: 'Mira con atención',
    texto:
      'Observa un objeto cercano como si fuera la primera vez que lo ves. Nota su color, forma y textura.',
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

function PulsingCard({ children, reduceMotion }) {
  return (
    <motion.div
      className="mx-auto max-w-[460px] rounded-[20px] border border-white/[0.14] bg-white/[0.08] px-8 py-8 text-base leading-[1.6] text-white/90"
      animate={
        reduceMotion
          ? {}
          : {
              boxShadow: [
                '0 0 0px rgba(111,227,214,0)',
                '0 0 22px rgba(111,227,214,0.22)',
                '0 0 0px rgba(111,227,214,0)',
              ],
            }
      }
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function EjercicioSensorial() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
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
      onBack={salir}
      footerLabel="Ejercicios sensoriales • 4 min"
    >
      <div className="text-center">
        <h2 className="mb-5 text-xl font-semibold text-white">{paso.titulo}</h2>
        <PulsingCard reduceMotion={reduceMotion}>{paso.texto}</PulsingCard>
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
