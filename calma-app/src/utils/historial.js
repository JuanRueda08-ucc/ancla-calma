// Agrupa las entradas de la bitácora por día (hora local) para el historial
// en línea de tiempo: "Hoy", "Ayer" o "Lunes 27 de octubre" (con año si no
// es el actual). Conserva el orden en que llegan (de la más nueva a la más
// vieja).

const formatoDia = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const formatoDiaConAnio = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
export const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' })

function claveDia(fecha) {
  return `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`
}

function inicioDelDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

export function etiquetaDia(fecha, ahora = new Date()) {
  const dias = Math.round((inicioDelDia(ahora) - inicioDelDia(fecha)) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  const texto = (fecha.getFullYear() === ahora.getFullYear() ? formatoDia : formatoDiaConAnio).format(fecha)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function agruparPorDia(entradas, ahora = new Date()) {
  const grupos = []
  for (const entrada of entradas) {
    const fecha = new Date(entrada.fecha)
    const clave = claveDia(fecha)
    let grupo = grupos.find((g) => g.clave === clave)
    if (!grupo) {
      grupo = { clave, etiqueta: etiquetaDia(fecha, ahora), entradas: [] }
      grupos.push(grupo)
    }
    grupo.entradas.push(entrada)
  }
  return grupos
}
