import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { ChevronIcon, IdiomaIcon, PersonaIcon, SalirIcon } from '../components/Iconos'
import { riseIn } from '../animations/transitions'
import { useAuth } from '../context/AuthContext'
import { useVolverA } from '../utils/useVolverA'
import { supabase } from '../lib/supabaseClient'
import { AVATARES } from '../constants/avatares'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/perfil'
import TEXTOS_COMUNES from '../i18n/textos/comun'
import { conOrigen } from '../utils/useVolverA'

const MIN_PASSWORD_LENGTH = 6
const MIN_NOMBRE_LENGTH = 2
const MAX_NOMBRE_LENGTH = 30
const cardClass = 'rounded-lg bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]'
const inputClass =
  'w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-ink-soft/50 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20'
const botonNavyClass =
  'w-full rounded-full bg-gradient-to-br from-brand-navy to-brand-navyDeep py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,46,107,0.25)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'

function mapUpdateEmailError(error, t) {
  const message = error?.message?.toLowerCase() ?? ''
  if (message.includes('email') && (message.includes('invalid') || message.includes('format'))) {
    return t.correoInvalido
  }
  if (message.includes('already') || message.includes('registered') || message.includes('exists')) {
    return t.correoEnUso
  }
  return t.errorCorreo
}

// Fila de ajustes que se despliega: correo, contraseña y eliminar cuenta
// quedan plegados para que el perfil abra tranquilo y lo destructivo no
// esté siempre a la vista.
function SeccionPlegable({ id, titulo, abierta, onToggle, peligro = false, children }) {
  const panelId = `perfil-seccion-${id}`

  return (
    <div
      className={`mb-2.5 overflow-hidden rounded-xl border ${
        peligro ? 'border-red-400/30 bg-red-500/[0.08]' : 'border-cielo/10 bg-white/[0.06]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={panelId}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-cielo/30 ${
          peligro ? 'text-red-300' : 'text-cielo'
        }`}
      >
        {titulo}
        <motion.span
          animate={{ rotate: abierta ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-cielo/50"
        >
          <ChevronIcon className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            id={panelId}
            key="contenido"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Perfil() {
  const { user, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const volverA = useVolverA('/islas')
  const location = useLocation()
  const t = useTextos(TEXTOS)
  const { avatares } = useTextos(TEXTOS_COMUNES)

  const [perfilCargando, setPerfilCargando] = useState(true)
  const [avatarId, setAvatarId] = useState(null)
  const [avatarGuardado, setAvatarGuardado] = useState(null)
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [nombreGuardado, setNombreGuardado] = useState('')
  const [perfilGuardando, setPerfilGuardando] = useState(false)
  const [perfilError, setPerfilError] = useState('')
  const [perfilMensaje, setPerfilMensaje] = useState('')

  const [email, setEmail] = useState(user?.email ?? '')
  const [emailEnviando, setEmailEnviando] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailMensaje, setEmailMensaje] = useState('')

  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [passwordEnviando, setPasswordEnviando] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordMensaje, setPasswordMensaje] = useState('')

  const [textoConfirmacionEliminar, setTextoConfirmacionEliminar] = useState('')
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false)
  const [eliminarCuentaError, setEliminarCuentaError] = useState('')

  // 'correo' | 'contrasena' | 'eliminar' | null
  const [seccionAbierta, setSeccionAbierta] = useState(null)
  const alternarSeccion = (id) => setSeccionAbierta((actual) => (actual === id ? null : id))

  useEffect(() => {
    let cancelado = false

    const cargarPerfil = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_id, display_name')
        .eq('id', user.id)
        .single()

      if (cancelado) return
      if (!error && data) {
        setAvatarId(data.avatar_id)
        setAvatarGuardado(data.avatar_id)
        setNombreUsuario(data.display_name ?? '')
        setNombreGuardado(data.display_name ?? '')
      }
      setPerfilCargando(false)
    }

    cargarPerfil()
    return () => {
      cancelado = true
    }
  }, [user.id])

  const nombreLimpio = nombreUsuario.trim()
  const hayCambiosPendientes = avatarId !== avatarGuardado || nombreLimpio !== nombreGuardado

  const handleGuardarPerfil = async () => {
    setPerfilError('')
    setPerfilMensaje('')

    if (nombreLimpio !== '' && (nombreLimpio.length < MIN_NOMBRE_LENGTH || nombreLimpio.length > MAX_NOMBRE_LENGTH)) {
      setPerfilError(t.nombreLongitud(MIN_NOMBRE_LENGTH, MAX_NOMBRE_LENGTH))
      return
    }

    setPerfilGuardando(true)
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_id: avatarId, display_name: nombreLimpio || null })
      .eq('id', user.id)
    setPerfilGuardando(false)

    if (error) {
      setPerfilError(t.errorPerfil)
      return
    }

    setAvatarGuardado(avatarId)
    setNombreGuardado(nombreLimpio)
    setNombreUsuario(nombreLimpio)
    setPerfilMensaje(t.perfilActualizado)
    refreshProfile()
  }

  const handleActualizarCorreo = async (e) => {
    e.preventDefault()
    setEmailError('')
    setEmailMensaje('')

    setEmailEnviando(true)
    const { error } = await supabase.auth.updateUser({ email })
    setEmailEnviando(false)

    if (error) {
      setEmailError(mapUpdateEmailError(error, t))
      return
    }
    setEmailMensaje(t.revisaBandeja)
  }

  const handleActualizarContrasena = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMensaje('')

    if (nuevaContrasena.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t.contrasenaCorta(MIN_PASSWORD_LENGTH))
      return
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setPasswordError(t.noCoinciden)
      return
    }

    setPasswordEnviando(true)
    const { error } = await supabase.auth.updateUser({ password: nuevaContrasena })
    setPasswordEnviando(false)

    if (error) {
      setPasswordError(t.errorContrasena)
      return
    }
    setPasswordMensaje(t.contrasenaActualizada)
    setNuevaContrasena('')
    setConfirmarContrasena('')
  }

  const cerrarSesion = () => {
    // Mismo orden que en AccountMenu: navegar primero, de forma síncrona,
    // y llamar a signOut() después — si no, el redirect reactivo de
    // RequireAuth gana la carrera y termina en /login en vez de /elegir.
    navigate('/elegir', { replace: true })
    signOut()
  }

  const puedeEliminarCuenta = textoConfirmacionEliminar === t.palabraEliminar

  const handleEliminarCuenta = async () => {
    if (!puedeEliminarCuenta || eliminandoCuenta) return

    setEliminarCuentaError('')
    setEliminandoCuenta(true)
    const { data, error } = await supabase.functions.invoke('eliminar-cuenta')

    if (error || !data?.success) {
      setEliminandoCuenta(false)
      setEliminarCuentaError(t.errorEliminar)
      return
    }

    // Mismo orden que cerrarSesion: navegar primero, de forma síncrona,
    // y limpiar la sesión local después — la cuenta ya no existe en el
    // servidor, pero el navegador todavía cree que hay sesión hasta que
    // signOut() actualiza ese estado.
    navigate('/elegir?cuenta_eliminada=1', { replace: true })
    signOut()
  }

  // El encabezado muestra lo guardado, no la selección sin guardar.
  const avatarActual = AVATARES.find((avatar) => avatar.id === avatarGuardado)

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo={volverA} showAccount={false} />

        <motion.div {...riseIn(0)} className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-2 ring-cielo/25">
            {avatarActual ? (
              <img src={avatarActual.src} alt="" className="h-full w-full object-cover" />
            ) : (
              <PersonaIcon className="h-11 w-11 text-cielo/60" />
            )}
          </div>
          <h1 className="text-[26px] font-semibold leading-tight text-cielo">
            {nombreGuardado || t.tuPerfil}
          </h1>
          {user?.email && <p className="mt-1 text-sm text-cielo/65">{user.email}</p>}
        </motion.div>

        <motion.div {...riseIn(0.06)} className={`mb-8 ${cardClass}`}>
          <p className="mb-4 text-sm font-semibold text-ink">{t.avatarYNombre}</p>

          {perfilCargando ? (
            <div className="flex justify-center py-4">
              <span
                aria-hidden="true"
                className="h-7 w-7 animate-spin rounded-full border-2 border-ink/15 border-t-ink/60"
              />
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-4">
                {AVATARES.map((avatar) => {
                  const seleccionado = avatar.id === avatarId
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setAvatarId(avatar.id)}
                      aria-label={avatares[avatar.id]}
                      aria-pressed={seleccionado}
                      className={`h-20 w-20 rounded-full p-1 transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-navy/30 ${
                        seleccionado ? 'ring-[3px] ring-brand-navy' : 'ring-0'
                      }`}
                    >
                      <img
                        src={avatar.src}
                        alt={avatares[avatar.id]}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>

              <label
                htmlFor="perfil-nombre"
                className="mb-1 mt-5 block text-xs font-semibold text-ink-soft"
              >
                {t.nombreUsuario}
              </label>
              <input
                id="perfil-nombre"
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder={t.nombreEjemplo}
                className={inputClass}
              />

              {perfilError && (
                <p className="mt-3 text-xs font-medium text-red-500">{perfilError}</p>
              )}
              {perfilMensaje && (
                <p className="mt-3 text-xs font-medium text-acomp-1">{perfilMensaje}</p>
              )}

              <button
                type="button"
                onClick={handleGuardarPerfil}
                disabled={!hayCambiosPendientes || perfilGuardando}
                className={`mt-4 ${botonNavyClass}`}
              >
                {perfilGuardando ? t.guardando : t.guardar}
              </button>
            </>
          )}
        </motion.div>

        <motion.section {...riseIn(0.12)}>
          <h2 className="mb-3 text-[15px] font-semibold text-cielo">{t.cuenta}</h2>

          <SeccionPlegable
            id="correo"
            titulo={t.cambiarCorreo}
            abierta={seccionAbierta === 'correo'}
            onToggle={() => alternarSeccion('correo')}
          >
            <form onSubmit={handleActualizarCorreo} className={cardClass}>
              <label htmlFor="perfil-email" className="mb-1 block text-xs font-semibold text-ink-soft">
                {t.correo}
              </label>
              <input
                id="perfil-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mb-3 ${inputClass}`}
              />

              {emailError && <p className="mb-3 text-xs font-medium text-red-500">{emailError}</p>}
              {emailMensaje && <p className="mb-3 text-xs font-medium text-acomp-1">{emailMensaje}</p>}

              <button type="submit" disabled={emailEnviando} className={botonNavyClass}>
                {emailEnviando ? t.actualizando : t.actualizarCorreo}
              </button>
            </form>
          </SeccionPlegable>

          <SeccionPlegable
            id="contrasena"
            titulo={t.cambiarContrasena}
            abierta={seccionAbierta === 'contrasena'}
            onToggle={() => alternarSeccion('contrasena')}
          >
            <form onSubmit={handleActualizarContrasena} className={cardClass}>
              <label
                htmlFor="perfil-password"
                className="mb-1 block text-xs font-semibold text-ink-soft"
              >
                {t.nuevaContrasena}
              </label>
              <input
                id="perfil-password"
                type="password"
                required
                autoComplete="new-password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="••••••••"
                className={`mb-3 ${inputClass}`}
              />

              <label
                htmlFor="perfil-password-confirm"
                className="mb-1 block text-xs font-semibold text-ink-soft"
              >
                {t.confirmarNueva}
              </label>
              <input
                id="perfil-password-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="••••••••"
                className={`mb-3 ${inputClass}`}
              />

              {passwordError && (
                <p className="mb-3 text-xs font-medium text-red-500">{passwordError}</p>
              )}
              {passwordMensaje && (
                <p className="mb-3 text-xs font-medium text-acomp-1">{passwordMensaje}</p>
              )}

              <button type="submit" disabled={passwordEnviando} className={botonNavyClass}>
                {passwordEnviando ? t.actualizando : t.actualizarContrasena}
              </button>
            </form>
          </SeccionPlegable>

          {/* Perfil no tiene el menú de cuenta: aquí se cambia el idioma */}
          <button
            type="button"
            onClick={() => navigate('/idioma', conOrigen(location))}
            className="mb-2.5 flex w-full items-center justify-between rounded-xl border border-cielo/10 bg-white/[0.06] px-4 py-3.5 text-left text-[15px] font-semibold text-cielo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/30"
          >
            {t.idioma}
            <span className="flex items-center gap-2 text-sm font-medium text-cielo/65">
              {t.idiomaActual}
              <IdiomaIcon className="h-5 w-5 text-cielo/50" />
            </span>
          </button>
          <button
            type="button"
            onClick={cerrarSesion}
            className="mb-2.5 flex w-full items-center justify-between rounded-xl border border-cielo/10 bg-white/[0.06] px-4 py-3.5 text-left text-[15px] font-semibold text-cielo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/30"
          >
            {t.cerrarSesion}
            <SalirIcon className="h-5 w-5 text-cielo/50" />
          </button>
        </motion.section>

        <motion.div {...riseIn(0.18)} className="mt-8">
          <SeccionPlegable
            id="eliminar"
            titulo={t.eliminarMiCuenta}
            abierta={seccionAbierta === 'eliminar'}
            onToggle={() => alternarSeccion('eliminar')}
            peligro
          >
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-5">
              <p className="mb-4 text-xs leading-relaxed text-red-600">
                {t.advertenciaEliminar}
              </p>

              <label
                htmlFor="perfil-confirmar-eliminar"
                className="mb-1 block text-xs font-semibold text-red-600"
              >
                {t.escribePalabra(t.palabraEliminar)}
              </label>
              <input
                id="perfil-confirmar-eliminar"
                type="text"
                value={textoConfirmacionEliminar}
                onChange={(e) => setTextoConfirmacionEliminar(e.target.value)}
                disabled={eliminandoCuenta}
                className="mb-3 w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-[14.5px] text-ink focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-60"
              />

              {eliminarCuentaError && (
                <p className="mb-3 text-xs font-medium text-red-600">{eliminarCuentaError}</p>
              )}

              <button
                type="button"
                onClick={handleEliminarCuenta}
                disabled={!puedeEliminarCuenta || eliminandoCuenta}
                className="w-full rounded-full bg-red-500 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(220,38,38,0.25)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {eliminandoCuenta ? t.eliminandoCuenta : t.eliminarDefinitivamente}
              </button>
            </div>
          </SeccionPlegable>
        </motion.div>
      </div>
    </div>
  )
}
