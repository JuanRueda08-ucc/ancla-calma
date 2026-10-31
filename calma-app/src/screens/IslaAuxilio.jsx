import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import UbicacionEnVivoPanel from '../components/UbicacionEnVivoPanel'
import '../styles/islaNoche.css'
import { riseIn } from '../animations/transitions'
import { useAuth } from '../context/AuthContext'
import { getContactos, guardarContacto, eliminarContacto, normalizarTelefono } from '../utils/contactosStorage'
import { obtenerUbicacion, construirLinkMapa, construirLinkWhatsApp } from '../utils/compartirUbicacion'

const MAX_CONTACTOS = 3
const LOCAL_STORAGE_KEY = 'calma:contactos'

const LINEAS_APOYO = [
  { nombre: 'Bienestar Te Escucha', telefono: '01 8000 113 113' },
  { nombre: 'Línea de la Vida', telefono: '106' },
]

const cardClass = 'rounded-lg bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.04)]'
const botonPrincipal =
  'rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)] disabled:opacity-70'
const botonSecundario = 'rounded-full bg-black/10 text-sm font-semibold text-ink disabled:opacity-70'
const inputClass =
  'mb-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14.5px] text-ink placeholder:text-ink-soft/50 focus:border-auxilio-1 focus:outline-none'

function TelefonoIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
    </svg>
  )
}

function UbicacionIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}

function obtenerIniciales(nombre) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  const iniciales = partes
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
  return iniciales || '?'
}

function esTelefonoValido(telefono) {
  const patronCaracteres = /^\+?[0-9\s()-]+$/
  if (!patronCaracteres.test(telefono.trim())) return false
  const soloDigitos = telefono.replace(/\D/g, '')
  return soloDigitos.length >= 7
}

function leerContactosLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function IslaAuxilio() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState(null)
  const toastTimeout = useRef(null)

  const [cargaEstado, setCargaEstado] = useState('cargando') // 'cargando' | 'sin-sesion' | 'error' | 'listo'
  const [contactos, setContactos] = useState([])
  const [formAbierto, setFormAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [nombreForm, setNombreForm] = useState('')
  const [telefonoForm, setTelefonoForm] = useState('')
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)
  // Editar/eliminar quedan detrás de "Administrar" para que no compitan con Llamar.
  const [administrando, setAdministrando] = useState(false)

  const [confirmarEliminarId, setConfirmarEliminarId] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)
  const confirmarTimeoutRef = useRef(null)

  const [migracionDisponible, setMigracionDisponible] = useState(false)
  const [contactosLocales, setContactosLocales] = useState([])
  const [migrando, setMigrando] = useState(false)

  // null | 'sin-contacto' | 'seleccion' | 'cargando' | 'sin-codigo-pais' | 'error'
  const [compartirEstado, setCompartirEstado] = useState(null)
  const [compartirErrorMsg, setCompartirErrorMsg] = useState('')
  const [contactoProblema, setContactoProblema] = useState(null)

  // La isla es de acceso libre para que las líneas profesionales estén
  // siempre a mano; sin sesión no se piden contactos (fallaría por RLS) y se
  // muestra la invitación a iniciar sesión en su lugar.
  const cargarContactos = async () => {
    if (!user) {
      setCargaEstado('sin-sesion')
      return
    }
    setCargaEstado('cargando')
    try {
      const data = await getContactos()
      setContactos(data)
      setCargaEstado('listo')

      if (data.length === 0) {
        const locales = leerContactosLocalStorage()
        if (locales.length > 0) {
          setContactosLocales(locales)
          setMigracionDisponible(true)
        }
      }
    } catch {
      setCargaEstado('error')
    }
  }

  useEffect(() => {
    if (authLoading) return
    cargarContactos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  const irAIniciarSesion = (ruta) => {
    navigate(ruta, { state: { from: location.pathname } })
  }

  useEffect(() => {
    return () => {
      clearTimeout(toastTimeout.current)
      clearTimeout(confirmarTimeoutRef.current)
    }
  }, [])

  const showToast = (message) => {
    setToast(message)
    window.clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(null), 2200)
  }

  const abrirFormularioNuevo = () => {
    setEditandoId(null)
    setNombreForm('')
    setTelefonoForm('')
    setErrorForm('')
    setFormAbierto(true)
  }

  const iniciarEdicion = (contacto) => {
    setConfirmarEliminarId(null)
    setEditandoId(contacto.id)
    setNombreForm(contacto.nombre)
    setTelefonoForm(contacto.telefono)
    setErrorForm('')
    setFormAbierto(true)
  }

  const cerrarFormulario = () => {
    setFormAbierto(false)
    setEditandoId(null)
    setNombreForm('')
    setTelefonoForm('')
    setErrorForm('')
  }

  const handleGuardarContacto = async () => {
    const nombre = nombreForm.trim()
    const telefono = telefonoForm.trim()

    if (!nombre) {
      setErrorForm('Ingresa un nombre')
      return
    }
    if (!telefono.startsWith('+')) {
      setErrorForm('Incluye el código de país (ej. +57 para Colombia)')
      return
    }
    if (!esTelefonoValido(telefono)) {
      setErrorForm('Ingresa un teléfono válido (mínimo 7 dígitos)')
      return
    }

    setGuardando(true)
    try {
      const contactoGuardado = await guardarContacto({
        id: editandoId ?? undefined,
        nombre,
        telefono,
      })
      setContactos((prev) => {
        const yaExiste = prev.some((c) => c.id === contactoGuardado.id)
        return yaExiste
          ? prev.map((c) => (c.id === contactoGuardado.id ? contactoGuardado : c))
          : [...prev, contactoGuardado]
      })
      cerrarFormulario()
    } catch (error) {
      setErrorForm(error.message)
    } finally {
      setGuardando(false)
    }
  }

  const solicitarEliminar = (id) => {
    setConfirmarEliminarId(id)
    clearTimeout(confirmarTimeoutRef.current)
    confirmarTimeoutRef.current = setTimeout(() => setConfirmarEliminarId(null), 3000)
  }

  const confirmarEliminar = async (id) => {
    setEliminandoId(id)
    try {
      await eliminarContacto(id)
      setContactos((prev) => prev.filter((c) => c.id !== id))
      setConfirmarEliminarId(null)
      clearTimeout(confirmarTimeoutRef.current)
    } catch {
      showToast('No pudimos eliminar el contacto. Intenta de nuevo.')
    } finally {
      setEliminandoId(null)
    }
  }

  const cancelarEliminar = () => {
    setConfirmarEliminarId(null)
    clearTimeout(confirmarTimeoutRef.current)
  }

  const migrarContactosLocales = async () => {
    setMigrando(true)
    try {
      const nuevos = []
      for (const contacto of contactosLocales.slice(0, MAX_CONTACTOS)) {
        const contactoGuardado = await guardarContacto({
          nombre: contacto.nombre,
          telefono: contacto.telefono,
        })
        nuevos.push(contactoGuardado)
      }
      setContactos(nuevos)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      setMigracionDisponible(false)
      showToast('Contactos migrados a tu cuenta')
    } catch {
      showToast('No pudimos migrar tus contactos. Intenta de nuevo.')
    } finally {
      setMigrando(false)
    }
  }

  const descartarMigracion = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setMigracionDisponible(false)
  }

  const iniciarCompartirUbicacion = () => {
    setCompartirErrorMsg('')
    if (contactos.length === 0) {
      setCompartirEstado('sin-contacto')
      return
    }
    if (contactos.length === 1) {
      compartirConContacto(contactos[0])
      return
    }
    setCompartirEstado('seleccion')
  }

  const compartirConContacto = async (contacto) => {
    if (!contacto.telefono.trim().startsWith('+')) {
      setContactoProblema(contacto)
      setCompartirEstado('sin-codigo-pais')
      return
    }

    setCompartirEstado('cargando')
    try {
      const { lat, lng } = await obtenerUbicacion()
      const mensaje = `Esta es mi ubicación en este momento: ${construirLinkMapa(lat, lng)}`
      const url = construirLinkWhatsApp(contacto.telefono, mensaje)

      // location.href (no window.open): navega la pestaña actual, lo cual
      // NO está sujeto al bloqueo de popups por pérdida de gesto de usuario.
      // En mobile, wa.me es interceptado por el SO para abrir la app nativa
      // de WhatsApp, dejando esta pestaña de Calma intacta de fondo — mismo
      // comportamiento que ya teníamos con tel: para las llamadas.
      window.location.href = url
      setCompartirEstado(null)
    } catch (error) {
      if (error?.code === 1) {
        // GeolocationPositionError.PERMISSION_DENIED
        setCompartirErrorMsg(
          'No pudimos acceder a tu ubicación. Revisa los permisos de ubicación de tu navegador.'
        )
      } else {
        // 'NO_SUPPORT', TIMEOUT (3) o POSITION_UNAVAILABLE (2)
        setCompartirErrorMsg(
          'Tu dispositivo no pudo obtener tu ubicación en este momento. Intenta de nuevo.'
        )
      }
      setCompartirEstado('error')
    }
  }

  const cerrarPanelCompartir = () => {
    setCompartirEstado(null)
    setContactoProblema(null)
    setCompartirErrorMsg('')
  }

  const editarContactoProblema = () => {
    const contacto = contactoProblema
    cerrarPanelCompartir()
    if (contacto) iniciarEdicion(contacto)
  }

  const mostrarAcciones = administrando && contactos.length > 0

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      {/* resplandor cálido: marca la isla de auxilio dentro de la misma noche */}
      <div className="isla-resplandor isla-resplandor--auxilio pointer-events-none absolute inset-x-0 top-0 h-[55vh]" aria-hidden="true" />
      <StarField />
      {/* pb alto: deja espacio para la barra fija de líneas de ayuda */}
      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-10">
        <ScreenHeader backTo="/islas" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-8">
          <h1 className="text-[30px] font-semibold leading-tight text-white">Isla del Auxilio</h1>
          <p className="mt-1.5 text-[15px] text-white/75">Tu red de apoyo está aquí</p>
        </motion.div>

        {cargaEstado === 'cargando' && (
          <div className="flex justify-center py-10">
            <span
              aria-hidden="true"
              className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
          </div>
        )}

        {cargaEstado === 'sin-sesion' && (
          <motion.section {...riseIn(0.06)} className="mb-4">
            <h2 className="mb-3 text-[15px] font-semibold text-white">Tus personas de confianza</h2>
            <div className={`text-center ${cardClass}`}>
              <p className="mb-4 text-sm text-ink-soft">
                Para agregar a tus personas de confianza y llamarlas con un toque, inicia sesión.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => irAIniciarSesion('/login')}
                  className={`px-5 py-2.5 ${botonPrincipal}`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => irAIniciarSesion('/registro')}
                  className={`px-5 py-2.5 ${botonSecundario}`}
                >
                  Crear cuenta
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {cargaEstado === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 text-center ${cardClass}`}
          >
            <p className="mb-3 text-sm text-ink-soft">
              No pudimos cargar tus contactos. Intenta de nuevo.
            </p>
            <button type="button" onClick={cargarContactos} className={`px-6 py-3 ${botonPrincipal}`}>
              Reintentar
            </button>
          </motion.div>
        )}

        {cargaEstado === 'listo' && migracionDisponible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 text-center ${cardClass}`}
          >
            <p className="mb-3 text-sm text-ink-soft">
              Encontramos contactos guardados en este dispositivo. ¿Quieres agregarlos a tu
              cuenta?
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                disabled={migrando}
                onClick={migrarContactosLocales}
                className={`px-5 py-2.5 ${botonPrincipal}`}
              >
                {migrando ? 'Migrando…' : 'Sí, migrarlos'}
              </button>
              <button
                type="button"
                disabled={migrando}
                onClick={descartarMigracion}
                className={`px-5 py-2.5 ${botonSecundario}`}
              >
                No, descartar
              </button>
            </div>
          </motion.div>
        )}

        {cargaEstado === 'listo' && (
          <motion.div {...riseIn(0.06)} className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-white">Tus personas de confianza</h2>
            {contactos.length > 0 && !formAbierto && (
              <button
                type="button"
                onClick={() => {
                  setAdministrando((valor) => !valor)
                  cancelarEliminar()
                }}
                aria-pressed={administrando}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
              >
                {administrando ? 'Listo' : 'Administrar'}
              </button>
            )}
          </motion.div>
        )}

        {cargaEstado === 'listo' && contactos.length === 0 && !formAbierto && (
          <motion.div {...riseIn(0.08)} className={`mb-4 text-center ${cardClass}`}>
            <p className="mb-3 text-sm text-ink-soft">
              Agrega a alguien en quien confíes, para tenerlo a un toque de distancia
            </p>
            <button type="button" onClick={abrirFormularioNuevo} className={`px-6 py-3 ${botonPrincipal}`}>
              Agregar contacto de confianza
            </button>
          </motion.div>
        )}

        {/* Marcación rápida: cada contacto es un círculo que llama de un toque,
            como en el teléfono. "Agregar" ocupa el siguiente lugar libre. Como
            nunca hay más de 3 círculos (máximo 3 contactos), van centrados. */}
        {cargaEstado === 'listo' && contactos.length > 0 && !administrando && (
          <motion.ul {...riseIn(0.08)} className="mb-6 flex justify-center gap-6 sm:gap-10">
            {contactos.map((contacto) => (
              <li key={contacto.id} className="w-20">
                <a
                  href={`tel:${normalizarTelefono(contacto.telefono)}`}
                  aria-label={`Llamar a ${contacto.nombre}`}
                  className="group flex flex-col items-center gap-2 rounded-xl py-1 focus-visible:outline-none"
                >
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 text-xl font-bold text-white shadow-[0_10px_22px_rgba(255,122,89,0.35)] transition-transform group-active:scale-95 group-focus-visible:ring-4 group-focus-visible:ring-white/60">
                    {obtenerIniciales(contacto.nombre)}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-auxilio-1" aria-hidden="true">
                      <TelefonoIcon className="h-3.5 w-3.5" />
                    </span>
                  </span>
                  <span className="w-full truncate text-center text-[13px] font-semibold text-white">
                    {contacto.nombre.trim().split(/\s+/)[0]}
                  </span>
                </a>
              </li>
            ))}
            {contactos.length < MAX_CONTACTOS && !formAbierto && (
              <li className="w-20">
                <button
                  type="button"
                  onClick={abrirFormularioNuevo}
                  aria-label="Agregar contacto de confianza"
                  className="group flex w-full flex-col items-center gap-2 rounded-xl py-1 focus-visible:outline-none"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-dashed border-white/50 text-2xl text-white/80 group-focus-visible:ring-4 group-focus-visible:ring-white/60" aria-hidden="true">
                    +
                  </span>
                  <span className="text-[13px] font-semibold text-white/70">Agregar</span>
                </button>
              </li>
            )}
          </motion.ul>
        )}

        {/* "Administrar": filas con teléfono, Editar y Eliminar (confirmación en dos pasos) */}
        {cargaEstado === 'listo' && mostrarAcciones && contactos.map((contacto) => (
          <div key={contacto.id} className={`mb-3 ${cardClass}`}>
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-base font-bold text-auxilio-1">
                {obtenerIniciales(contacto.nombre)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold text-ink">{contacto.nombre}</p>
                <p className="text-[13px] text-ink-soft">{contacto.telefono}</p>
              </div>
            </div>

            {mostrarAcciones && (
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-black/5 pt-3">
                {confirmarEliminarId === contacto.id ? (
                  <>
                    <button
                      type="button"
                      disabled={eliminandoId === contacto.id}
                      onClick={() => confirmarEliminar(contacto.id)}
                      className="whitespace-nowrap rounded-full bg-auxilio-1 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      {eliminandoId === contacto.id ? 'Eliminando…' : '¿Eliminar?'}
                    </button>
                    <button
                      type="button"
                      disabled={eliminandoId === contacto.id}
                      onClick={cancelarEliminar}
                      className={`px-4 py-2 ${botonSecundario}`}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => iniciarEdicion(contacto)}
                      aria-label={`Editar a ${contacto.nombre}`}
                      className={`px-4 py-2 ${botonSecundario}`}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => solicitarEliminar(contacto.id)}
                      aria-label={`Eliminar a ${contacto.nombre}`}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {formAbierto && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg bg-white/95 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
          >
            <p className="mb-3 text-sm font-semibold text-ink">
              {editandoId ? 'Editar contacto' : 'Agregar contacto de confianza'}
            </p>

            <label htmlFor="auxilio-nombre" className="mb-1 block text-xs font-semibold text-ink-soft">
              Nombre
            </label>
            <input
              id="auxilio-nombre"
              type="text"
              value={nombreForm}
              onChange={(e) => setNombreForm(e.target.value)}
              placeholder="Ej: Ana Torres"
              className={inputClass}
            />

            <label htmlFor="auxilio-telefono" className="mb-1 block text-xs font-semibold text-ink-soft">
              Teléfono
            </label>
            <input
              id="auxilio-telefono"
              type="tel"
              value={telefonoForm}
              onChange={(e) => setTelefonoForm(e.target.value)}
              placeholder="+57 300 1234567"
              className={inputClass}
            />

            {errorForm && <p className="mb-3 text-xs font-medium text-red-500">{errorForm}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={guardando}
                onClick={handleGuardarContacto}
                className={`flex-1 py-2.5 ${botonPrincipal}`}
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                type="button"
                disabled={guardando}
                onClick={cerrarFormulario}
                className={`flex-1 py-2.5 ${botonSecundario}`}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {cargaEstado === 'listo' && (compartirEstado === null || compartirEstado === 'cargando') && (
          <motion.button
            {...riseIn(0.16)}
            type="button"
            disabled={compartirEstado === 'cargando'}
            onClick={iniciarCompartirUbicacion}
            className="mb-3 mt-3 flex w-full items-center gap-3 rounded-full bg-white py-3.5 pl-3.5 pr-5 text-left shadow-[0_10px_24px_rgba(0,0,0,0.08)] disabled:opacity-70"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-senales-bg text-senales-1">
              {compartirEstado === 'cargando' ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-senales-1/30 border-t-senales-1"
                />
              ) : (
                <UbicacionIcon className="h-5 w-5" />
              )}
            </span>
            <span className="text-[15px] font-semibold text-ink">
              {compartirEstado === 'cargando' ? 'Obteniendo tu ubicación…' : 'Compartir mi ubicación'}
            </span>
          </motion.button>
        )}

        {compartirEstado === 'sin-contacto' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-9 mt-3 text-center ${cardClass}`}
          >
            <p className="mb-3 text-sm text-ink-soft">
              Agrega un contacto de confianza primero para poder compartir tu ubicación
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  cerrarPanelCompartir()
                  abrirFormularioNuevo()
                }}
                className={`px-5 py-2.5 ${botonPrincipal}`}
              >
                Agregar contacto de confianza
              </button>
              <button type="button" onClick={cerrarPanelCompartir} className={`px-5 py-2.5 ${botonSecundario}`}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {compartirEstado === 'seleccion' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-9 mt-3 ${cardClass}`}
          >
            <p className="mb-3 text-sm font-semibold text-ink">
              ¿A quién le compartes tu ubicación?
            </p>
            <div className="flex flex-col gap-2">
              {contactos.map((contacto) => (
                <button
                  key={contacto.id}
                  type="button"
                  onClick={() => compartirConContacto(contacto)}
                  className="rounded-lg bg-auxilio-bg px-4 py-3 text-left text-[14.5px] font-semibold text-ink"
                >
                  {contacto.nombre}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={cerrarPanelCompartir}
              className={`mt-3 w-full py-2.5 ${botonSecundario}`}
            >
              Cancelar
            </button>
          </motion.div>
        )}

        {compartirEstado === 'sin-codigo-pais' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-9 mt-3 text-center ${cardClass}`}
          >
            <p className="mb-3 text-sm text-ink-soft">
              Este contacto no tiene código de país guardado. Edítalo primero para poder
              compartir por WhatsApp.
            </p>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={editarContactoProblema} className={`px-5 py-2.5 ${botonPrincipal}`}>
                Editar contacto
              </button>
              <button type="button" onClick={cerrarPanelCompartir} className={`px-5 py-2.5 ${botonSecundario}`}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {compartirEstado === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-9 mt-3 text-center ${cardClass}`}
          >
            <p className="mb-3 text-sm font-medium text-red-500">{compartirErrorMsg}</p>
            <button type="button" onClick={cerrarPanelCompartir} className={`px-5 py-2.5 ${botonSecundario}`}>
              Cerrar
            </button>
          </motion.div>
        )}

        {/* La ubicación puntual (arriba) es una foto; esta es en vivo, con enlace */}
        {cargaEstado === 'listo' && (
          <UbicacionEnVivoPanel
            contactos={contactos}
            onAgregarContacto={abrirFormularioNuevo}
            onEditarContacto={iniciarEdicion}
          />
        )}

      </div>

      {/* Líneas de ayuda fijas abajo, al alcance del pulgar: no se van con el
          scroll y funcionan sin sesión y sin conexión (llamar no usa datos). */}
      <section
        aria-labelledby="auxilio-lineas"
        className="fixed inset-x-0 bottom-0 z-[5] border-t border-white/10 bg-brand-navyDeep/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur"
      >
        <div className="mx-auto max-w-[620px] px-5">
          <h2 id="auxilio-lineas" className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
            Líneas de apoyo profesional
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {LINEAS_APOYO.map((linea) => (
              <a
                key={linea.nombre}
                href={`tel:${linea.telefono.replace(/\s/g, '')}`}
                aria-label={`Llamar a ${linea.nombre}, ${linea.telefono}`}
                className="flex min-h-[56px] items-center gap-2.5 rounded-xl bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-auxilio-2"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-auxilio-1" aria-hidden="true">
                  <TelefonoIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-[15px] font-bold leading-tight text-ink">{linea.telefono}</span>
                  <span className="block text-[12px] leading-tight text-ink-soft">{linea.nombre}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-[6] flex justify-center px-5"
        >
          <div className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </motion.div>
      )}
    </div>
  )
}
