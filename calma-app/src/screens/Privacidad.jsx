import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { riseIn } from '../animations/transitions'

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-sand-deep">
      <div className="mx-auto max-w-[620px] px-6 py-12">
        <motion.div {...riseIn(0)} className="rounded-lg bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
          <h1 className="mb-3 text-[22px] font-semibold text-ink">Política de privacidad</h1>
          <p className="text-sm leading-relaxed text-ink-soft">
            Este es un texto placeholder. El contenido legal completo de esta política —
            incluyendo el tratamiento de datos personales conforme a la Ley 1581 de 2012
            (Habeas Data) — será redactado por una persona con criterio legal antes de
            lanzar la aplicación a producción real.
          </p>
        </motion.div>

        <motion.div {...riseIn(0.1)} className="mt-6 text-center">
          <Link to="/registro" className="text-sm font-semibold text-brand-navy">
            ← Volver a registro
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
