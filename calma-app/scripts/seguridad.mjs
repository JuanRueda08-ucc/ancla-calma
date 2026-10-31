// Prueba de seguridad de la base de datos REAL, como usuario anónimo (lo que
// puede hacer cualquiera con la clave pública de la app, sin cuenta).
// Comprueba que nadie sin sesión pueda leer, crear, cambiar ni borrar datos,
// y que la función pública de ubicación no entregue nada sin el token exacto.
//
// Solo lee o intenta escribir y espera que se lo rechacen: no cambia nada.
// No corre en cada PR (habla con producción); se ejecuta a mano:
//   npm run test:seguridad
// Usa VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY del entorno o de .env.local.

import { readFileSync } from 'node:fs'

function leerEntorno() {
  const vars = { ...process.env }
  try {
    for (const linea of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
      const coincide = linea.match(/^\s*(VITE_SUPABASE_[A-Z_]+)\s*=\s*(.*?)\s*$/)
      if (coincide && !vars[coincide[1]]) vars[coincide[1]] = coincide[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // sin .env.local: se usan solo las variables de entorno
  }
  return vars
}

const { VITE_SUPABASE_URL: URL_BASE, VITE_SUPABASE_ANON_KEY: CLAVE } = leerEntorno()
if (!URL_BASE || !CLAVE) {
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (entorno o calma-app/.env.local).')
  process.exit(2)
}

const TABLAS = ['contactos_confianza', 'bitacora_entradas', 'profiles', 'herramientas_faro', 'ubicaciones_en_vivo']
const ID_FALSO = '00000000-0000-0000-0000-000000000000'
const cabeceras = {
  apikey: CLAVE,
  Authorization: `Bearer ${CLAVE}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(`${URL_BASE}${ruta}`, { ...opciones, headers: { ...cabeceras, ...opciones.headers } })
  let cuerpo = null
  try {
    cuerpo = await respuesta.json()
  } catch {
    // respuesta sin JSON
  }
  return { estado: respuesta.status, cuerpo }
}

// "Bloqueado" = rechazado (4xx) o, si la petición pasa, sin ningún dato.
const bloqueado = ({ estado, cuerpo }) =>
  (estado >= 400 && estado < 500) || (estado >= 200 && estado < 300 && Array.isArray(cuerpo) && cuerpo.length === 0)
const rechazado = ({ estado }) => estado >= 400 && estado < 500
const listaVacia = ({ estado, cuerpo }) => estado === 200 && Array.isArray(cuerpo) && cuerpo.length === 0

const pruebas = []
const prueba = (nombre, ejecutar, cumple) => pruebas.push({ nombre, ejecutar, cumple })

for (const tabla of TABLAS) {
  prueba(`${tabla}: anónimo no puede leer`, () => pedir(`/rest/v1/${tabla}?select=*&limit=1`), bloqueado)
  prueba(`${tabla}: anónimo no puede crear`, () => pedir(`/rest/v1/${tabla}`, { method: 'POST', body: '{}' }), rechazado)
  prueba(
    `${tabla}: anónimo no puede cambiar`,
    () => pedir(`/rest/v1/${tabla}?id=eq.${ID_FALSO}`, { method: 'PATCH', body: '{"updated_at":"2000-01-01"}' }),
    bloqueado,
  )
  prueba(`${tabla}: anónimo no puede borrar`, () => pedir(`/rest/v1/${tabla}?id=eq.${ID_FALSO}`, { method: 'DELETE' }), bloqueado)
}

const verUbicacion = (token) =>
  pedir('/rest/v1/rpc/ver_ubicacion_en_vivo', { method: 'POST', body: JSON.stringify({ p_token: token }) })
prueba('ver_ubicacion_en_vivo: token inexistente no devuelve nada', () => verUbicacion('0'.repeat(64)), listaVacia)
prueba('ver_ubicacion_en_vivo: token mal formado no devuelve nada', () => verUbicacion('abc'), listaVacia)
prueba("ver_ubicacion_en_vivo: intento de inyección no devuelve nada", () => verUbicacion("' or '1'='1"), listaVacia)
prueba('ver_ubicacion_en_vivo: token vacío no devuelve nada', () => verUbicacion(''), listaVacia)

for (const interna of ['handle_new_user', 'enforce_max_contactos', 'ubicacion_en_vivo_al_crear', 'set_updated_at']) {
  prueba(`función interna ${interna}: anónimo no la puede llamar`, () => pedir(`/rest/v1/rpc/${interna}`, { method: 'POST', body: '{}' }), rechazado)
}

prueba(
  'notas de voz (Storage): anónimo no puede listar archivos',
  () => pedir('/storage/v1/object/list/notas-voz', { method: 'POST', body: '{"prefix":"","limit":1}' }),
  bloqueado,
)

let fallas = 0
for (const { nombre, ejecutar, cumple } of pruebas) {
  try {
    const resultado = await ejecutar()
    const ok = cumple(resultado)
    if (!ok) fallas += 1
    console.log(`${ok ? '✓' : '✗'} ${nombre}${ok ? '' : `  (HTTP ${resultado.estado}: ${JSON.stringify(resultado.cuerpo)?.slice(0, 120)})`}`)
  } catch (error) {
    fallas += 1
    console.log(`✗ ${nombre}  (error de red: ${error.message})`)
  }
}

console.log(`\n${pruebas.length - fallas}/${pruebas.length} comprobaciones de seguridad correctas`)
process.exit(fallas ? 1 : 0)
