import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/islaNoche.css'
import Accordion from '../components/Accordion'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import {
  CorazonIcon,
  CuerpoIcon,
  FlechaIcon,
  MensajeIcon,
  MenteIcon,
  OjoIcon,
  TelefonoIcon,
} from '../components/Iconos'
import { riseIn } from '../animations/transitions'
import { useAuth } from '../context/AuthContext'
import { getContactos, normalizarTelefono } from '../utils/contactosStorage'
import { construirLinkWhatsApp } from '../utils/compartirUbicacion'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/panelAcompanamiento'

// Títulos y listas en i18n/textos/panelAcompanamiento.js, en el mismo orden.
const CATEGORIAS = [
  { id: 'emocionales', Icon: CorazonIcon },
  { id: 'fisicas', Icon: CuerpoIcon },
  { id: 'cognitivas', Icon: MenteIcon },
  { id: 'conductuales', Icon: OjoIcon },
]

// TODO: poblar dinámicamente desde el Faro de la persona acompañada en vez de hardcodear
const ICONOS_HERRAMIENTAS = ['🎵', '🚶', '📞', '🫁']

const GUIA_LISTAS = [
  { id: 'principios', marcador: 'marker:text-acomp-1' },
  { id: 'como-acompanar', marcador: 'marker:text-acomp-1' },
  { id: 'que-evitar', marcador: 'marker:text-faro-2' },
]

const botonClaroClass =
  'rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/40'
const botonSecundarioClass =
  'rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-cielo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/30'

function inicialesDe(nombre) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  return partes.slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? '').join('') || '?'
}

// Pestañas: "Ahora" junta lo que se necesita en el momento (contactar y qué
// decir); "Señales" y "Guía" son para leer con calma.
const PESTANAS = [{ id: 'ahora' }, { id: 'senales' }, { id: 'guia' }]

