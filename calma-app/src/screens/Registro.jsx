import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { riseIn } from '../animations/transitions'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/cuenta'

const MIN_PASSWORD_LENGTH = 6

function mapSignUpError(error, t) {
  const message = error?.message?.toLowerCase() ?? ''
  if (message.includes('email') && (message.includes('invalid') || message.includes('format'))) {
    return t.registro.correoInvalido
  }
  return t.algoSalioMal
}

export default function Registro() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const t = useTextos(TEXTOS)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const from = location.state?.from ?? '/islas'

  // Igual que en Login: si ya hay sesión, volver a la pantalla de origen.
  if (!authLoading && user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.registro.contrasenaCorta(MIN_PASSWORD_LENGTH))
      return
    }
    if (password !== confirmPassword) {
      setError(t.registro.noCoinciden)
      return
    }
    if (!aceptaPrivacidad) {
      setError(t.registro.debesAceptar)
      return
    }

    setSubmitting(true)
    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    setSubmitting(false)

    if (signUpError) {
      setError(mapSignUpError(signUpError, t))
      return
    }

    setSuccess(true)
  }

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      <StarField />

      <div className="relative z-[2] mx-auto flex min-h-[100dvh] max-w-[420px] flex-col px-6 pb-12 pt-10">
        {/* /islas y no "atrás": se puede llegar aquí redirigido desde una ruta protegida */}
        <ScreenHeader backTo="/islas" showAccount={false} />

        <div className="flex flex-1 flex-col justify-center">
          <motion.div {...riseIn(0)} className="mb-8 text-center">
            <p className="mb-4 font-display text-[22px] uppercase tracking-[2px] text-cielo">
              Calma
            </p>
            <h1 className="mb-1.5 text-[26px] font-semibold text-cielo">{t.registro.titulo}</h1>
            <p className="text-sm text-cielo/75">
              {t.registro.subtitulo}
            </p>
          </motion.div>

          {success ? (
            <motion.div
              {...riseIn(0.15)}
              className="rounded-lg bg-white p-6 text-center shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
            >
              <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-sand-deep text-brand-navy">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                </svg>
              </div>
              <p className="mb-5 text-sm text-ink">
                {t.registro.revisaCorreo}
              </p>
              <button
                type="button"
                onClick={() => navigate('/login', { state: location.state })}
                className="w-full rounded-full bg-gradient-to-br from-brand-navy to-brand-navyDeep py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,46,107,0.25)]"
              >
                {t.registro.irAIniciarSesion}
              </button>
            </motion.div>
          ) : (
            <motion.form
              {...riseIn(0.15)}
              onSubmit={handleSubmit}
              className="rounded-lg bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
            >
              <label htmlFor="email" className="mb-1 block text-xs font-semibold text-ink-soft">
                {t.correo}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.correoEjemplo}
                className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-ink-soft/50 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />

              <label htmlFor="password" className="mb-1 block text-xs font-semibold text-ink-soft">
                {t.contrasena}
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-ink-soft/50 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />

              <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold text-ink-soft">
                {t.registro.confirmarContrasena}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-ink-soft/50 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />

              <label className="mb-4 flex items-start gap-2 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={aceptaPrivacidad}
                  onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-black/20"
                />
                <span>
                  {t.registro.acepto}{' '}
                  {/* En otra pestaña: navegar aquí desmontaba el formulario y se
                      perdía lo ya escrito al volver. */}
                  <Link
                    to="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-navy underline underline-offset-2"
                  >
                    {t.registro.politica}
                    <span className="sr-only">{t.registro.otraPestana}</span>
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
                      className="h-4 w-4 animate-spin rounded-full border-2 border-cielo/30 border-t-cielo"
                    />
                    {t.registro.creando}
                  </>
                ) : (
                  t.registro.crearCuenta
                )}
              </button>
            </motion.form>
          )}

          {!success && (
            <motion.p {...riseIn(0.25)} className="mt-6 text-center text-sm text-cielo/70">
              {t.registro.yaTienes}{' '}
              <Link to="/login" state={location.state} className="inline-block py-2 font-semibold text-cielo underline decoration-cielo/50 underline-offset-4">
                {t.registro.iniciaSesion}
              </Link>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
