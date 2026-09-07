const STORAGE_KEY = 'calma:bitacora'

function generarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getEntradas() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function guardarEntrada(entrada) {
  const entradaGuardada = {
    ...entrada,
    id: generarId(),
    fecha: new Date().toISOString(),
  }

  const entradas = [entradaGuardada, ...getEntradas()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas))

  return entradaGuardada
}

export function eliminarEntrada(id) {
  const entradas = getEntradas().filter((entrada) => entrada.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas))
  return entradas
}

// TODO: el audio de la nota de voz (notaVozBlob) no se persiste aquí —
// los Blobs no son serializables a JSON y localStorage tiene un límite
// de ~5-10MB total que un solo audio podría agotar. Solo guardamos
// `tieneNotaDeVoz` y `notaVozDuracion` como metadatos de texto; el
// audio real necesitaría IndexedDB o un backend con almacenamiento de
// archivos. localStorage es una solución interina solo para el texto.