export default function PanelAcompanamiento() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [abierto, setAbierto] = useState('emocionales')
  const [pestana, setPestana] = useState('ahora')
  const pestanasRef = useRef({})
  const t = useTextos(TEXTOS)
  const categorias = CATEGORIAS.map((categoria, index) => ({ ...categoria, ...t.categorias[index] }))
  const guiaListas = GUIA_LISTAS.map((seccion, index) => ({ ...seccion, ...t.guia[index] }))

  // Patrón de pestañas accesible: flechas, Inicio y Fin mueven la selección.
  const alTeclearPestana = (evento) => {
    const indice = PESTANAS.findIndex((p) => p.id === pestana)
    const destino = {
      ArrowRight: (indice + 1) % PESTANAS.length,
      ArrowLeft: (indice - 1 + PESTANAS.length) % PESTANAS.length,
      Home: 0,
      End: PESTANAS.length - 1,
    }[evento.key]
    if (destino === undefined) return
    evento.preventDefault()
    const id = PESTANAS[destino].id
    setPestana(id)
    pestanasRef.current[id]?.focus()
  }
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  // 'cargando' | 'sin-sesion' | 'sin-contacto' | 'error' | 'listo'
  const [cargaEstado, setCargaEstado] = useState('cargando')
  const [contactos, setContactos] = useState([])

  // null | 'sin-codigo-pais' (WhatsApp necesita el código de país)
  const [accionEstado, setAccionEstado] = useState(null)
  const [contactoProblema, setContactoProblema] = useState(null)

  // Esta pantalla es de acceso libre (no está detrás de RequireAuth, a
  // diferencia de IslaAuxilio), así que sin sesión getContactos() siempre
  // falla por falta de autenticación — se evita esa llamada y se distingue
  // ese caso de un error de red real, que sí amerita "Reintentar".
  const cargarContactos = async () => {
    if (!user) {
      setCargaEstado('sin-sesion')
      return
    }
    setCargaEstado('cargando')
    try {
      const data = await getContactos()
      setContactos(data)
      setCargaEstado(data.length === 0 ? 'sin-contacto' : 'listo')
    } catch {
      setCargaEstado('error')
    }
  }

  useEffect(() => {
    if (authLoading) return
    cargarContactos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  useEffect(() => {
    return () => clearTimeout(toastTimeoutRef.current)
  }, [])

  const showToast = (mensaje, duracion = 2000) => {
    setToast(mensaje)
    clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), duracion)
  }

  // Solo una sección abierta a la vez: abrir otra cierra la anterior.
  const toggleAcordeon = (id) => {
    setAbierto((actual) => (actual === id ? null : id))
  }

  const copiarMensaje = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // clipboard API puede no estar disponible/permitida; se ignora silenciosamente
    }
    showToast(t.copiado, 1500)
  }

  // `from`: la Isla del Auxilio usa este origen en su "Volver", así quien
  // acompaña regresa al Panel y no a las islas de "Necesito ayuda".
  const irAContactos = () => {
    navigate('/islas/auxilio', { state: { from: location.pathname } })
  }

  const irAIniciarSesion = () => {
    navigate('/login', { state: { from: location.pathname } })
  }

  const cerrarPanelAccion = () => {
    setAccionEstado(null)
    setContactoProblema(null)
  }

  const irAAgregarContacto = () => {
    cerrarPanelAccion()
    irAContactos()
  }

  const escribirPorWhatsApp = (contacto) => {
    if (!contacto.telefono.trim().startsWith('+')) {
      setContactoProblema(contacto)
      setAccionEstado('sin-codigo-pais')
      return
    }
    cerrarPanelAccion()
    window.location.href = construirLinkWhatsApp(contacto.telefono, '')
  }

  let delay = 0
  const nextDelay = () => {
    const current = delay
    delay += 0.05
    return current
  }

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      {/* luz verde-azul: el color de acompañamiento */}
      <div className="isla-resplandor isla-resplandor--acomp pointer-events-none absolute inset-x-0 top-0 h-[55vh]" aria-hidden="true" />
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/elegir" accountButtonClassName="bg-white/20 text-cielo" />

        <motion.div {...riseIn(nextDelay())} className="mb-6">
          <h1 className="text-[30px] font-semibold leading-tight text-cielo">{t.titulo}</h1>
          <p className="mt-1.5 text-[15px] text-cielo/75">{t.subtitulo}</p>
        </motion.div>

        <motion.div
          {...riseIn(nextDelay())}
          role="tablist"
          aria-label={t.seccionesPanel}
          onKeyDown={alTeclearPestana}
          className="mb-6 flex rounded-full border border-cielo/15 bg-white/[0.06] p-1"
        >
          {PESTANAS.map((p, index) => {
            const activa = pestana === p.id
            return (
              <button
                key={p.id}
                ref={(el) => (pestanasRef.current[p.id] = el)}
                type="button"
                role="tab"
                id={`panel-pestana-${p.id}`}
                aria-selected={activa}
                aria-controls={`panel-contenido-${p.id}`}
                tabIndex={activa ? 0 : -1}
                onClick={() => setPestana(p.id)}
                className={`flex-1 rounded-full py-2.5 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/30 ${
                  activa ? 'bg-white text-brand-navyDeep' : 'text-cielo/75'
                }`}
              >
                {t.pestanas[index]}
              </button>
            )
          })}
        </motion.div>

        <div
          role="tabpanel"
          id="panel-contenido-ahora"
          aria-labelledby="panel-pestana-ahora"
          hidden={pestana !== 'ahora'}
        >
        {/* Contactar va primero: en un momento difícil es lo que más urge */}
        <motion.section
          {...riseIn(nextDelay())}
          aria-labelledby="panel-tu-persona"
          className="mb-8 rounded-xl border border-acomp-1/30 bg-acomp-1/[0.1] p-4"
        >
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="panel-tu-persona" className="text-[17px] font-semibold text-cielo">
              {t.tuPersona}
            </h2>
            {cargaEstado === 'listo' && (
              <button
                type="button"
                onClick={irAContactos}
                className="inline-flex items-center gap-1 text-sm font-semibold text-cielo underline decoration-cielo/50 underline-offset-4"
              >
                {t.editarContactos}
                <FlechaIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {cargaEstado === 'cargando' && (
            <div className="flex justify-center py-3">
              <span
                aria-hidden="true"
                className="h-7 w-7 animate-spin rounded-full border-2 border-cielo/20 border-t-cielo/80"
              />
            </div>
          )}

          {cargaEstado === 'sin-sesion' && (
            <div className="text-center">
              <p className="mb-3 text-sm text-cielo/75">
                {t.sinSesion}
              </p>
              <button type="button" onClick={irAIniciarSesion} className={botonClaroClass}>
                {t.iniciarSesion}
              </button>
            </div>
          )}

          {cargaEstado === 'sin-contacto' && (
            <div className="text-center">
              <p className="mb-3 text-sm text-cielo/75">{t.sinContacto}</p>
              <button type="button" onClick={irAContactos} className={botonClaroClass}>
                {t.agregarContacto}
              </button>
            </div>
          )}

          {cargaEstado === 'error' && (
            <div className="text-center">
              <p className="mb-3 text-sm text-cielo/75">
                {t.errorCarga}
              </p>
              <button type="button" onClick={cargarContactos} className={botonClaroClass}>
                {t.reintentar}
              </button>
            </div>
          )}

          {/* Cada contacto a la vista: se ve a quién se llama o se escribe */}
          {cargaEstado === 'listo' && (
            <ul className="flex flex-col gap-2.5">
              {contactos.map((contacto) => (
                <li key={contacto.id} className="flex items-center gap-3 rounded-xl bg-white/[0.08] py-2.5 pl-3 pr-2.5">
                  <span
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-acomp-1/25 text-[15px] font-bold text-cielo"
                    aria-hidden="true"
                  >
                    {inicialesDe(contacto.nombre)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15.5px] font-semibold text-cielo">
                    {contacto.nombre}
                  </span>
                  <a
                    href={`tel:${normalizarTelefono(contacto.telefono)}`}
                    aria-label={t.llamarA(contacto.nombre)}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-acomp-2 text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-acomp-2/50"
                  >
                    <TelefonoIcon className="h-5 w-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => escribirPorWhatsApp(contacto)}
                    aria-label={t.escribirA(contacto.nombre)}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-acomp-1 text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-acomp-1/50"
                  >
                    <MensajeIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {accionEstado === 'sin-codigo-pais' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="mb-3 text-sm text-cielo/75">
                {t.sinCodigoPais(contactoProblema?.nombre)}
              </p>
              <div className="flex justify-center gap-2">
                <button type="button" onClick={irAAgregarContacto} className={botonClaroClass}>
                  {t.editarContacto}
                </button>
                <button type="button" onClick={cerrarPanelAccion} className={botonSecundarioClass}>
                  {t.cancelar}
                </button>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Qué decir: a la vista, sin acordeón; tocar copia el mensaje */}
        <section aria-labelledby="panel-que-decir">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="panel-que-decir" className="text-[17px] font-semibold text-cielo">
              {t.queDecir}
            </h2>
            <span className="text-xs font-semibold text-cielo/55">{t.tocaParaCopiar}</span>
          </div>
          <div className="flex flex-col gap-2">
            {t.mensajes.map((mensaje) => (
              <button
                key={mensaje}
                type="button"
                onClick={() => copiarMensaje(mensaje)}
                aria-label={t.copiar(mensaje)}
                className="rounded-2xl border border-cielo/10 bg-white/[0.06] px-4 py-3 text-left text-[14px] italic text-cielo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/30"
              >
                "{mensaje}"
              </button>
            ))}
          </div>
        </section>
        </div>

        <div
          role="tabpanel"
          id="panel-contenido-senales"
          aria-labelledby="panel-pestana-senales"
          hidden={pestana !== 'senales'}
        >
        <motion.div {...riseIn(nextDelay())} className="mb-4">
          <h2 className="mb-1.5 text-[17px] font-semibold text-cielo">{t.entenderSenales}</h2>
          <p className="text-[13.5px] leading-[1.55] text-cielo/70">
            {t.entenderSenalesIntro}
          </p>
        </motion.div>

        {categorias.map((categoria) => (
          <Accordion
            key={categoria.id}
            id={`panel-${categoria.id}`}
            Icon={categoria.Icon}
            titulo={categoria.titulo}
            detalle={t.cuantas(categoria.senales.length)}
            abierto={abierto === categoria.id}
            onToggle={() => toggleAcordeon(categoria.id)}
            delay={nextDelay()}
            acento="acomp"
          >
            <ul className="flex flex-wrap gap-2">
              {categoria.senales.map((senal) => (
                <li
                  key={senal}
                  className="rounded-full border border-acomp-1/30 bg-acomp-1/[0.14] px-3.5 py-1.5 text-[13.5px] text-acomp-bg"
                >
                  {senal}
                </li>
              ))}
            </ul>
          </Accordion>
        ))}

        </div>

        <div
          role="tabpanel"
          id="panel-contenido-guia"
          aria-labelledby="panel-pestana-guia"
          hidden={pestana !== 'guia'}
        >

        {guiaListas.map((seccion) => (
          <Accordion
            key={seccion.id}
            id={`panel-${seccion.id}`}
            titulo={seccion.titulo}
            abierto={abierto === seccion.id}
            onToggle={() => toggleAcordeon(seccion.id)}
            delay={nextDelay()}
            acento="acomp"
          >
            {seccion.subtitulo && (
              <p className="mb-3 text-xs italic text-cielo/60">{seccion.subtitulo}</p>
            )}
            <ul className={`list-disc space-y-2 pl-5 text-[13.5px] leading-[1.6] text-cielo/80 ${seccion.marcador}`}>
              {seccion.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Accordion>
        ))}

        <Accordion
          id="panel-herramientas"
          titulo={t.herramientasTitulo}
          abierto={abierto === 'herramientas'}
          onToggle={() => toggleAcordeon('herramientas')}
          delay={nextDelay()}
          acento="acomp"
        >
          <p className="mb-3 text-xs text-cielo/60">
            {t.herramientasIntro}
          </p>
          <ul className="flex flex-col gap-2">
            {t.herramientas.map((label, index) => (
              <li
                key={label}
                className="rounded-2xl bg-white/10 px-4 py-3 text-[13.5px] text-cielo"
              >
                <span aria-hidden="true">{ICONOS_HERRAMIENTAS[index]}</span> {label}
              </li>
            ))}
          </ul>
        </Accordion>
        </div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-[calc(2rem+env(safe-area-inset-bottom))] z-50 flex transform-gpu justify-center px-5"
        >
          {/* sobre la noche un toast oscuro se pierde */}
          <div className="rounded-full bg-white px-5 py-3 text-sm font-medium text-ink shadow-lg">
            {toast}
          </div>
        </motion.div>
      )}
    </div>
  )
}
