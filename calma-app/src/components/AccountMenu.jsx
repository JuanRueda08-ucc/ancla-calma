import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AccountMenu({ buttonClassName = 'bg-brand-navy text-white' }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)

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

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-label="Cuenta"
        aria-expanded={abierto}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${buttonClassName}`}
      >
        👤
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-lg bg-white py-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-ink"
          >
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  )
}
