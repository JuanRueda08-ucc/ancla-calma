import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CerrarSesionButton({ textClassName = 'text-ink-soft' }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [confirmando, setConfirmando] = useState(false)

  const cerrarSesion = () => {
    // Navegamos primero, de forma síncrona: signOut() dispara
    // onAuthStateChange, que hace que RequireAuth redirija a /login en
    // cuanto detecta user === null. Si esperáramos a que signOut()
    // termine antes de navegar, esa redirección reactiva casi siempre
    // gana la carrera y la persona termina en /login en vez de /elegir.
    navigate('/elegir', { replace: true })
    signOut()
  }

  if (confirmando) {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={cerrarSesion}
          className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-500 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          ¿Seguro?
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          aria-label="Cancelar cierre de sesión"
          className={`text-base ${textClassName}`}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${textClassName}`}
    >
      <span>🚪</span>
      <span>Cerrar sesión</span>
    </button>
  )
}
