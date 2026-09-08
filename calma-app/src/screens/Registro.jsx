import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { riseIn } from '../animations/transitions'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const MIN_PASSWORD_LENGTH = 6

function mapSignUpError(error) {
  const message = error?.message?.toLowerCase() ?? ''
  if (message.includes('email') && (message.includes('invalid') || message.includes('format'))) {
    return 'El correo electrónico no es válido.'
  }
  return 'Algo salió mal. Intenta de nuevo.'
}

export default function Registro() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const from = location.state?.from ?? '/islas'

  if (!authLoading && user) {
    return <Navigate to="/islas" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!aceptaPrivacidad) {
      setError('Debes aceptar el tratamiento de tus datos personales para continuar.')
      return
    }

    setSubmitting(true)
    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    setSubmitting(false)

    if (signUpError) {
      setError(mapSignUpError(signUpError))
      return
    }

    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-sand-deep">
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-12">
        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <p className="mb-4 font-display text-[22px] uppercase tracking-[2px] text-brand-navy">
            Calma
          </p>
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Crea tu cuenta</h1>
          <p className="text-sm text-ink-soft">
            Para guardar tu bitácora y contactos de confianza
          </p>
        </motion.div>

        {success ? (
          <motion.div
            {...riseIn(0.15)}
            className="rounded-lg bg-white p-6 text-center shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
          >
            <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-sand-deep text-[26px]">
              ✉️
            </div>
            <p className="mb-5 text-sm text-ink">
              Revisa tu correo y haz clic en el enlace para activar tu cuenta.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login', { state: location.state })}
              className="w-full rounded-full bg-gradient-to-br from-brand-navy to-brand-navyDeep py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,46,107,0.25)]"
            >
              Ir a iniciar sesión
            </button>
          </motion.div>
        ) : (
          <motion.form
            {...riseIn(0.15)}
            onSubmit={handleSubmit}
            className="rounded-lg bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
          >
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-ink-soft">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />

            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-ink-soft">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />

            <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold text-ink-soft">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />

            <label className="mb-4 flex items-start gap-2 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={aceptaPrivacidad}
                onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-black/20"
              />
              <span>
                Acepto el tratamiento de mis datos personales según la{' '}
                <Link to="/privacidad" className="font-semibold text-brand-navy">
                  política de privacidad
                </Link>
              </span>
            </label>

            {error && <p className="mb-4 text-xs font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-navy to-brand-navyDeep py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,46,107,0.25)] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  />
                  Creando cuenta…
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </motion.form>
        )}

        {!success && (
          <motion.p {...riseIn(0.25)} className="mt-6 text-center text-sm text-ink-soft">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" state={location.state} className="font-semibold text-brand-navy">
              Inicia sesión
            </Link>
          </motion.p>
        )}
      </div>
    </div>
  )
}
