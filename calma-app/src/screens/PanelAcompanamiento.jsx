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

const CATEGORIAS = [
  {
    id: 'emocionales',
    Icon: CorazonIcon,
    titulo: 'Señales emocionales',
    senales: [
      'Expresiones de angustia o malestar',
      'Cambios en el tono emocional',
      'Irritabilidad o sensibilidad aumentada',
      'Retraimiento emocional',
    ],
  },
  {
    id: 'fisicas',
    Icon: CuerpoIcon,
    titulo: 'Señales físicas',
    senales: [
      'Tensión visible en el cuerpo',
      'Expresiones de cansancio',
      'Cambios en la respiración',
      'Inquietud o agitación',
    ],
  },
  {
    id: 'cognitivas',
    Icon: MenteIcon,
    titulo: 'Señales cognitivas',
    senales: [
      'Dificultad para seguir conversaciones',
      'Expresiones de confusión',
      'Preocupación evidente',
    ],
  },
  {
    id: 'conductuales',
    Icon: OjoIcon,
    titulo: 'Señales conductuales',
    senales: [
      'Evitación de interacciones',
      'Cambios en patrones habituales',
      'Dificultad para expresarse',
    ],
  },
]

const PRINCIPIOS_CLAVE = [
  'Escuchar sin asumir',
  'Evitar etiquetar',
  'Acompañar sin juzgar',
  'Preguntar antes de intervenir',
]

const COMO_ACOMPANAR = [
  'Escucha activamente sin interrumpir',
  'Valida sus emociones: "Es comprensible que te sientas así"',
  'Ofrece tu presencia: "Estoy aquí contigo"',
  'Pregunta: "¿Qué necesitas en este momento?"',
  'Respeta su ritmo y espacio',
]

const QUE_EVITAR = [
  'No minimices: evita "no es para tanto"',
  'No compares: "otros lo tienen peor"',
  'No des soluciones apresuradas',
  'No juzgues sus sentimientos',
  'No fuerces a hablar si no está listo/a',
]

const MENSAJES_RAPIDOS = [
  'Estoy aquí contigo.',
  '¿Quieres hablar?',
  '¿Cómo puedo ayudarte?',
  'Tómate el tiempo que necesites.',
  'No estás solo/a en esto.',
]

// TODO: poblar dinámicamente desde el Faro de la persona acompañada en vez de hardcodear
const HERRAMIENTAS_APOYO = [
  { icon: '🎵', label: 'Escuchar música tranquila' },
  { icon: '🚶', label: 'Dar un paseo' },
  { icon: '📞', label: 'Llamar a alguien de confianza' },
  { icon: '🫁', label: 'Respirar profundo' },
]

const GUIA_LISTAS = [
  { id: 'principios', titulo: 'Principios clave', items: PRINCIPIOS_CLAVE, marcador: 'marker:text-acomp-1' },
  {
    id: 'como-acompanar',
    titulo: 'Cómo acompañar',
    subtitulo: 'Principios de primeros auxilios psicológicos',
    items: COMO_ACOMPANAR,
    marcador: 'marker:text-acomp-1',
  },
  { id: 'que-evitar', titulo: 'Qué evitar', items: QUE_EVITAR, marcador: 'marker:text-faro-2' },
]

const botonClaroClass =
  'rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40'
const botonSecundarioClass =
  'rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30'

