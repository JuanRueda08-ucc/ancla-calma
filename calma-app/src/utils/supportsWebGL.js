let cachedResult = null

/**
 * Detecta si el navegador puede crear un contexto WebGL (2 o 1, con fallback).
 * El resultado se memoiza a nivel de módulo — el chequeo real solo corre una vez.
 */
export default function supportsWebGL() {
  if (cachedResult !== null) return cachedResult

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    cachedResult = !!gl
  } catch {
    cachedResult = false
  }

  return cachedResult
}
