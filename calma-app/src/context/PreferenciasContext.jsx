import { createContext, useContext, useEffect, useState } from 'react'
import { IDIOMAS, IDIOMA_POR_DEFECTO, fijarIdiomaActual } from '../i18n'

// Idioma y tema viven solo en este dispositivo (localStorage), no en la
// cuenta: tienen que funcionar igual sin sesión. index.html aplica el tema
// guardado antes de que cargue React, para que no destelle el otro.
const CLAVE_IDIOMA = 'calma:idioma'
const CLAVE_TEMA = 'calma:tema'
const TEMAS = ['noche', 'dia']
const COLOR_BARRA = { noche: '#001B44', dia: '#FDE9E0' }

function leer(clave, validos) {
  try {
    const valor = localStorage.getItem(clave)
    return validos.includes(valor) ? valor : null
  } catch {
    return null
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    // sin almacenamiento: la preferencia dura hasta cerrar la pestaña
  }
}

const PreferenciasContext = createContext(undefined)

export function PreferenciasProvider({ children }) {
  // null = la persona todavía no eligió idioma (se le pregunta después de
  // "Comenzar"); mientras tanto la app está en español.
  const [idiomaGuardado, setIdiomaGuardado] = useState(() => leer(CLAVE_IDIOMA, IDIOMAS))
  const [tema, setTema] = useState(() => leer(CLAVE_TEMA, TEMAS) ?? 'noche')
  const idioma = idiomaGuardado ?? IDIOMA_POR_DEFECTO

  // En el render y no en un efecto: los efectos de las pantallas (que pueden
  // fallar y mostrar un mensaje de utils/) corren antes que los de aquí.
  fijarIdiomaActual(idioma)

  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema])
  }, [tema])

  const elegirIdioma = (nuevo) => {
    guardar(CLAVE_IDIOMA, nuevo)
    setIdiomaGuardado(nuevo)
  }

  const alternarTema = () => {
    const nuevo = tema === 'noche' ? 'dia' : 'noche'
    guardar(CLAVE_TEMA, nuevo)
    setTema(nuevo)
  }

  return (
    <PreferenciasContext.Provider
      value={{ idioma, idiomaElegido: idiomaGuardado !== null, elegirIdioma, tema, alternarTema }}
    >
      {children}
    </PreferenciasContext.Provider>
  )
}

// Para los textos: sin provider (pruebas de un componente suelto) se usa el
// idioma por defecto en vez de fallar.
export function useIdioma() {
  return useContext(PreferenciasContext)?.idioma ?? IDIOMA_POR_DEFECTO
}

export function usePreferencias() {
  const context = useContext(PreferenciasContext)
  if (context === undefined) {
    throw new Error('usePreferencias debe usarse dentro de un PreferenciasProvider')
  }
  return context
}
