import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/elegirCamino.css'
import { riseIn } from '../animations/transitions'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { usePreferencias } from '../context/PreferenciasContext'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/elegirIdioma'
import { useVolverA } from '../utils/useVolverA'

// Cada opción se escribe en su propio idioma, para que se reconozca sin
// entender el otro.
const OPCIONES = [
  { idioma: 'es', nombre: 'Español', detalle: 'Continuar en español', sigla: 'ES' },
  { idioma: 'en', nombre: 'English', detalle: 'Continue in English', sigla: 'EN' },
]

// Se muestra la primera vez, después de "Comenzar" en Entrada, y cuando la
// persona elige "Cambiar idioma" en el menú de cuenta (con `from` para volver
// a esa pantalla). Nunca se interpone frente a las herramientas de calma:
// quien entra directo a una isla la ve en español y puede cambiarlo después.
export default function ElegirIdioma() {
  const navigate = useNavigate()
  const { idioma, idiomaElegido, elegirIdioma } = usePreferencias()
  const t = useTextos(TEXTOS)

  // Sin origen es la primera vez (vino de "Comenzar"): sigue a /elegir y
  // "Volver" regresa a Entrada.
  const origen = useVolverA(null)
  const destino = origen ?? '/elegir'

  const elegir = (nuevo) => {
    elegirIdioma(nuevo)
    navigate(destino, { replace: origen !== null })
  }

  return (
    <div className="elegir-bg relative min-h-[100dvh] overflow-hidden text-cielo">
      <StarField />

      <div className="relative z-[2] mx-auto flex min-h-[100dvh] max-w-[620px] flex-col px-6 pb-[18vh] pt-10">
        <ScreenHeader backTo={origen ?? '/'} accountButtonClassName="bg-white/20 text-cielo" showAccount={false} />

        <motion.div {...riseIn(0)} className="mb-8 mt-[3vh] sm:mb-10 sm:mt-[6vh]">
          <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">{t.titulo}</h1>
          <p className="mt-2 text-[17px] font-medium text-cielo/70" lang={idioma === 'es' ? 'en' : 'es'}>
            {t.subtitulo}
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {OPCIONES.map((opcion, index) => {
            const actual = idiomaElegido && opcion.idioma === idioma
            return (
              <motion.button
                key={opcion.idioma}
                {...riseIn(0.15 + 0.1 * index)}
                type="button"
                lang={opcion.idioma}
                onClick={() => elegir(opcion.idioma)}
                whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
                aria-current={actual ? 'true' : undefined}
                className={`flex w-full items-center gap-4 rounded-xl border px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-faro-2/70 ${
                  actual ? 'border-faro-2/70 bg-white/15' : 'border-cielo/15 bg-white/[0.08]'
                }`}
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-auxilio-1 to-faro-1 text-[15px] font-bold tracking-wide text-brand-navyDeep">
                  {opcion.sigla}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[20px] font-semibold leading-tight">{opcion.nombre}</span>
                  <span className="mt-0.5 block text-[13.5px] text-cielo/65">{opcion.detalle}</span>
                </span>
                {actual && (
                  <span className="whitespace-nowrap rounded-full bg-faro-2/25 px-3 py-1 text-xs font-semibold text-cielo">
                    {t.actual}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        <motion.p {...riseIn(0.4)} className="mt-6 text-[13px] text-cielo/60">
          {t.nota}
        </motion.p>
      </div>
    </div>
  )
}
