import { supabase } from '../lib/supabaseClient'
import { eliminarAudio } from './audioStorage'

// La tabla usa columnas snake_case; el resto de la app (Bitacora.jsx,
// HistorialBitacora.jsx) trabaja con los mismos nombres camelCase que
// usaba la versión de localStorage. Este mapeo es el único lugar que
// conoce ambas formas.
function mapearDesdeFila(fila) {
  return {
    id: fila.id,
    fecha: fila.created_at,
    tags: fila.tags,
    emocionLibre: fila.emocion_libre,
    queEstoySintiendo: fila.que_siento,
    queOcurrio: fila.que_ocurrio,
    queNecesito: fila.que_necesito,
    queMeAyudo: fila.que_ayudo,
    tieneNotaDeVoz: fila.tiene_nota_voz,
    notaVozDuracion: fila.nota_voz_duracion,
  }
}

export async function getEntradas() {
  const { data, error } = await supabase
    .from('bitacora_entradas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapearDesdeFila)
}

export async function guardarEntrada(entrada) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('bitacora_entradas')
    .insert({
      user_id: user.id,
      tags: entrada.tags,
      emocion_libre: entrada.emocionLibre,
      que_siento: entrada.queEstoySintiendo,
      que_ocurrio: entrada.queOcurrio,
      que_necesito: entrada.queNecesito,
      que_ayudo: entrada.queMeAyudo,
      tiene_nota_voz: entrada.tieneNotaDeVoz,
      nota_voz_duracion: entrada.notaVozDuracion,
    })
    .select()
    .single()

  if (error) throw error
  return mapearDesdeFila(data)
}

export async function eliminarEntrada(id) {
  // Best-effort: si el archivo de Storage no se puede borrar, no dejamos
  // la fila de texto huérfana en la base de datos por eso.
  try {
    await eliminarAudio(id)
  } catch (error) {
    console.error('No se pudo eliminar el audio asociado a la entrada:', error)
  }

  const { error } = await supabase.from('bitacora_entradas').delete().eq('id', id)
  if (error) throw error
}
