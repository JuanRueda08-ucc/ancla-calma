import { supabase } from '../lib/supabaseClient'

const LIMITE_CONTACTOS_MSG = 'Máximo 3 contactos de confianza por usuario'

export async function getContactos() {
  const { data, error } = await supabase
    .from('contactos_confianza')
    .select('*')
    .order('created_at')

  if (error) throw error
  return data
}

export async function guardarContacto({ id, nombre, telefono }) {
  let query

  if (id) {
    query = supabase.from('contactos_confianza').update({ nombre, telefono }).eq('id', id)
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    query = supabase.from('contactos_confianza').insert({ user_id: user.id, nombre, telefono })
  }

  const { data, error } = await query.select().single()

  if (error) {
    if (error.message === LIMITE_CONTACTOS_MSG) {
      throw new Error(LIMITE_CONTACTOS_MSG)
    }
    throw new Error('No pudimos guardar el contacto. Intenta de nuevo.')
  }

  return data
}

export async function eliminarContacto(id) {
  const { error } = await supabase.from('contactos_confianza').delete().eq('id', id)
  if (error) throw error
}
