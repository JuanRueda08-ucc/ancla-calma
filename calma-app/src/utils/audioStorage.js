import { supabase } from '../lib/supabaseClient'

const BUCKET = 'notas-voz'

function rutaAudio(userId, entradaId) {
  return `${userId}/${entradaId}.webm`
}

async function idUsuarioActual() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user.id
}

function esErrorNoEncontrado(error) {
  return error?.statusCode === '404' || /not.?found/i.test(error?.message ?? '')
}

export async function guardarAudio(entradaId, blob) {
  const userId = await idUsuarioActual()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(rutaAudio(userId, entradaId), blob, { upsert: true })

  if (error) throw error
}

export async function obtenerAudio(entradaId) {
  const userId = await idUsuarioActual()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(rutaAudio(userId, entradaId))

  if (error) {
    if (esErrorNoEncontrado(error)) return null
    throw error
  }

  return data
}

export async function eliminarAudio(entradaId) {
  const userId = await idUsuarioActual()
  const { error } = await supabase.storage.from(BUCKET).remove([rutaAudio(userId, entradaId)])

  if (error) throw error
}
