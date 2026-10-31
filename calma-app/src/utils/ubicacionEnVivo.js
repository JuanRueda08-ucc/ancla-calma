import { supabase } from '../lib/supabaseClient'

// "Compartir ubicación en vivo": a diferencia de compartirUbicacion.js
// (snapshot que se calcula y se descarta), aquí la posición SÍ viaja a
// Supabase, pero solo el último punto (se sobrescribe, nunca un recorrido)
// y se borra al detener o vencer la sesión. Ver DECISIONS.md → Ubicación.

export const DURACIONES_MIN = [15, 60, 240]

// Actualizar como máximo cada 15 s, o antes si la persona se movió > 25 m.
export const INTERVALO_MIN_MS = 15000
export const DISTANCIA_MIN_M = 25

export function construirEnlaceSeguimiento(token) {
  return `${window.location.origin}/ubicacion/${token}`
}

export function etiquetaDuracion(minutos) {
  return minutos < 60 ? `${minutos} min` : `${minutos / 60} h`
}

// Distancia aproximada en metros entre dos puntos (haversine).
export function distanciaMetros(a, b) {
  const rad = (grados) => (grados * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(h))
}

export async function getSesionActiva() {
  const { data, error } = await supabase
    .from('ubicaciones_en_vivo')
    .select('id, token, duracion_min, expira_at')
    .is('detenida_at', null)
    .gt('expira_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// El vencimiento y el token los pone la base de datos; iniciar una sesión
// nueva detiene cualquier otra que siguiera activa.
export async function iniciarSesion(duracionMin, posicion) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('ubicaciones_en_vivo')
    .insert({
      user_id: user.id,
      duracion_min: duracionMin,
      lat: posicion.lat,
      lng: posicion.lng,
      precision_m: posicion.precision,
    })
    .select('id, token, duracion_min, expira_at')
    .single()

  if (error) throw new Error('No pudimos iniciar el seguimiento. Intenta de nuevo.')
  return data
}

export async function actualizarPosicion(id, posicion) {
  const { error } = await supabase
    .from('ubicaciones_en_vivo')
    .update({ lat: posicion.lat, lng: posicion.lng, precision_m: posicion.precision })
    .eq('id', id)

  if (error) throw error
}

// Al detener, la base de datos borra las coordenadas (trigger).
export async function detenerSesion(id) {
  const { error } = await supabase
    .from('ubicaciones_en_vivo')
    .update({ detenida_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// Para la página pública del contacto (sin cuenta): solo devuelve algo si
// el token coincide exactamente. null = el enlace no existe.
export async function verUbicacion(token) {
  const { data, error } = await supabase.rpc('ver_ubicacion_en_vivo', { p_token: token })
  if (error) throw error
  return data?.[0] ?? null
}
