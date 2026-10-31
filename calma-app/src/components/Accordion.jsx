import { AnimatePresence, motion } from 'framer-motion'
import { riseIn } from '../animations/transitions'
import { ChevronIcon } from './Iconos'

// Acordeón translúcido para las pantallas nocturnas (Isla de las Señales y
// Panel de Acompañamiento). El contenido va como children; `acento` define
// el color del ícono y del anillo de foco con clases fijas de Tailwind.
const ACENTOS = {
  senales: {
    icono: 'bg-senales-1/20 text-senales-bg',
    foco: 'focus-visible:ring-senales-1/60',
  },
  acomp: {
    icono: 'bg-acomp-1/20 text-acomp-bg',
    foco: 'focus-visible:ring-acomp-1/60',
  },
}

export default function Accordion({
  id,
  Icon,
  titulo,
  detalle,
  abierto,
  onToggle,
  delay = 0,
  acento = 'senales',
  children,
}) {
  const estilos = ACENTOS[acento]
  const panelId = `acordeon-${id}`

  return (
    <motion.div
      {...riseIn(delay)}
      className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        aria-controls={panelId}
        className={`flex w-full items-center gap-3.5 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset ${estilos.foco}`}
      >
        {Icon && (
          <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${estilos.icono}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <span className="flex-1 text-[15px] font-semibold text-white">{titulo}</span>
        {detalle && (
          <span className="whitespace-nowrap text-xs font-semibold text-white/55">{detalle}</span>
        )}
        <motion.span
          animate={{ rotate: abierto ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/50"
        >
          <ChevronIcon className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            id={panelId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 ${Icon ? 'pl-[74px]' : ''}`}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
