import { useCallback, useEffect, useState } from 'react'

const TICK_MS = 100

// Ritmo de los ejercicios guiados por pasos (grounding, sensoriales): cada
// paso dura `msPorPaso` y avanza solo; `pausado` (la pausa del shell) detiene
// el reloj y `siguiente()` adelanta a mano. Después del último paso queda
// `terminado` en true.
export function useRitmoPasos(totalPasos, msPorPaso, pausado) {
  const [indice, setIndice] = useState(0)
  const [transcurrido, setTranscurrido] = useState(0)
  const [terminado, setTerminado] = useState(false)

  const siguiente = useCallback(() => {
    setTranscurrido(0)
    if (indice >= totalPasos - 1) {
      setTerminado(true)
    } else {
      setIndice((prev) => prev + 1)
    }
  }, [indice, totalPasos])

  useEffect(() => {
    if (pausado || terminado) return undefined
    const id = setInterval(() => setTranscurrido((prev) => prev + TICK_MS), TICK_MS)
    return () => clearInterval(id)
  }, [pausado, terminado])

  useEffect(() => {
    if (transcurrido >= msPorPaso) siguiente()
  }, [transcurrido, msPorPaso, siguiente])

  return {
    indice,
    terminado,
    siguiente,
    progreso: Math.min(1, transcurrido / msPorPaso),
    restanteS: Math.max(1, Math.ceil((msPorPaso - transcurrido) / 1000)),
  }
}
