import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/comun'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const t = useTextos(TEXTOS)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fondo text-cielo/75">
        {t.cargando}
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
