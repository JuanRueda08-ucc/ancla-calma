import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { riseIn } from '../animations/transitions'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

function mapAuthError(error) {
  if (error?.message === 'Invalid login credentials') {
    return 'Correo o contraseña incorrectos.'
  }
  if (error?.message === 'Email not confirmed') {
    return 'Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.'
  }
  return 'Algo salió mal. Intenta de nuevo.'
}

export default function Login() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from ?? '/islas'

  if (!authLoading && user) {
    return <Navigate to="/islas" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(mapAuthError(signInError))
      setSubmitting(false)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-sand-deep">
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-12">
        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <p className="mb-4 font-display text-[22px] uppercase tracking-[2px] text-brand-navy">
            Calma
          </p>
          <h1 className="mb-1.5 text-[26px] font-semibold text-ink">Bienvenido de vuelta</h1>
          <p className="text-sm text-ink-soft">Tu bitácora y contactos te esperan</p>
        </motion.div>

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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-4 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
          />

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
                Ingresando…
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </motion.form>

        <motion.p {...riseIn(0.25)} className="mt-6 text-center text-sm text-ink-soft">
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            state={location.state}
            className="font-semibold text-brand-navy"
          >
            Regístrate
          </Link>
        </motion.p>
      </div>
    </div>
  )
}
