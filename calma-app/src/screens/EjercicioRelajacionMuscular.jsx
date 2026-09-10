import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import GuidedExerciseShell from '../components/GuidedExerciseShell'
import piezaBaseConOjo from '../assets/personajes/pirata/pieza_base_conojo.png'
import piezaPupila from '../assets/personajes/pirata/pieza_pupila.png'

const PASOS = [
  {
    zona: 'Hombros',
    partes: ['shoulders'],
    texto: 'Eleva tus hombros hacia las orejas… Sostén… Suelta y relaja',
  },
  {
    zona: 'Mandíbula',
    partes: ['jaw'],
    texto: 'Aprieta suavemente tu mandíbula… Sostén… Relaja completamente',
  },
  {
    zona: 'Brazos',
    partes: ['armLeft', 'armRight'],
    texto:
      'Tensa los músculos de tus brazos, como si los apretaras con fuerza… Sostén… Deja que caigan sueltos a tus costados',
  },
  {
    zona: 'Manos',
    partes: ['handLeft', 'handRight'],
    texto: 'Cierra tus manos en puños apretados… Sostén… Abre los dedos y siente el alivio',
  },
  {
    zona: 'Abdomen',
    partes: ['torso'],
    texto: 'Contrae suavemente los músculos de tu abdomen… Sostén… Suelta y respira profundo',
  },
  {
    zona: 'Piernas',
    partes: ['legLeft', 'legRight'],
    texto:
      'Tensa los músculos de tus piernas, como si empujaras el suelo… Sostén… Suelta y siente el peso de tus piernas',
  },
  {
    zona: 'Pies',
    partes: ['footLeft', 'footRight'],
    texto: 'Aprieta los dedos de tus pies hacia abajo… Sostén… Relaja y siente el contacto con el suelo',
  },
]

// Coordenadas en % del contenedor (mismas proporciones que la imagen completa 2373x2924).
const ZONAS = {
  jaw: { left: 33, top: 0, width: 39, height: 31 },
  shoulders: { left: 28, top: 27, width: 52, height: 15 },
  armLeft: { left: 0, top: 32, width: 35, height: 32 },
  armRight: { left: 63, top: 32, width: 36, height: 42 },
  handLeft: { left: 0, top: 52, width: 20, height: 12 },
  handRight: { left: 83, top: 60, width: 16, height: 14 },
  torso: { left: 30, top: 30, width: 45, height: 38 },
  legLeft: { left: 18, top: 63, width: 34, height: 17 },
  legRight: { left: 58, top: 63, width: 30, height: 17 },
  footLeft: { left: 8, top: 79, width: 42, height: 19 },
  footRight: { left: 60, top: 79, width: 26, height: 18 },
}

// Posición de la pupila en % del contenedor y su recorrido en % de su propio ancho/alto
// (0.8% / 0.15% del contenedor, convertidos a % del tamaño de la pupila: 7.3% / 5.5%).
const PUPILA_POS = { left: 47.2, top: 16.0, width: 7.3, height: 5.5 }
const PUPILA_DX = ((0.8 / PUPILA_POS.width) * 100).toFixed(2) + '%'
const PUPILA_DY = ((0.15 / PUPILA_POS.height) * 100).toFixed(2) + '%'

// Ciclo del ojo: centro (sostén) → derecha (sostén) → centro (sostén) → izquierda (sostén) → centro.
const OJO_DURACION = 8.7
const OJO_TIEMPOS = [0, 2.5, 2.8, 4.3, 4.6, 6.6, 6.9, 8.4, 8.7].map((t) => t / OJO_DURACION)
const OJO_ANIMACION = {
  x: [0, 0, PUPILA_DX, PUPILA_DX, 0, 0, `-${PUPILA_DX}`, `-${PUPILA_DX}`, 0],
  y: [0, 0, `-${PUPILA_DY}`, `-${PUPILA_DY}`, 0, 0, PUPILA_DY, PUPILA_DY, 0],
  transition: {
    duration: OJO_DURACION,
    times: OJO_TIEMPOS,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

function ZoneGlow({ rect }) {
  return (
    <div
      className="absolute"
      style={{ left: `${rect.left}%`, top: `${rect.top}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
    >
      <div
        className="absolute rounded-full"
        style={{
          inset: '-18%',
          background: 'radial-gradient(circle, rgba(255,200,90,0.5) 0%, rgba(255,200,90,0) 70%)',
          filter: 'blur(24px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{ inset: '4%', border: '2.5px solid rgba(255,225,150,0.85)' }}
      />
    </div>
  )
}

function PersonajeConOjo({ pasoIndex, partesActivas }) {
  return (
    <div
      className="relative mx-auto mb-6 w-full max-w-[280px]"
      style={{ aspectRatio: '2373 / 2924' }}
    >
      <img
        src={piezaBaseConOjo}
        alt="Personaje pirata"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
      <motion.div
        className="absolute"
        style={{
          left: `${PUPILA_POS.left}%`,
          top: `${PUPILA_POS.top}%`,
          width: `${PUPILA_POS.width}%`,
          height: `${PUPILA_POS.height}%`,
        }}
        animate={{ x: OJO_ANIMACION.x, y: OJO_ANIMACION.y }}
        transition={OJO_ANIMACION.transition}
      >
        <img src={piezaPupila} alt="" className="pointer-events-none h-full w-full select-none" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div key={pasoIndex} className="absolute inset-0">
          {partesActivas.map((parte) => {
            const rect = ZONAS[parte]
            if (!rect) return null
            return (
              <motion.div
                key={parte}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <ZoneGlow rect={rect} />
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function EjercicioRelajacionMuscular() {
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
      durationSeconds={300}
      onBack={salir}
      footerLabel="Relajación muscular • 5 min"
    >
      <div className="text-center">
        <PersonajeConOjo pasoIndex={pasoIndex} partesActivas={paso.partes} />
        <span className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-faro-1">
          {paso.zona}
        </span>
        <div className="mx-auto mb-3 max-w-[420px] rounded-[20px] border border-white/[0.14] bg-white/[0.08] px-5 py-4 text-sm leading-[1.55] text-white/90">
          {paso.texto}
        </div>
        <button
          type="button"
          onClick={handleContinuar}
          className="mt-5 rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
        >
          {esUltimoPaso ? 'Finalizar' : 'Continuar'}
        </button>
      </div>
    </GuidedExerciseShell>
  )
}
