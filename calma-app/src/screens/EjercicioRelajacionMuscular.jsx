import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuidedExerciseShell from '../components/GuidedExerciseShell'

const DIM_FILL = 'rgba(255,255,255,0.18)'
const ACTIVE_FILL = '#F2A93B'
const ACTIVE_FILTER = 'drop-shadow(0 0 12px rgba(242,169,59,0.85))'
const GLOW_TRANSITION = 'fill 400ms ease, filter 400ms ease'

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

function BodySilhouette({ activeParts }) {
  const styleFor = (key) => ({
    fill: activeParts.includes(key) ? ACTIVE_FILL : DIM_FILL,
    filter: activeParts.includes(key) ? ACTIVE_FILTER : 'none',
    transition: GLOW_TRANSITION,
  })

  return (
    <svg viewBox="0 0 120 230" width="140" height="268" className="mx-auto mb-6">
      {/* cabeza */}
      <circle cx="60" cy="20" r="14" style={styleFor('head')} />
      {/* mandíbula */}
      <ellipse cx="60" cy="30" rx="9" ry="6" style={styleFor('jaw')} />
      {/* cuello */}
      <rect x="54" y="34" width="12" height="8" rx="3" style={styleFor('neck')} />
      {/* hombros */}
      <rect x="28" y="42" width="64" height="13" rx="6.5" style={styleFor('shoulders')} />
      {/* brazos */}
      <rect x="17" y="50" width="14" height="82" rx="7" style={styleFor('armLeft')} />
      <rect x="89" y="50" width="14" height="82" rx="7" style={styleFor('armRight')} />
      {/* manos */}
      <ellipse cx="24" cy="140" rx="10" ry="10" style={styleFor('handLeft')} />
      <ellipse cx="96" cy="140" rx="10" ry="10" style={styleFor('handRight')} />
      {/* torso / abdomen */}
      <rect x="41" y="52" width="38" height="76" rx="15" style={styleFor('torso')} />
      {/* piernas */}
      <rect x="44" y="124" width="14" height="88" rx="7" style={styleFor('legLeft')} />
      <rect x="62" y="124" width="14" height="88" rx="7" style={styleFor('legRight')} />
      {/* pies */}
      <ellipse cx="51" cy="220" rx="13" ry="6.5" style={styleFor('footLeft')} />
      <ellipse cx="69" cy="220" rx="13" ry="6.5" style={styleFor('footRight')} />
    </svg>
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
      onBack={salir}
      footerLabel="Relajación muscular • 5 min"
    >
      <div className="text-center">
        <BodySilhouette activeParts={paso.partes} />
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
