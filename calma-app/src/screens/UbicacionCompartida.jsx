import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/islaNoche.css'
import StarField from '../components/StarField'
import { riseIn } from '../animations/transitions'
import { construirLinkMapa } from '../utils/compartirUbicacion'
import { verUbicacion } from '../utils/ubicacionEnVivo'

// Página pública que abre el contacto de confianza desde WhatsApp. No pide
// cuenta: el token del enlace es lo único que da acceso. Consulta cada 10 s
// (sin Supabase Realtime, ver DECISIONS.md → Ubicación).
const CONSULTA_MS = 10000
// Pasado este tiempo sin actualizaciones, se avisa que el dato puede ser viejo.
const DESACTUALIZADA_MS = 2 * 60 * 1000

function haceCuanto(fecha, ahora) {
  const segundos = Math.max(0, Math.round((ahora - new Date(fecha).getTime()) / 1000))
  if (segundos < 60) return `hace ${segundos} s`
  const minutos = Math.round(segundos / 60)
  if (minutos < 60) return `hace ${minutos} min`
  return `hace ${Math.floor(minutos / 60)} h ${minutos % 60} min`
}

function Mapa({ lat, lng, precision }) {
  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const puntoRef = useRef(null)
  const circuloRef = useRef(null)

  useEffect(() => {
    const mapa = L.map(contenedorRef.current, { zoomControl: true, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; colaboradores de OpenStreetMap',
    }).addTo(mapa)
    mapaRef.current = mapa
    return () => {
      mapa.remove()
      mapaRef.current = null
      puntoRef.current = null
      circuloRef.current = null
    }
  }, [])

  // Mover el punto (y el círculo de precisión) en cada actualización.
  // Leaflet no usa clases de Tailwind: #FF7A59 es el token auxilio-1.
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return
    const posicion = [lat, lng]
    if (!puntoRef.current) {
      circuloRef.current = L.circle(posicion, {
        radius: precision || 0,
        color: '#FF7A59',
        weight: 1,
        fillOpacity: 0.12,
      }).addTo(mapa)
      puntoRef.current = L.circleMarker(posicion, {
        radius: 9,
        color: '#FFFFFF',
        weight: 3,
        fillColor: '#FF7A59',
        fillOpacity: 1,
      }).addTo(mapa)
      mapa.setView(posicion, 16)
    } else {
      puntoRef.current.setLatLng(posicion)
      circuloRef.current.setLatLng(posicion).setRadius(precision || 0)
      mapa.panTo(posicion)
    }
  }, [lat, lng, precision])

  return (
    <div
      ref={contenedorRef}
      role="img"
      aria-label="Mapa con la ubicación compartida"
      className="h-[52vh] min-h-[280px] w-full overflow-hidden rounded-lg"
    />
  )
}

export default function UbicacionCompartida() {
  const { token } = useParams()
  // 'cargando' | 'no-encontrada' | 'terminada' | 'activa'
  const [estado, setEstado] = useState('cargando')
  const [datos, setDatos] = useState(null)
  const [sinConexion, setSinConexion] = useState(false)
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    let cancelado = false
    let temporizador = null

    const consultar = async () => {
      try {
        const resultado = await verUbicacion(token)
        if (cancelado) return
        setSinConexion(false)
        setAhora(Date.now())
        if (!resultado) {
          setEstado('no-encontrada')
          return
        }
        setDatos(resultado)
        if (resultado.estado !== 'activa') {
          setEstado('terminada')
          return
        }
        setEstado('activa')
      } catch {
        if (!cancelado) setSinConexion(true)
      }
      if (!cancelado) temporizador = setTimeout(consultar, CONSULTA_MS)
    }

    consultar()
    return () => {
      cancelado = true
      clearTimeout(temporizador)
    }
  }, [token])

  // Que el "hace X s" avance entre consultas.
  useEffect(() => {
    if (estado !== 'activa') return undefined
    const id = setInterval(() => setAhora(Date.now()), 5000)
    return () => clearInterval(id)
  }, [estado])

  const tienePosicion = estado === 'activa' && datos?.lat != null
  const desactualizada =
    tienePosicion && ahora - new Date(datos.actualizada_at).getTime() > DESACTUALIZADA_MS

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      <div className="isla-resplandor isla-resplandor--auxilio pointer-events-none absolute inset-x-0 top-0 h-[45vh]" aria-hidden="true" />
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-16 pt-[calc(2rem+env(safe-area-inset-top))]">
        <p className="mb-6 font-display text-[18px] uppercase tracking-[2px] text-white/80">Calma</p>

        {estado === 'cargando' && (
          <div className="flex justify-center py-16">
            <span
              aria-hidden="true"
              className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            <span className="sr-only">Cargando ubicación…</span>
          </div>
        )}

        {estado === 'no-encontrada' && (
          <motion.div {...riseIn(0)}>
            <h1 className="text-[26px] font-semibold leading-tight text-white">Enlace no válido</h1>
            <p className="mt-2 text-[15px] text-white/75">
              Este enlace de ubicación no existe. Revisa que lo hayas copiado completo.
            </p>
          </motion.div>
        )}

        {estado === 'terminada' && (
          <motion.div {...riseIn(0)}>
            <h1 className="text-[26px] font-semibold leading-tight text-white">
              Ya no se está compartiendo
            </h1>
            <p className="mt-2 text-[15px] text-white/75">
              La persona detuvo el seguimiento o se acabó el tiempo. Su ubicación ya no está
              disponible.
            </p>
          </motion.div>
        )}

        {estado === 'activa' && (
          <motion.div {...riseIn(0)}>
            <h1 className="text-[26px] font-semibold leading-tight text-white">
              Ubicación de {datos.nombre}
            </h1>
            <p className="mt-1.5 flex items-center gap-2 text-[15px] text-white/75" aria-live="polite">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-auxilio-1 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-auxilio-1" />
              </span>
              {tienePosicion
                ? `En vivo · actualizada ${haceCuanto(datos.actualizada_at, ahora)}`
                : 'Esperando la primera ubicación…'}
            </p>

            {desactualizada && (
              <p role="alert" className="mt-4 rounded-lg border border-faro-2/40 bg-faro-1/[0.15] px-4 py-3 text-sm text-white">
                No llegan actualizaciones hace un rato. Puede que haya cerrado Calma, bloqueado el
                teléfono o perdido señal. Este es el último lugar conocido.
              </p>
            )}

            {tienePosicion && (
              <>
                <div className="mt-5">
                  <Mapa lat={datos.lat} lng={datos.lng} precision={datos.precision_m} />
                </div>
                {datos.precision_m != null && (
                  <p className="mt-2 text-[13px] text-white/60">
                    Precisión aproximada: {Math.round(datos.precision_m)} m
                  </p>
                )}
                <a
                  href={construirLinkMapa(datos.lat, datos.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full rounded-full bg-white py-3.5 text-center text-sm font-bold text-brand-navyDeep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  Abrir en Google Maps
                </a>
              </>
            )}

            <p className="mt-4 text-[13px] text-white/60">
              Se comparte hasta las{' '}
              {new Date(datos.expira_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}.
            </p>
          </motion.div>
        )}

        {sinConexion && (
          <p role="status" className="mt-4 text-sm text-white/70">
            Sin conexión. Seguimos intentando…
          </p>
        )}

        {estado !== 'cargando' && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-[13.5px] leading-snug text-white/75">
            Si crees que esta persona está en peligro, llama a la línea de emergencias{' '}
            <a href="tel:123" className="font-semibold text-white underline underline-offset-2">
              123
            </a>
            .
          </div>
        )}
      </div>
    </div>
  )
}
