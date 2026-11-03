import { motion } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { riseIn } from '../animations/transitions'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/privacidad'

const CORREO_CONTACTO = 'juanjoruedav@gmail.com'

function CorreoContacto() {
  return (
    <a href={`mailto:${CORREO_CONTACTO}`} className="font-semibold text-brand-navy">
      {CORREO_CONTACTO}
    </a>
  )
}

// Párrafo con su inicio en negrita (si lo tiene)
function Bloque({ fuerte, texto }) {
  return (
    <>
      {fuerte && <strong className="text-ink">{fuerte}</strong>}
      {texto}
    </>
  )
}

export default function Privacidad() {
  const t = useTextos(TEXTOS)

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-16 pt-10">
        <ScreenHeader backTo="/registro" showAccount={false} />

        {/* El texto legal va en una hoja blanca sobre la noche, como la
            Bitácora: se lee mejor en bloques largos. */}
        <motion.div
          {...riseIn(0)}
          className="rounded-lg bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.12)] sm:p-8"
        >
          <h1 className="mb-1.5 text-[22px] font-semibold text-ink">{t.titulo}</h1>
          <p className="mb-6 text-sm text-ink-soft/70">{t.actualizacion}</p>

          <div className="mx-auto max-w-[52ch] space-y-7 text-[15px] leading-relaxed text-ink-soft">
            {t.notaTraduccion && (
              <p className="rounded-lg bg-sand-deep px-4 py-3 text-sm text-ink">{t.notaTraduccion}</p>
            )}

            <p>{t.intro}</p>

            <section>
              <h2 className="mb-2 text-[17px] font-semibold text-ink">{t.responsableTitulo}</h2>
              <p>
                {t.responsableTexto} <CorreoContacto />
              </p>
            </section>

            {t.secciones.map((seccion) => (
              <section key={seccion.titulo}>
                <h2 className="mb-3 text-[17px] font-semibold text-ink">{seccion.titulo}</h2>
                <div className="space-y-3">
                  {seccion.bloques.map((bloque) => (
                    <p key={bloque.texto}>
                      <Bloque {...bloque} />
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section>
              <h2 className="mb-3 text-[17px] font-semibold text-ink">{t.derechosTitulo}</h2>
              <p className="mb-3">{t.derechosIntro}</p>
              <ul className="list-disc space-y-2 pl-5">
                {t.derechos.map((derecho) => (
                  <li key={derecho.fuerte}>
                    <Bloque {...derecho} />
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-[17px] font-semibold text-ink">{t.cambiosTitulo}</h2>
              <p>{t.cambiosTexto}</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
