import { vi } from 'vitest'

// Cliente de Supabase falso para pruebas de componentes. Cada prueba decide
// qué devuelve cada tabla con `respuestas`, sin tocar la base real.
// `retrasoLoginMs` simula una red lenta: la sesión llega (SIGNED_IN) pero la
// promesa de signInWithPassword tarda en resolver.
export function crearSupabaseFalso({ sesion = null, respuestas = {}, retrasoLoginMs = 0 } = {}) {
  const oyentes = new Set()
  let sesionActual = sesion

  const consulta = (tabla) => {
    const resultado = () => Promise.resolve(respuestas[tabla] ?? { data: [], error: null })
    const cadena = {
      select: () => cadena,
      insert: () => cadena,
      update: () => cadena,
      delete: () => cadena,
      eq: () => cadena,
      is: () => cadena,
      gt: () => cadena,
      order: () => cadena,
      limit: () => cadena,
      single: resultado,
      maybeSingle: resultado,
      then: (ok, error) => resultado().then(ok, error),
    }
    return cadena
  }

  const cliente = {
    from: vi.fn(consulta),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    functions: { invoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null })) },
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: sesionActual } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: sesionActual?.user ?? null } })),
      onAuthStateChange: vi.fn((callback) => {
        oyentes.add(callback)
        return { data: { subscription: { unsubscribe: () => oyentes.delete(callback) } } }
      }),
      // Como en Supabase real: avisa SIGNED_IN y React alcanza a redibujar
      // ANTES de que la promesa resuelva. Ese orden es el que causaba que
      // Login mandara a /islas en vez de volver a la pantalla de origen.
      signInWithPassword: vi.fn(async () => {
        sesionActual = { user: { id: 'usuario-prueba', email: 'prueba@calma.test' } }
        oyentes.forEach((callback) => callback('SIGNED_IN', sesionActual))
        await new Promise((resolver) => setTimeout(resolver, retrasoLoginMs))
        return { data: { session: sesionActual }, error: null }
      }),
      signUp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signOut: vi.fn(async () => {
        sesionActual = null
        oyentes.forEach((callback) => callback('SIGNED_OUT', null))
        return { error: null }
      }),
      updateUser: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
  }
  return cliente
}
