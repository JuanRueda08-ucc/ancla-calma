import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'
import { getContactos, guardarContacto, eliminarContacto } from '../utils/contactosStorage'
import { obtenerUbicacion, construirLinkMapa, construirLinkWhatsApp } from '../utils/compartirUbicacion'

const BLOB_RADIUS = '42% 58% 63% 37% / 41% 44% 56% 59%'
const MAX_CONTACTOS = 3
const LOCAL_STORAGE_KEY = 'calma:contactos'

const LINEAS_APOYO = [
  { nombre: 'Bienestar Te Escucha', telefono: '01 8000 113 113' },
  { nombre: 'Línea de la Vida', telefono: '106' },
]

const cardClass = 'rounded-lg bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.04)]'

function obtenerIniciales(nombre) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  const iniciales = partes
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
  return iniciales || '?'
}

function normalizarTelefono(telefono) {
  const tienePlus = telefono.trim().startsWith('+')
  const digitos = telefono.replace(/\D/g, '')
  return tienePlus ? `+${digitos}` : digitos
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
  const [toast, setToast] = useState(null)
  const toastTimeout = useRef(null)

  const [cargaEstado, setCargaEstado] = useState('cargando') // 'cargando' | 'error' | 'listo'
  const [contactos, setContactos] = useState([])
  const [formAbierto, setFormAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [nombreForm, setNombreForm] = useState('')
  const [telefonoForm, setTelefonoForm] = useState('')
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

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

  const cargarContactos = async () => {
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
    cargarContactos()
  }, [])

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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-auxilio-1 to-auxilio-2">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/islas" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center bg-white/70 text-[26px]"
            style={{ borderRadius: BLOB_RADIUS }}
          >
            🤝
          </div>
          <h1 className="mb-1.5 text-[26px] font-semibold text-white">Isla del Auxilio</h1>
          <p className="text-sm text-white/[0.85]">Tu red de apoyo está aquí</p>
        </motion.div>

        {cargaEstado === 'cargando' && (
          <div className="flex justify-center py-10">
            <span
              aria-hidden="true"
              className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
          </div>
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
            <button
              type="button"
              onClick={cargarContactos}
              className="rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)]"
            >
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
                className="rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)] disabled:opacity-70"
              >
                {migrando ? 'Migrando…' : 'Sí, migrarlos'}
              </button>
              <button
                type="button"
                disabled={migrando}
                onClick={descartarMigracion}
                className="rounded-full bg-black/10 px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-70"
              >
                No, descartar
              </button>
            </div>
          </motion.div>
        )}

        {cargaEstado === 'listo' && contactos.length === 0 && !formAbierto && (
          <motion.div {...riseIn(0.08)} className={`mb-4 text-center ${cardClass}`}>
            <p className="mb-3 text-sm text-ink-soft">
              Agrega a alguien en quien confíes, para tenerlo a un toque de distancia
            </p>
            <button
              type="button"
              onClick={abrirFormularioNuevo}
              className="rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)]"
            >
              Agregar contacto de confianza
            </button>
          </motion.div>
        )}

        {cargaEstado === 'listo' && contactos.map((contacto, index) => (
          <motion.div
            key={contacto.id}
            {...riseIn(0.08 + index * 0.06)}
            className={`mb-4 ${cardClass}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-base font-bold text-auxilio-1">
                {obtenerIniciales(contacto.nombre)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink">{contacto.nombre}</p>
                <p className="text-xs text-ink-soft">Persona de confianza</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="text-xs text-ink-soft">{contacto.telefono}</span>
                  {confirmarEliminarId === contacto.id ? (
                    <>
                      <button
                        type="button"
                        disabled={eliminandoId === contacto.id}
                        onClick={() => confirmarEliminar(contacto.id)}
                        className="whitespace-nowrap rounded-full bg-auxilio-1 px-3 py-1 text-xs font-semibold text-white disabled:opacity-70"
                      >
                        {eliminandoId === contacto.id ? 'Eliminando…' : '¿Eliminar?'}
                      </button>
                      <button
                        type="button"
                        disabled={eliminandoId === contacto.id}
                        onClick={cancelarEliminar}
                        aria-label="Cancelar eliminación"
                        className="text-base text-ink-soft disabled:opacity-70"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(contacto)}
                        aria-label={`Editar a ${contacto.nombre}`}
                        className="text-sm text-ink-soft/60"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => solicitarEliminar(contacto.id)}
                        aria-label={`Eliminar a ${contacto.nombre}`}
                        className="text-sm text-ink-soft/60"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
              <a
                href={`tel:${normalizarTelefono(contacto.telefono)}`}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-lg text-auxilio-1"
                aria-label={`Llamar a ${contacto.nombre}`}
              >
                📞
              </a>
            </div>
          </motion.div>
        ))}

        {cargaEstado === 'listo' && contactos.length > 0 && contactos.length < MAX_CONTACTOS && !formAbierto && (
          <motion.button
            {...riseIn(0.1 + contactos.length * 0.06)}
            type="button"
            onClick={abrirFormularioNuevo}
            className="mb-4 w-full rounded-full bg-white/70 py-3 text-sm font-semibold text-white/95 shadow-[0_8px_22px_rgba(0,0,0,0.04)]"
          >
            + Agregar otro contacto
          </motion.button>
        )}

        {formAbierto && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg bg-white/95 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
          >
            <p className="mb-3 text-sm font-semibold text-ink">
              {editandoId ? 'Editar contacto' : 'Agregar contacto de confianza'}
            </p>

            <label className="mb-1 block text-xs font-semibold text-ink-soft">Nombre</label>
            <input
              type="text"
              value={nombreForm}
              onChange={(e) => setNombreForm(e.target.value)}
              placeholder="Ej: Ana Torres"
              className="mb-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />

            <label className="mb-1 block text-xs font-semibold text-ink-soft">Teléfono</label>
            <input
              type="tel"
              value={telefonoForm}
              onChange={(e) => setTelefonoForm(e.target.value)}
              placeholder="+57 300 1234567"
              className="mb-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />

            {errorForm && <p className="mb-3 text-xs font-medium text-red-500">{errorForm}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={guardando}
                onClick={handleGuardarContacto}
                className="flex-1 rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)] disabled:opacity-70"
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                type="button"
                disabled={guardando}
                onClick={cerrarFormulario}
                className="flex-1 rounded-full bg-black/10 py-2.5 text-sm font-semibold text-ink disabled:opacity-70"
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
            className="mb-8 flex w-full items-center gap-3 rounded-full bg-white py-3.5 pl-4 pr-5 text-left shadow-[0_8px_22px_rgba(0,0,0,0.04)] disabled:opacity-70"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-senales-bg text-base text-senales-1">
              {compartirEstado === 'cargando' ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-senales-1/30 border-t-senales-1"
                />
              ) : (
                '📍'
              )}
            </span>
            <span className="text-sm font-semibold text-ink-soft">
              {compartirEstado === 'cargando' ? 'Obteniendo tu ubicación…' : 'Compartir mi ubicación'}
            </span>
          </motion.button>
        )}

        {compartirEstado === 'sin-contacto' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 text-center ${cardClass}`}
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
                className="rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)]"
              >
                Agregar contacto de confianza
              </button>
              <button
                type="button"
                onClick={cerrarPanelCompartir}
                className="rounded-full bg-black/10 px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {compartirEstado === 'seleccion' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 ${cardClass}`}
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
                  className="rounded-lg bg-auxilio-bg px-4 py-2.5 text-left text-[14.5px] font-semibold text-ink"
                >
                  {contacto.nombre}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={cerrarPanelCompartir}
              className="mt-3 w-full rounded-full bg-black/10 py-2.5 text-sm font-semibold text-ink"
            >
              Cancelar
            </button>
          </motion.div>
        )}

        {compartirEstado === 'sin-codigo-pais' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 text-center ${cardClass}`}
          >
            <p className="mb-3 text-sm text-ink-soft">
              Este contacto no tiene código de país guardado. Edítalo primero para poder
              compartir por WhatsApp.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={editarContactoProblema}
                className="rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)]"
              >
                Editar contacto
              </button>
              <button
                type="button"
                onClick={cerrarPanelCompartir}
                className="rounded-full bg-black/10 px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {compartirEstado === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 text-center ${cardClass}`}
          >
            <p className="mb-3 text-sm font-medium text-red-500">{compartirErrorMsg}</p>
            <button
              type="button"
              onClick={cerrarPanelCompartir}
              className="rounded-full bg-black/10 px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Cerrar
            </button>
          </motion.div>
        )}

        <motion.p {...riseIn(0.22)} className="mb-3 text-sm font-semibold text-white/80">
          Líneas de apoyo profesional
        </motion.p>

        {LINEAS_APOYO.map((linea, index) => (
          <motion.div
            key={linea.nombre}
            {...riseIn(0.28 + index * 0.06)}
            className={`mb-3 flex items-center justify-between ${cardClass}`}
          >
            <div>
              <p className="font-semibold text-ink">{linea.nombre}</p>
              <p className="text-sm font-semibold text-auxilio-1">{linea.telefono}</p>
            </div>
            <button
              type="button"
              onClick={() => showToast(`Llamando a ${linea.nombre}… (simulado)`)}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-auxilio-bg text-lg text-auxilio-1"
              aria-label={`Llamar a ${linea.nombre}`}
            >
              📞
            </button>
          </motion.div>
        ))}
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center px-5"
        >
          <div className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </motion.div>
      )}
    </div>
  )
}
