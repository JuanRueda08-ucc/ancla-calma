import { useLocation } from 'react-router-dom'

// Regla de navegación de la app: si se llegó a una pantalla desde OTRA
// sección (ej. Señales → Respiración, Panel → Isla del Auxilio), "Volver"
// regresa a esa pantalla de origen y no al padre fijo de siempre.
//
// Quien enlaza pasa el origen con `conOrigen(location)` (o
// `{ state: { from: location.pathname } }`); la pantalla destino usa
// `useVolverA('/su-padre-de-siempre')` para su botón "Volver".
export function useVolverA(predeterminado) {
  const location = useLocation()
  const origen = location.state?.from
  const valido = typeof origen === 'string' && origen.startsWith('/') && origen !== location.pathname
  return valido ? origen : predeterminado
}

export function conOrigen(location) {
  return { state: { from: location.pathname } }
}
