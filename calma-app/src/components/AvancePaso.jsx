import { motion } from 'framer-motion'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/ejercicios'

// Debajo de cada paso de un ejercicio guiado: una barra que se llena hasta el
// paso siguiente y cuántos segundos faltan.
export function AvancePaso({ progreso, restanteS, esUltimo }) {
  const t = useTextos(TEXTOS)
  return (
    <div className="mx-auto mb-6 max-w-[260px]">
      <div className="h-1 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-aire-accent"
          animate={{ width: `${progreso * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums text-cielo/55">
        {esUltimo ? t.terminaEn(restanteS) : t.sigueEn(restanteS)}
      </p>
    </div>
  )
}

// Al terminar el último paso
export function CierreEjercicio({ texto, onFinalizar }) {
  const t = useTextos(TEXTOS)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <h2 className="mb-2 text-2xl font-semibold text-cielo">{t.bienHecho}</h2>
      <p className="mx-auto mb-8 max-w-[380px] text-sm leading-[1.55] text-cielo/80">{texto}</p>
      <button
        type="button"
        onClick={onFinalizar}
        className="rounded-full bg-white px-10 py-4 text-[15.5px] font-bold text-brand-navy shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
      >
        {t.finalizar}
      </button>
    </motion.div>
  )
}
