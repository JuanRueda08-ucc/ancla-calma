import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { CorazonIcon, CuerpoIcon, FlechaIcon, InfoIcon, MenteIcon, OjoIcon } from '../components/Iconos'
import { riseIn } from '../animations/transitions'
import { conOrigen } from '../utils/useVolverA'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/islaSenales'

// Títulos, nombre corto de la ficha y señales en i18n/textos/islaSenales.js
// (mismo orden).
const CATEGORIAS = [
  { id: 'emocionales', Icon: CorazonIcon },
  { id: 'fisicas', Icon: CuerpoIcon },
  { id: 'cognitivas', Icon: MenteIcon },
  { id: 'conductuales', Icon: OjoIcon },
]

const SIGUIENTES_PASOS = ['/islas/aire/respiracion', '/islas/auxilio']

export default function IslaSenales() {
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTextos(TEXTOS)
  const categorias = CATEGORIAS.map((categoria, index) => ({ ...categoria, ...t.categorias[index] }))
  const pasos = SIGUIENTES_PASOS.map((to, index) => ({ to, ...t.pasos[index] }))
  // Mosaico: siempre hay una categoría seleccionada y sus señales se ven abajo.
  const [seleccionada, setSeleccionada] = useState(CATEGORIAS[0].id)
  const actual = categorias.find((categoria) => categoria.id === seleccionada)

  const delayPasos = 0.24

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      {/* luz menta: es la isla de las señales */}
      <div className="isla-resplandor isla-resplandor--senales pointer-events-none absolute inset-x-0 top-0 h-[55vh]" aria-hidden="true" />
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/islas" accountButtonClassName="bg-white/20 text-cielo" />

        <motion.div {...riseIn(0)} className="mb-6">
          <h1 className="text-[30px] font-semibold leading-tight text-cielo">{t.titulo}</h1>
          <p className="mt-1.5 text-[15px] text-cielo/75">{t.subtitulo}</p>
        </motion.div>

        <motion.p {...riseIn(0.08)} className="mb-6 text-[14px] leading-[1.6] text-cielo/70">
          {t.intro}
        </motion.p>

        {/* Mosaico 2x2: una ficha por categoría */}
        <motion.div {...riseIn(0.14)} className="mb-4 grid grid-cols-2 gap-3">
          {categorias.map((categoria) => {
            const activa = seleccionada === categoria.id
            const { Icon } = categoria
            return (
              <button
                key={categoria.id}
                type="button"
                onClick={() => setSeleccionada(categoria.id)}
                aria-pressed={activa}
                aria-controls="senales-detalle"
                className={`flex min-h-[112px] flex-col items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-senales-1/60 ${
                  activa ? 'border-senales-1/70 bg-senales-1/[0.24]' : 'border-cielo/10 bg-white/[0.06]'
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-senales-1/20 text-senales-bg">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-cielo">{categoria.corto}</span>
                  <span className="block text-xs text-cielo/60">{t.cuantas(categoria.senales.length)}</span>
                </span>
              </button>
            )
          })}
        </motion.div>

        {/* Señales de la ficha elegida; aria-live anuncia el cambio */}
        <motion.section
          {...riseIn(0.2)}
          id="senales-detalle"
          aria-live="polite"
          aria-labelledby="senales-detalle-titulo"
          className="rounded-xl border border-senales-1/30 bg-senales-1/[0.08] p-4"
        >
          <h2 id="senales-detalle-titulo" className="mb-3 text-[15px] font-semibold text-cielo">
            {actual.titulo}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {actual.senales.map((senal) => (
              <li
                key={senal}
                className="rounded-full border border-senales-1/30 bg-senales-1/[0.14] px-3.5 py-1.5 text-[13.5px] text-senales-bg"
              >
                {senal}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* la información lleva a una acción: respirar o pedir apoyo */}
        <motion.section {...riseIn(delayPasos)} className="mt-8">
          <h2 className="mb-3 text-[17px] font-semibold text-cielo">{t.teReconoces}</h2>
          {pasos.map((paso) => (
            <motion.button
              key={paso.to}
              type="button"
              onClick={() => navigate(paso.to, conOrigen(location))}
              whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
              className="mb-3 flex w-full items-center gap-4 rounded-xl border border-senales-1/35 bg-senales-1/[0.12] p-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-senales-1/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-cielo">{paso.titulo}</span>
                <span className="block text-[13px] text-cielo/65">{paso.descripcion}</span>
              </span>
              <FlechaIcon className="h-5 w-5 flex-shrink-0 text-senales-bg" />
            </motion.button>
          ))}
        </motion.section>

        <motion.div
          {...riseIn(delayPasos + 0.05)}
          className="mt-5 flex items-start gap-3 rounded-xl bg-white/[0.04] px-4 py-3.5"
        >
          <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-cielo/50" />
          <p className="text-[13.5px] leading-[1.55] text-cielo/65">
            {t.aviso}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
