const STORAGE_KEY = 'calma:contactos'
const MAX_CONTACTOS = 3

function generarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getContactos() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function guardarContacto(contacto) {
  const contactos = getContactos()
  const existente = contacto.id ? contactos.find((c) => c.id === contacto.id) : null

  if (!existente && contactos.length >= MAX_CONTACTOS) {
    throw new Error('Máximo 3 contactos de confianza')
  }

  let contactoGuardado
  let actualizados

  if (existente) {
    contactoGuardado = { ...existente, ...contacto }
    actualizados = contactos.map((c) => (c.id === contacto.id ? contactoGuardado : c))
  } else {
    contactoGuardado = { ...contacto, id: generarId() }
    actualizados = [...contactos, contactoGuardado]
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados))
  return contactoGuardado
}

export function eliminarContacto(id) {
  const contactos = getContactos().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos))
  return contactos
}
