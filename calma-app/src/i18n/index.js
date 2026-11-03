// Traducciones sin librería: cada pantalla tiene su archivo en textos/ con la
// misma forma en `es` y en `en` (textos.test.js lo comprueba). Los textos con
// datos son funciones, p. ej. `llamarA: (nombre) => \`Llamar a ${nombre}\``.
import { useIdioma } from '../context/PreferenciasContext'

export const IDIOMAS = ['es', 'en']
export const IDIOMA_POR_DEFECTO = 'es'

// Para fechas y horas (Intl): español de Colombia, inglés de EE. UU.
export const LOCALES = { es: 'es-CO', en: 'en-US' }

// Idioma actual para código fuera de React (mensajes de error de utils/).
// Lo fija PreferenciasProvider en cada render.
let idiomaActual = IDIOMA_POR_DEFECTO

export function fijarIdiomaActual(idioma) {
  idiomaActual = idioma
}

export function textoActual(textos) {
  return textos[idiomaActual] ?? textos[IDIOMA_POR_DEFECTO]
}

export function localeActual() {
  return LOCALES[idiomaActual]
}

export function useTextos(textos) {
  const idioma = useIdioma()
  return textos[idioma] ?? textos[IDIOMA_POR_DEFECTO]
}
