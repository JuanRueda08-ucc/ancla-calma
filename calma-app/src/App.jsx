import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import RequireAuth from './components/RequireAuth'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Entrada />} />
          <Route path="/elegir" element={<ElegirCamino />} />
          <Route path="/islas" element={<Islas />} />
          <Route
            path="/islas/auxilio"
            element={
              <RequireAuth>
                <IslaAuxilio />
              </RequireAuth>
            }
          />
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
          <Route path="/islas/faro" element={<IslaFaro />} />
          <Route path="/islas/senales" element={<IslaSenales />} />
          <Route path="/acompanamiento" element={<PanelAcompanamiento />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
