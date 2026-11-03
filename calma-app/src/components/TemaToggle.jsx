import { AnimatePresence, motion } from 'framer-motion'
import { usePreferencias } from '../context/PreferenciasContext'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/comun'
import { LunaIcon, SolIcon } from './Iconos'

// Botón redondo junto al de la cuenta: alterna entre la noche y el amanecer.
// Muestra el tema al que se pasa (sol de noche, luna de día).
export default function TemaToggle({ className = 'bg-white/20 text-cielo' }) {
  const { tema, alternarTema } = usePreferencias()
  const t = useTextos(TEXTOS)
  const deNoche = tema === 'noche'

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={deNoche ? t.temaADia : t.temaANoche}
      title={deNoche ? t.temaADia : t.temaANoche}
      className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-faro-2/70 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={tema}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          className="flex"
        >
          {deNoche ? <SolIcon className="h-5 w-5" /> : <LunaIcon className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
