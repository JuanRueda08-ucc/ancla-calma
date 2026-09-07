import { useState } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import Accordion from '../components/Accordion'
import { riseIn } from '../animations/transitions'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'

const CATEGORIAS = [
  {
    id: 'emocionales',
    icono: '❤️',
    iconBg: '#FDEAF0',
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
    icono: '🧍',
    iconBg: '#EAF2FD',
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
    icono: '🧠',
    iconBg: '#F3EAFD',
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
    icono: '👁️',
    iconBg: '#FFF8EA',
    titulo: 'Señales conductuales',
    senales: [
      'Aislamiento',
      'Evitar actividades',
      'Dificultad para comunicarse',
      'Cambios en rutinas',
    ],
  },
]

export default function IslaSenales() {
  const [abiertos, setAbiertos] = useState(new Set(['emocionales']))

  const toggleAcordeon = (id) => {
    setAbiertos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-senales-bg">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/islas" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center bg-white text-[26px]"
            style={{ borderRadius: BLOB_RADIUS }}
          >
            👁️
          </div>
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Isla de las Señales</h1>
          <p className="text-sm text-ink-soft">Reconoce las señales de malestar emocional</p>
        </motion.div>

        <motion.div
          {...riseIn(0.08)}
          className="mb-6 rounded-[20px] bg-white px-5 py-4 text-[13.5px] leading-[1.55] text-ink-soft shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
        >
          Cada persona vive los momentos difíciles de manera distinta. Estas pueden ser algunas
          señales de que podrías necesitar apoyo o acompañamiento.
        </motion.div>

        {CATEGORIAS.map((categoria, index) => (
          <Accordion
            key={categoria.id}
            icono={categoria.icono}
            iconBg={categoria.iconBg}
            titulo={categoria.titulo}
            items={categoria.senales}
            abierto={abiertos.has(categoria.id)}
            onToggle={() => toggleAcordeon(categoria.id)}
            delay={0.14 + index * 0.05}
          />
        ))}

        <motion.div
          {...riseIn(0.14 + CATEGORIAS.length * 0.05)}
          className="mt-4 flex items-start gap-3 rounded-[20px] bg-sand-deep px-5 py-4"
        >
          <span className="text-xl">🛡️</span>
          <p className="text-[13.5px] leading-[1.55] text-ink-soft">
            Estas señales son orientativas, no definitorias. Si sientes que necesitas apoyo, está
            bien buscarlo.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
