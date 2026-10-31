import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/islaNoche.css'
import Accordion from '../components/Accordion'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { CorazonIcon, CuerpoIcon, FlechaIcon, InfoIcon, MenteIcon, OjoIcon } from '../components/Iconos'
import { riseIn } from '../animations/transitions'

const CATEGORIAS = [
  {
    id: 'emocionales',
    Icon: CorazonIcon,
    titulo: 'Señales emocionales',
    senales: [
      'Sentir angustia',
      'Irritabilidad',
      'Tristeza',
      'Sensación de desconexión',
      'Cambios en el estado de ánimo',
    ],
  },
  {
    id: 'fisicas',
    Icon: CuerpoIcon,
    titulo: 'Señales físicas',
    senales: [
      'Tensión corporal',
      'Cansancio',
      'Respiración acelerada',
      'Cambios en el sueño',
      'Molestias físicas',
    ],
  },
  {
    id: 'cognitivas',
    Icon: MenteIcon,
    titulo: 'Señales cognitivas',
    senales: [
      'Pensamientos repetitivos',
      'Dificultad para concentrarse',
      'Sensación de confusión',
      'Preocupación constante',
    ],
  },
  {
    id: 'conductuales',
    Icon: OjoIcon,
    titulo: 'Señales conductuales',
    senales: [
      'Aislamiento',
      'Evitar actividades',
      'Dificultad para comunicarse',
      'Cambios en rutinas',
    ],
  },
]

const SIGUIENTES_PASOS = [
  {
    to: '/islas/aire/respiracion',
    titulo: 'Respirar un momento',
    descripcion: 'Bajar el ritmo con la respiración de las olas',
  },
  {
    to: '/islas/auxilio',
    titulo: 'Buscar apoyo',
    descripcion: 'Tus personas de confianza y líneas de ayuda',
  },
]

export default function IslaSenales() {
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState('emocionales')

  // Solo una sección abierta a la vez: abrir otra cierra la anterior.
  const toggleAcordeon = (id) => {
    setAbierto((actual) => (actual === id ? null : id))
  }

  const delayPasos = 0.14 + CATEGORIAS.length * 0.05

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      {/* luz menta: es la isla de las señales */}
      <div className="isla-resplandor isla-resplandor--senales pointer-events-none absolute inset-x-0 top-0 h-[55vh]" aria-hidden="true" />
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/islas" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-6">
          <h1 className="text-[30px] font-semibold leading-tight text-white">Isla de las Señales</h1>
          <p className="mt-1.5 text-[15px] text-white/75">Reconoce las señales de malestar emocional</p>
        </motion.div>

        <motion.p {...riseIn(0.08)} className="mb-6 text-[14px] leading-[1.6] text-white/70">
          Cada persona vive los momentos difíciles de manera distinta. Estas pueden ser algunas
          señales de que podrías necesitar apoyo o acompañamiento.
        </motion.p>

        {CATEGORIAS.map((categoria, index) => (
          <Accordion
            key={categoria.id}
            id={`senales-${categoria.id}`}
            Icon={categoria.Icon}
            titulo={categoria.titulo}
            detalle={`${categoria.senales.length} señales`}
            abierto={abierto === categoria.id}
            onToggle={() => toggleAcordeon(categoria.id)}
            delay={0.14 + index * 0.05}
          >
            <ul className="flex flex-wrap gap-2">
              {categoria.senales.map((senal) => (
                <li
                  key={senal}
                  className="rounded-full border border-senales-1/30 bg-senales-1/[0.14] px-3.5 py-1.5 text-[13.5px] text-senales-bg"
                >
                  {senal}
                </li>
              ))}
            </ul>
          </Accordion>
        ))}

        {/* la información lleva a una acción: respirar o pedir apoyo */}
        <motion.section {...riseIn(delayPasos)} className="mt-8">
          <h2 className="mb-3 text-[17px] font-semibold text-white">¿Te reconoces en algunas?</h2>
          {SIGUIENTES_PASOS.map((paso) => (
            <motion.button
              key={paso.to}
              type="button"
              onClick={() => navigate(paso.to)}
              whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
              className="mb-3 flex w-full items-center gap-4 rounded-xl border border-senales-1/35 bg-senales-1/[0.12] p-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-senales-1/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white">{paso.titulo}</span>
                <span className="block text-[13px] text-white/65">{paso.descripcion}</span>
              </span>
              <FlechaIcon className="h-5 w-5 flex-shrink-0 text-senales-bg" />
            </motion.button>
          ))}
        </motion.section>

        <motion.div
          {...riseIn(delayPasos + 0.05)}
          className="mt-5 flex items-start gap-3 rounded-xl bg-white/[0.04] px-4 py-3.5"
        >
          <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/50" />
          <p className="text-[13.5px] leading-[1.55] text-white/65">
            Estas señales son orientativas, no definitorias. Si sientes que necesitas apoyo, está
            bien buscarlo.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
