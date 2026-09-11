import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'

const CORREO_CONTACTO = 'juanjoruedav@gmail.com'

function CorreoContacto() {
  return (
    <a href={`mailto:${CORREO_CONTACTO}`} className="font-semibold text-brand-navy">
      {CORREO_CONTACTO}
    </a>
  )
}

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-sand-deep">
      <div className="mx-auto max-w-[620px] px-6 py-10">
        <BackButton to="/registro" />

        <motion.div
          {...riseIn(0)}
          className="rounded-lg bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.06)] sm:p-8"
        >
          <h1 className="mb-1.5 text-[22px] font-semibold text-ink">Política de privacidad</h1>
          <p className="mb-6 text-sm text-ink-soft/70">
            Última actualización: 10 de septiembre de 2026
          </p>

          <div className="mx-auto max-w-[52ch] space-y-7 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Esta política describe qué información recoge Calma (Proyecto ANCLA), para qué la
              usa, y qué derechos tienes sobre ella. Está escrita para ser honesta sobre lo que la
              app realmente hace, no un texto genérico.
            </p>

            <section>
              <h2 className="mb-2 text-[17px] font-semibold text-ink">
                Quién es responsable de tus datos
              </h2>
              <p>
                Calma es desarrollada por Juan José Rueda Viveros, como parte del Proyecto ANCLA. Si
                tienes preguntas sobre tus datos, escribe a: <CorreoContacto />
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-[17px] font-semibold text-ink">Qué información recogemos</h2>
              <div className="space-y-3">
                <p>
                  <strong className="text-ink">Cuenta</strong>: tu correo electrónico, usado
                  únicamente para iniciar sesión y confirmar tu identidad.
                </p>
                <p>
                  <strong className="text-ink">Contactos de confianza</strong>: el nombre y
                  teléfono de las personas que decidas agregar. Solo se usan para que tú puedas
                  llamarlas o compartirles tu ubicación por WhatsApp — nunca se comparten con
                  nadie más ni se usan para ningún otro fin.
                </p>
                <p>
                  <strong className="text-ink">Bitácora emocional</strong>: las emociones que
                  selecciones, el texto que escribas (en tus propias palabras o por transcripción
                  de voz), y si grabaste una nota de voz, el audio de esa nota.
                </p>
                <p>
                  <strong className="text-ink">Transcripción por voz</strong>: el botón de
                  micrófono en cada pregunta de la bitácora usa la función de reconocimiento de
                  voz de tu propio navegador (no un servicio nuestro). Esto significa que,
                  dependiendo de qué navegador uses, el audio de tu voz se procesa en los
                  servidores de Google (Chrome, Edge) o Apple (Safari) para convertirlo a texto,
                  antes de devolvértelo. No tenemos control sobre ese procesamiento ni acceso a
                  él — ocurre entre tu navegador y esas empresas. Si prefieres no usar esta
                  función, puedes escribir directamente en cada campo sin usar el micrófono.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[17px] font-semibold text-ink">
                Qué NO recogemos ni guardamos
              </h2>
              <div className="space-y-3">
                <p>
                  <strong className="text-ink">Tu ubicación nunca se guarda.</strong> Cuando usas
                  "Compartir mi ubicación", la calculamos una sola vez, armamos el link para
                  enviarte a WhatsApp, y la descartamos de inmediato — no queda registrada en
                  ningún lugar, ni en tu dispositivo ni en nuestros servidores.
                </p>
                <p>
                  No mostramos publicidad ni vendemos, alquilamos o compartimos tu información con
                  terceros con fines comerciales.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[17px] font-semibold text-ink">
                Dónde se almacena tu información
              </h2>
              <div className="space-y-3">
                <p>
                  Tus datos (contactos, entradas de bitácora, audio de notas de voz) se guardan en
                  Supabase, un proveedor de base de datos con seguridad a nivel de fila (Row Level
                  Security): esto significa que, técnicamente, solo tu cuenta puede leer o
                  modificar tus propios datos — ni siquiera otro usuario de Calma puede acceder a
                  ellos.
                </p>
                <p>
                  Tu sesión de acceso se guarda en el almacenamiento local de tu navegador, para
                  que no tengas que iniciar sesión cada vez que abres la app.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[17px] font-semibold text-ink">
                Tus derechos sobre tu información
              </h2>
              <p className="mb-3">
                De acuerdo con la Ley 1581 de 2012 (Habeas Data, Colombia), tienes derecho a
                conocer, actualizar, corregir y solicitar la eliminación de tu información
                personal.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-ink">
                    Contactos de confianza y entradas de tu bitácora
                  </strong>
                  : puedes eliminarlos individualmente en cualquier momento, directamente desde la
                  app (Isla del Auxilio y tu Historial, respectivamente).
                </li>
                <li>
                  <strong className="text-ink">Eliminar tu cuenta por completo</strong>: por ahora
                  esto no es autogestionable desde la app — escríbenos a <CorreoContacto />{' '}
                  solicitando la eliminación, y procesaremos tu solicitud manualmente.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-[17px] font-semibold text-ink">Cambios a esta política</h2>
              <p>
                Si esta política cambia de forma importante, lo indicaremos actualizando la fecha
                al inicio de este documento.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