export default function PanelAcompanamiento() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [abierto, setAbierto] = useState('emocionales')
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  // 'cargando' | 'sin-sesion' | 'sin-contacto' | 'error' | 'listo'
  const [cargaEstado, setCargaEstado] = useState('cargando')
  const [contactos, setContactos] = useState([])

  // null | 'seleccion' | 'sin-codigo-pais'
  const [accionEstado, setAccionEstado] = useState(null)
  const [accionTipo, setAccionTipo] = useState(null) // 'llamar' | 'mensaje'
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
    showToast('Copiado', 1500)
  }

  const irAContactos = () => {
    navigate('/islas/auxilio')
  }

  const irAIniciarSesion = () => {
    navigate('/login', { state: { from: location.pathname } })
  }

  const cerrarPanelAccion = () => {
    setAccionEstado(null)
    setAccionTipo(null)
    setContactoProblema(null)
  }

  const irAAgregarContacto = () => {
    cerrarPanelAccion()
    navigate('/islas/auxilio')
  }

  const ejecutarAccion = (tipo, contacto) => {
    if (tipo === 'mensaje' && !contacto.telefono.trim().startsWith('+')) {
      setContactoProblema(contacto)
      setAccionEstado('sin-codigo-pais')
      return
    }

    if (tipo === 'llamar') {
      window.location.href = `tel:${normalizarTelefono(contacto.telefono)}`
    } else {
      window.location.href = construirLinkWhatsApp(contacto.telefono, '')
    }
    cerrarPanelAccion()
  }

  const iniciarAccion = (tipo) => {
    setAccionTipo(tipo)
    if (contactos.length === 1) {
      ejecutarAccion(tipo, contactos[0])
      return
    }
    setAccionEstado('seleccion')
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
        <ScreenHeader backTo="/elegir" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(nextDelay())} className="mb-6">
          <h1 className="text-[30px] font-semibold leading-tight text-white">Panel de Acompañamiento</h1>
          <p className="mt-1.5 text-[15px] text-white/75">Guía para apoyar a tu persona</p>
        </motion.div>

        {/* Contactar va primero: en un momento difícil es lo que más urge */}
        <motion.section
          {...riseIn(nextDelay())}
          aria-labelledby="panel-tu-persona"
          className="mb-10 rounded-xl border border-acomp-1/30 bg-acomp-1/[0.1] p-4"
        >
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="panel-tu-persona" className="text-[17px] font-semibold text-white">
              Tu persona
            </h2>
            {cargaEstado === 'listo' && (
              <button
                type="button"
                onClick={irAContactos}
                className="inline-flex items-center gap-1 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
              >
                Editar contactos
                <FlechaIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {cargaEstado === 'cargando' && (
            <div className="flex justify-center py-3">
              <span
                aria-hidden="true"
                className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white/80"
              />
            </div>
          )}

          {cargaEstado === 'sin-sesion' && (
            <div className="text-center">
              <p className="mb-3 text-sm text-white/75">
                Se requiere inicio de sesión para añadir contactos.
              </p>
              <button type="button" onClick={irAIniciarSesion} className={botonClaroClass}>
                Iniciar sesión
              </button>
            </div>
          )}

          {cargaEstado === 'sin-contacto' && (
            <div className="text-center">
              <p className="mb-3 text-sm text-white/75">Agrega un contacto de confianza</p>
              <button type="button" onClick={irAContactos} className={botonClaroClass}>
                Agregar contacto de confianza
              </button>
            </div>
          )}

          {cargaEstado === 'error' && (
            <div className="text-center">
              <p className="mb-3 text-sm text-white/75">
                No pudimos cargar tus contactos de confianza.
              </p>
              <button type="button" onClick={cargarContactos} className={botonClaroClass}>
                Reintentar
              </button>
            </div>
          )}

          {cargaEstado === 'listo' && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => iniciarAccion('llamar')}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-acomp-2 py-3.5 text-sm font-bold text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-acomp-2/50"
              >
                <TelefonoIcon className="h-[18px] w-[18px]" />
                Llamar
              </button>
              <button
                type="button"
                onClick={() => iniciarAccion('mensaje')}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-acomp-1 py-3.5 text-sm font-bold text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-acomp-1/50"
              >
                <MensajeIcon className="h-[18px] w-[18px]" />
                Mensaje
              </button>
            </div>
          )}

          {accionEstado === 'seleccion' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <p className="mb-3 text-sm font-semibold text-white">
                {accionTipo === 'llamar' ? '¿A quién quieres llamar?' : '¿A quién quieres escribirle?'}
              </p>
              <div className="flex flex-col gap-2">
                {contactos.map((contacto) => (
                  <button
                    key={contacto.id}
                    type="button"
                    onClick={() => ejecutarAccion(accionTipo, contacto)}
                    className="rounded-lg bg-white/10 px-4 py-2.5 text-left text-[14.5px] font-semibold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                  >
                    {contacto.nombre}
                  </button>
                ))}
              </div>
              <button type="button" onClick={cerrarPanelAccion} className={`mt-3 w-full ${botonSecundarioClass}`}>
                Cancelar
              </button>
            </motion.div>
          )}

          {accionEstado === 'sin-codigo-pais' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="mb-3 text-sm text-white/75">
                {contactoProblema?.nombre} no tiene código de país guardado. Edítalo primero para
                poder escribirle por WhatsApp.
              </p>
              <div className="flex justify-center gap-2">
                <button type="button" onClick={irAAgregarContacto} className={botonClaroClass}>
                  Editar contacto
                </button>
                <button type="button" onClick={cerrarPanelAccion} className={botonSecundarioClass}>
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </motion.section>

        <motion.div {...riseIn(nextDelay())} className="mb-4">
          <h2 className="mb-1.5 text-[17px] font-semibold text-white">Entender las señales</h2>
          <p className="text-[13.5px] leading-[1.55] text-white/70">
            No todas las personas expresan el malestar emocional de la misma manera. Estas son
            algunas posibles señales para acompañar desde la empatía y el cuidado.
          </p>
        </motion.div>

        {CATEGORIAS.map((categoria) => (
          <Accordion
            key={categoria.id}
            id={`panel-${categoria.id}`}
            Icon={categoria.Icon}
            titulo={categoria.titulo}
            detalle={`${categoria.senales.length} señales`}
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

        <motion.h2 {...riseIn(nextDelay())} className="mb-3 mt-8 text-[17px] font-semibold text-white">
          Cómo apoyar
        </motion.h2>

        {GUIA_LISTAS.map((seccion) => (
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
              <p className="mb-3 text-xs italic text-white/60">{seccion.subtitulo}</p>
            )}
            <ul className={`list-disc space-y-2 pl-5 text-[13.5px] leading-[1.6] text-white/80 ${seccion.marcador}`}>
              {seccion.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Accordion>
        ))}

        <Accordion
          id="panel-mensajes"
          titulo="Mensajes de apoyo rápido"
          detalle="Toca para copiar"
          abierto={abierto === 'mensajes'}
          onToggle={() => toggleAcordeon('mensajes')}
          delay={nextDelay()}
          acento="acomp"
        >
          <div className="flex flex-col gap-2">
            {MENSAJES_RAPIDOS.map((mensaje) => (
              <button
                key={mensaje}
                type="button"
                onClick={() => copiarMensaje(mensaje)}
                aria-label={`Copiar: ${mensaje}`}
                className="rounded-2xl bg-white/10 px-4 py-3 text-left text-[13.5px] italic text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                "{mensaje}"
              </button>
            ))}
          </div>
        </Accordion>

        <Accordion
          id="panel-herramientas"
          titulo="Herramientas de apoyo"
          abierto={abierto === 'herramientas'}
          onToggle={() => toggleAcordeon('herramientas')}
          delay={nextDelay()}
          acento="acomp"
        >
          <p className="mb-3 text-xs text-white/60">
            Estas son algunas herramientas que suelen ayudarle en momentos difíciles.
          </p>
          <ul className="flex flex-col gap-2">
            {HERRAMIENTAS_APOYO.map((herramienta) => (
              <li
                key={herramienta.label}
                className="rounded-2xl bg-white/10 px-4 py-3 text-[13.5px] text-white"
              >
                <span aria-hidden="true">{herramienta.icon}</span> {herramienta.label}
              </li>
            ))}
          </ul>
        </Accordion>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center px-5"
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
