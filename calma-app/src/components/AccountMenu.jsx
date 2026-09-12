import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AVATARES } from '../constants/avatares'

export default function AccountMenu({ buttonClassName = 'bg-brand-navy text-white' }) {
  const { user, signOut, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)

  const avatarActual = AVATARES.find((avatar) => avatar.id === profile?.avatar_id)

  useEffect(() => {
    if (!abierto) return

    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('click', handleClickFuera)
    return () => document.removeEventListener('click', handleClickFuera)
  }, [abierto])

  const cerrarSesion = () => {
    // Navegamos primero, de forma síncrona: signOut() dispara
    // onAuthStateChange, que hace que RequireAuth redirija a /login en
    // cuanto detecta user === null. Si esperáramos a que signOut()
    // termine antes de navegar, esa redirección reactiva casi siempre
    // gana la carrera y la persona termina en /login en vez de /elegir.
    navigate('/elegir', { replace: true })
    signOut()
  }

  const irALogin = () => {
    setAbierto(false)
    navigate('/login')
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-label="Cuenta"
        aria-expanded={abierto}
        className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-base ${
          avatarActual ? '' : buttonClassName
        }`}
      >
        {avatarActual ? (
          <img src={avatarActual.src} alt={avatarActual.nombre} className="h-full w-full object-cover" />
        ) : (
          '👤'
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-lg bg-white py-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
          {user ? (
            <>
              <Link
                to="/perfil"
                state={{ from: location.pathname }}
                onClick={() => setAbierto(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-ink"
              >
                <span>👤</span>
                <span>Mi perfil</span>
              </Link>
              <button
                type="button"
                onClick={cerrarSesion}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-ink"
              >
                <span>🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={irALogin}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-ink"
            >
              <span>🔑</span>
              <span>Iniciar sesión</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
