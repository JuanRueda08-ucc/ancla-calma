import { AnimatePresence, motion } from 'framer-motion'
import { riseIn } from '../animations/transitions'

export default function Accordion({
  icono,
  iconBg,
  titulo,
  items,
  abierto,
  onToggle,
  delay = 0,
  pillBg = 'bg-acomp-bg',
  pillText = 'text-[#175C4A]',
}) {
  return (
    <motion.div
      {...riseIn(delay)}
      className="mb-3 overflow-hidden rounded-[22px] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="flex w-full items-center gap-3.5 px-[18px] py-4 text-left"
      >
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xl"
          style={{ background: iconBg }}
        >
          {icono}
        </span>
        <span className="flex-1 text-[15px] font-bold text-ink">{titulo}</span>
        <span className="whitespace-nowrap text-xs font-semibold text-ink-soft">
          {items.length} señales
        </span>
        <motion.span
          animate={{ rotate: abierto ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#B7B0A4]"
        >
          ⌄
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-[18px] pb-4 pl-[68px]">
              {items.map((item) => (
                <div key={item} className={`rounded-[14px] px-3.5 py-2.5 text-[13.5px] ${pillBg} ${pillText}`}>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
