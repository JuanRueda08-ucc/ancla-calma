import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DISTANCIA_MIN_M,
  INTERVALO_MIN_MS,
  actualizarPosicion,
  detenerSesion,
  distanciaMetros,
  getSesionActiva,
  iniciarSesion,
} from './ubicacionEnVivo'

// Cada cuánto se reenvía la posición aunque la persona esté quieta, para
// que el contacto vea que el seguimiento sigue vivo.
const LATIDO_MS = 30000

function leerPosicion(opciones) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject({ code: 'NO_SUPPORT' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, precision: p.coords.accuracy }),
      reject,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, ...opciones },
    )
  })
}

export function mensajeErrorUbicacion(error) {
  if (error?.code === 1) return 'Calma no tiene permiso para usar tu ubicación. Actívalo en los ajustes del navegador.'
  if (error?.code === 'NO_SUPPORT') return 'Este navegador no permite compartir la ubicación.'
  if (error?.message) return error.message
  return 'No pudimos obtener tu ubicación. Intenta de nuevo.'
}

// Maneja una sesión de ubicación en vivo desde el teléfono de quien comparte
// (requiere sesión iniciada: se usa solo cuando ya hay usuario).
// Limitación de la web: solo envía mientras Calma está abierta en pantalla
// (por eso se pide mantener la pantalla encendida con Wake Lock).
export function useUbicacionEnVivo() {
  // 'cargando' | 'inactiva' | 'iniciando' | 'activa'
  const [estado, setEstado] = useState('cargando')
  const [sesion, setSesion] = useState(null)
  const [error, setError] = useState('')

  const watchIdRef = useRef(null)
  const latidoRef = useRef(null)
  const vencimientoRef = useRef(null)
  const wakeLockRef = useRef(null)
  const ultimoEnvioRef = useRef({ en: 0, pos: null })
  const enviandoRef = useRef(false)
  const sesionRef = useRef(null)

  const enviar = useCallback(async (pos, forzar = false) => {
    const actual = sesionRef.current
    if (!actual || enviandoRef.current) return
    const { en, pos: anterior } = ultimoEnvioRef.current
    const movio = anterior ? distanciaMetros(anterior, pos) >= DISTANCIA_MIN_M : true
    if (!forzar && !movio && Date.now() - en < INTERVALO_MIN_MS) return

    enviandoRef.current = true
    try {
      await actualizarPosicion(actual.id, pos)
      ultimoEnvioRef.current = { en: Date.now(), pos }
    } catch {
      // un envío fallido (ej. sin señal) se reintenta en el siguiente latido
    } finally {
      enviandoRef.current = false
    }
  }, [])

  const pedirPantallaEncendida = useCallback(async () => {
    try {
      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      // no disponible o rechazado: se sigue compartiendo igual
    }
  }, [])

  const limpiar = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation?.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    clearInterval(latidoRef.current)
    clearTimeout(vencimientoRef.current)
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
    sesionRef.current = null
  }, [])

  const terminarLocal = useCallback(() => {
    limpiar()
    setSesion(null)
    setEstado('inactiva')
  }, [limpiar])

  const empezarSeguimiento = useCallback(
    (nuevaSesion) => {
      limpiar()
      sesionRef.current = nuevaSesion
      setSesion(nuevaSesion)
      setEstado('activa')

      watchIdRef.current = navigator.geolocation.watchPosition(
        (p) => enviar({ lat: p.coords.latitude, lng: p.coords.longitude, precision: p.coords.accuracy }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 },
      )
      latidoRef.current = setInterval(() => {
        leerPosicion({ maximumAge: 10000 }).then((pos) => enviar(pos, true)).catch(() => {})
      }, LATIDO_MS)

      // Al vencer, detener del lado del teléfono también (borra coordenadas).
      const restante = new Date(nuevaSesion.expira_at).getTime() - Date.now()
      vencimientoRef.current = setTimeout(() => {
        detenerSesion(nuevaSesion.id).catch(() => {})
        terminarLocal()
      }, Math.max(0, restante))

      pedirPantallaEncendida()
    },
    [enviar, limpiar, pedirPantallaEncendida, terminarLocal],
  )

  // Retomar una sesión que siga activa (ej. si se recargó la página).
  useEffect(() => {
    let cancelado = false
    getSesionActiva()
      .then((activa) => {
        if (cancelado) return
        if (activa) empezarSeguimiento(activa)
        else setEstado('inactiva')
      })
      .catch(() => {
        if (!cancelado) setEstado('inactiva')
      })
    return () => {
      cancelado = true
    }
  }, [empezarSeguimiento])

  // Al volver a la app: reenviar enseguida y recuperar la pantalla encendida.
  useEffect(() => {
    const alCambiarVisibilidad = () => {
      if (document.visibilityState !== 'visible' || !sesionRef.current) return
      pedirPantallaEncendida()
      leerPosicion({ maximumAge: 10000 }).then((pos) => enviar(pos, true)).catch(() => {})
    }
    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  }, [enviar, pedirPantallaEncendida])

  useEffect(() => limpiar, [limpiar])

  const iniciar = async (duracionMin) => {
    setError('')
    setEstado('iniciando')
    try {
      // Primero la posición: así el permiso se pide antes de crear el enlace.
      const pos = await leerPosicion()
      const nueva = await iniciarSesion(duracionMin, pos)
      ultimoEnvioRef.current = { en: Date.now(), pos }
      empezarSeguimiento(nueva)
      return nueva
    } catch (e) {
      setError(mensajeErrorUbicacion(e))
      setEstado('inactiva')
      return null
    }
  }

  const detener = async () => {
    const actual = sesionRef.current
    terminarLocal()
    if (!actual) return
    try {
      await detenerSesion(actual.id)
    } catch {
      setError('No pudimos confirmar que se detuvo. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  return { estado, sesion, error, iniciar, detener }
}
