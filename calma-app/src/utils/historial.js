// Agrupa las entradas de la bitácora por día (hora local) para el historial
// en línea de tiempo: "Hoy", "Ayer" o "Lunes 27 de octubre" (con año si no
// es el actual), en el idioma pedido. Conserva el orden en que llegan (de la
// más nueva a la más vieja).
import { IDIOMA_POR_DEFECTO, LOCALES } from '../i18n'
import TEXTOS from '../i18n/textos/bitacora'

const formatos = (idioma) => {
  const locale = LOCALES[idioma]
  return {
    dia: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
    diaConAnio: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    hora: new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
  }
}

export function formatearHora(fecha, idioma = IDIOMA_POR_DEFECTO) {
  return formatos(idioma).hora.format(fecha)
}

function claveDia(fecha) {
  return `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`
}

function inicioDelDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

export function etiquetaDia(fecha, ahora = new Date(), idioma = IDIOMA_POR_DEFECTO) {
  const t = TEXTOS[idioma].historial
  const dias = Math.round((inicioDelDia(ahora) - inicioDelDia(fecha)) / 86400000)
  if (dias === 0) return t.hoy
  if (dias === 1) return t.ayer
  const { dia, diaConAnio } = formatos(idioma)
  const texto = (fecha.getFullYear() === ahora.getFullYear() ? dia : diaConAnio).format(fecha)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function agruparPorDia(entradas, ahora = new Date(), idioma = IDIOMA_POR_DEFECTO) {
  const grupos = []
  for (const entrada of entradas) {
    const fecha = new Date(entrada.fecha)
    const clave = claveDia(fecha)
    let grupo = grupos.find((g) => g.clave === clave)
    if (!grupo) {
      grupo = { clave, etiqueta: etiquetaDia(fecha, ahora, idioma), entradas: [] }
      grupos.push(grupo)
    }
    grupo.entradas.push(entrada)
  }
  return grupos
}
