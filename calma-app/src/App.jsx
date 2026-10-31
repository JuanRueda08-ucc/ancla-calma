import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Entrada from './screens/Entrada'
import ElegirCamino from './screens/ElegirCamino'
import Islas from './screens/Islas'
import IslaAuxilio from './screens/IslaAuxilio'
import IslaAireMenu from './screens/IslaAireMenu'
import PuertoSeguro from './screens/PuertoSeguro'
import EjercicioRespiracion from './screens/EjercicioRespiracion'
import EjercicioGrounding from './screens/EjercicioGrounding'
import EjercicioRelajacionMuscular from './screens/EjercicioRelajacionMuscular'
import EjercicioSensorial from './screens/EjercicioSensorial'
import Bitacora from './screens/Bitacora'
import HistorialBitacora from './screens/HistorialBitacora'
import IslaFaro from './screens/IslaFaro'
import IslaSenales from './screens/IslaSenales'
import PanelAcompanamiento from './screens/PanelAcompanamiento'
import Login from './screens/Login'
import Registro from './screens/Registro'
import Privacidad from './screens/Privacidad'
import Perfil from './screens/Perfil'
import AvisoSinConexion from './components/AvisoSinConexion'
import RequireAuth from './components/RequireAuth'
import { AuthProvider } from './context/AuthContext'

// Carga diferida: solo esta página usa Leaflet (el mapa), así el resto de la
// app no descarga la librería.
const UbicacionCompartida = lazy(() => import('./screens/UbicacionCompartida'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AvisoSinConexion />
        <Routes>
          <Route path="/" element={<Entrada />} />
          <Route path="/elegir" element={<ElegirCamino />} />
          <Route path="/islas" element={<Islas />} />
          {/* Ruta abierta: las líneas de ayuda profesional no deben pedir
              cuenta. Solo los contactos de confianza requieren sesión, y eso
              lo maneja la propia pantalla. */}
          <Route path="/islas/auxilio" element={<IslaAuxilio />} />
          <Route path="/islas/aire" element={<IslaAireMenu />} />
          <Route path="/islas/aire/respiracion" element={<EjercicioRespiracion />} />
          <Route path="/islas/aire/puerto-seguro" element={<PuertoSeguro />} />
          <Route path="/islas/aire/puerto-seguro/grounding" element={<EjercicioGrounding />} />
          <Route path="/islas/aire/puerto-seguro/relajacion-muscular" element={<EjercicioRelajacionMuscular />} />
          <Route path="/islas/aire/puerto-seguro/sensorial" element={<EjercicioSensorial />} />
          <Route
            path="/bitacora"
            element={
              <RequireAuth>
                <Bitacora />
              </RequireAuth>
            }
          />
          <Route
            path="/bitacora/historial"
            element={
              <RequireAuth>
                <HistorialBitacora />
              </RequireAuth>
            }
          />
          <Route
            path="/islas/faro"
            element={
              <RequireAuth>
                <IslaFaro />
              </RequireAuth>
            }
          />
          <Route path="/islas/senales" element={<IslaSenales />} />
          <Route path="/acompanamiento" element={<PanelAcompanamiento />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/privacidad" element={<Privacidad />} />
          {/* Una dirección que no existe (enlace viejo o mal escrito) dejaba la
              página en blanco y sin salida: se manda al inicio. */}
          {/* Pública: la abren contactos de confianza sin cuenta desde WhatsApp */}
          <Route
            path="/ubicacion/:token"
            element={
              <Suspense fallback={<div className="min-h-[100dvh] bg-brand-navyDeep" />}>
                <UbicacionCompartida />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <Perfil />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
