import { supabase } from '../lib/supabaseClient'

const COLUMNAS = 'id, icon, label, favorite, orden'

export const HERRAMIENTAS_INICIALES = [
  { icon: '🎵', label: 'Escuchar música tranquila' },
  { icon: '🚶', label: 'Dar un paseo' },
  { icon: '📞', label: 'Llamar a alguien de confianza' },
  { icon: '🫁', label: 'Respirar profundo' },
]

async function getUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user.id
}

// Evita sembrar dos veces si la carga se dispara en paralelo
// (p. ej. el doble efecto de StrictMode en desarrollo).
let sembrando = null

async function sembrarIniciales() {
  const userId = await getUserId()
  const filas = HERRAMIENTAS_INICIALES.map((h, i) => ({ ...h, user_id: userId, orden: i }))
  const { data, error } = await supabase.from('herramientas_faro').insert(filas).select(COLUMNAS)
  if (error) throw error
  return data.sort((a, b) => a.orden - b.orden)
}

// Devuelve las herramientas en orden; si la persona no tiene ninguna
// (primera visita), siembra las 4 iniciales.
export async function getHerramientas() {
  const { data, error } = await supabase
    .from('herramientas_faro')
    .select(COLUMNAS)
    .order('orden')
    .order('created_at')

  if (error) throw error
  if (data.length > 0) return data

  if (!sembrando) {
    sembrando = sembrarIniciales().finally(() => {
      sembrando = null
    })
  }
  return sembrando
}

export async function crearHerramienta({ icon, label, orden }) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('herramientas_faro')
    .insert({ user_id: userId, icon, label, orden })
    .select(COLUMNAS)
    .single()

  if (error) throw new Error('No pudimos guardar la herramienta. Intenta de nuevo.')
  return data
}

export async function actualizarHerramienta(id, cambios) {
  const { error } = await supabase.from('herramientas_faro').update(cambios).eq('id', id)
  if (error) throw new Error('No pudimos guardar el cambio. Intenta de nuevo.')
}

export async function eliminarHerramienta(id) {
  const { error } = await supabase.from('herramientas_faro').delete().eq('id', id)
  if (error) throw new Error('No pudimos eliminar la herramienta. Intenta de nuevo.')
}

// Reescribe `orden` según la posición en la lista. Solo toca las filas
// cuyo orden cambió.
export async function guardarOrden(herramientas) {
  const cambios = herramientas
    .map((h, i) => ({ id: h.id, orden: i, anterior: h.orden }))
    .filter((h) => h.orden !== h.anterior)

  const resultados = await Promise.all(
    cambios.map(({ id, orden }) => supabase.from('herramientas_faro').update({ orden }).eq('id', id)),
  )
  if (resultados.some((r) => r.error)) {
    throw new Error('No pudimos guardar el nuevo orden. Intenta de nuevo.')
  }
}
