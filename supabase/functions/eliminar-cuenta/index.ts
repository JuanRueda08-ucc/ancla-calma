// supabase/functions/eliminar-cuenta/index.ts
//
// Elimina la cuenta del usuario que llama a esta función — nunca acepta
// un user_id desde el cliente, siempre identifica a quien llama a partir
// de su propio token de sesión, para que nadie pueda borrar la cuenta de
// otra persona.
//
// Usa las claves nuevas de Supabase (SUPABASE_SECRET_KEYS /
// SUPABASE_PUBLISHABLE_KEYS, formato sb_secret_.../sb_publishable_...),
// con fallback a las claves legacy solo por si el proyecto no las tuviera
// provisionadas todavía.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function leerClave(nombreNuevo: string, nombreLegacy: string): string {
  const nuevo = Deno.env.get(nombreNuevo)
  if (nuevo) {
    try {
      const dict = JSON.parse(nuevo)
      if (dict.default) return dict.default
    } catch {
      // si no es JSON, es porque ya viene como string plano
      return nuevo
    }
  }
  const legacy = Deno.env.get(nombreLegacy)
  if (legacy) return legacy
  throw new Error(`No se encontró ni ${nombreNuevo} ni ${nombreLegacy}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Falta autenticación' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const publishableKey = leerClave('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY')
    const secretKey = leerClave('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY')

    // Cliente "como el usuario" — solo para confirmar quién llama de verdad,
    // a partir de su propio token, nunca confiando en nada que mande el body.
    const supabaseUsuario = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: errorUsuario } = await supabaseUsuario.auth.getUser()
    if (errorUsuario || !user) {
      return new Response(JSON.stringify({ error: 'Sesión inválida o expirada' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cliente con privilegios elevados — SOLO se usa a partir de aquí,
    // nunca antes de haber confirmado la identidad real de quien llama.
    const supabaseAdmin = createClient(supabaseUrl, secretKey)

    // 1. Borrar el audio de Storage — no cae en cascada automáticamente
    //    desde auth.users, hay que limpiarlo explícitamente.
    const { data: archivos, error: errorListar } = await supabaseAdmin
      .storage
      .from('notas-voz')
      .list(user.id)

    if (!errorListar && archivos && archivos.length > 0) {
      const rutas = archivos.map((f) => `${user.id}/${f.name}`)
      await supabaseAdmin.storage.from('notas-voz').remove(rutas)
    }

    // 2. Borrar el usuario de Auth — esto SÍ cae en cascada hacia
    //    profiles, contactos_confianza, y bitacora_entradas (ya
    //    configurado con "on delete cascade" desde el esquema inicial).
    const { error: errorEliminar } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (errorEliminar) {
      console.error('Error eliminando usuario:', errorEliminar)
      return new Response(JSON.stringify({ error: 'No se pudo eliminar la cuenta' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error inesperado:', err)
    return new Response(JSON.stringify({ error: 'Error inesperado en el servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})