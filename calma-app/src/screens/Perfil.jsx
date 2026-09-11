import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import { riseIn } from '../animations/transitions'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { AVATARES } from '../constants/avatares'

const MIN_PASSWORD_LENGTH = 6
const MIN_NOMBRE_LENGTH = 2
const MAX_NOMBRE_LENGTH = 30
const cardClass = 'rounded-lg bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.04)]'

function mapUpdateEmailError(error) {
  const message = error?.message?.toLowerCase() ?? ''
  if (message.includes('email') && (message.includes('invalid') || message.includes('format'))) {
    return 'El correo electrónico no es válido.'
  }
  if (message.includes('already') || message.includes('registered') || message.includes('exists')) {
    return 'Ese correo ya está en uso por otra cuenta.'
  }
  return 'No pudimos actualizar tu correo. Intenta de nuevo.'
}

export default function Perfil() {
  const { user, refreshProfile } = useAuth()

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
      setPerfilError(
        `El nombre debe tener entre ${MIN_NOMBRE_LENGTH} y ${MAX_NOMBRE_LENGTH} caracteres.`
      )
      return
    }

    setPerfilGuardando(true)
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_id: avatarId, display_name: nombreLimpio || null })
      .eq('id', user.id)
    setPerfilGuardando(false)

    if (error) {
      setPerfilError('No pudimos guardar tu perfil. Intenta de nuevo.')
      return
    }

    setAvatarGuardado(avatarId)
    setNombreGuardado(nombreLimpio)
    setNombreUsuario(nombreLimpio)
    setPerfilMensaje('Perfil actualizado')
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
      setEmailError(mapUpdateEmailError(error))
      return
    }
    setEmailMensaje(
      'Revisa tu bandeja de entrada (la actual y la nueva) para confirmar el cambio de correo.'
    )
  }

  const handleActualizarContrasena = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMensaje('')

    if (nuevaContrasena.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    setPasswordEnviando(true)
    const { error } = await supabase.auth.updateUser({ password: nuevaContrasena })
    setPasswordEnviando(false)

    if (error) {
      setPasswordError('No pudimos actualizar tu contraseña. Intenta de nuevo.')
      return
    }
    setPasswordMensaje('Contraseña actualizada')
    setNuevaContrasena('')
    setConfirmarContrasena('')
  }

  return (
    <div className="min-h-screen bg-sand">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <BackButton to="/islas" />

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Tu perfil</h1>
          <p className="text-sm text-ink-soft">Tu avatar y los datos de tu cuenta</p>
        </motion.div>

        <motion.div {...riseIn(0.06)} className={`mb-5 ${cardClass}`}>
          <p className="mb-4 text-sm font-semibold text-ink">Elige tu avatar</p>

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
                      aria-label={avatar.nombre}
                      aria-pressed={seleccionado}
                      className={`h-20 w-20 rounded-full p-1 transition-shadow ${
                        seleccionado ? 'ring-[3px] ring-brand-navy' : 'ring-0'
                      }`}
                    >
                      <img
                        src={avatar.src}
                        alt={avatar.nombre}
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
                Nombre de usuario
              </label>
              <input
                id="perfil-nombre"
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="¿Cómo quieres que te llamemos?"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
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
                className="mt-4 w-full rounded-full bg-gradient-to-br from-brand-navy to-brand-navyDeep py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,46,107,0.25)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {perfilGuardando ? 'Guardando…' : 'Guardar'}
              </button>
            </>
          )}
        </motion.div>

        <motion.form
          {...riseIn(0.12)}
          onSubmit={handleActualizarCorreo}
          className={`mb-5 ${cardClass}`}
        >
          <p className="mb-3 text-sm font-semibold text-ink">Cambiar correo</p>

          <label htmlFor="perfil-email" className="mb-1 block text-xs font-semibold text-ink-soft">
            Correo electrónico
          </label>
          <input
            id="perfil-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink focus:outline-none"
          />

          {emailError && <p className="mb-3 text-xs font-medium text-red-500">{emailError}</p>}
          {emailMensaje && <p className="mb-3 text-xs font-medium text-acomp-1">{emailMensaje}</p>}

          <button
            type="submit"
            disabled={emailEnviando}
            className="w-full rounded-full bg-gradient-to-br from-brand-navy to-brand-navyDeep py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,46,107,0.25)] disabled:opacity-70"
          >
            {emailEnviando ? 'Actualizando…' : 'Actualizar correo'}
          </button>
        </motion.form>

        <motion.form {...riseIn(0.18)} onSubmit={handleActualizarContrasena} className={cardClass}>
          <p className="mb-3 text-sm font-semibold text-ink">Cambiar contraseña</p>

          <label
            htmlFor="perfil-password"
            className="mb-1 block text-xs font-semibold text-ink-soft"
          >
            Nueva contraseña
          </label>
          <input
            id="perfil-password"
            type="password"
            required
            autoComplete="new-password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            placeholder="••••••••"
            className="mb-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
          />

          <label
            htmlFor="perfil-password-confirm"
            className="mb-1 block text-xs font-semibold text-ink-soft"
          >
            Confirmar nueva contraseña
          </label>
          <input
            id="perfil-password-confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            placeholder="••••••••"
            className="mb-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
          />

          {passwordError && (
            <p className="mb-3 text-xs font-medium text-red-500">{passwordError}</p>
          )}
          {passwordMensaje && (
            <p className="mb-3 text-xs font-medium text-acomp-1">{passwordMensaje}</p>
          )}

          <button
            type="submit"
            disabled={passwordEnviando}
            className="w-full rounded-full bg-gradient-to-br from-brand-navy to-brand-navyDeep py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,46,107,0.25)] disabled:opacity-70"
          >
            {passwordEnviando ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </motion.form>
      </div>
    </div>
  )
}
