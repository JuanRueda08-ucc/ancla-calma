// PRIVACIDAD: la ubicación obtenida aquí (lat/lng) nunca se persiste — no se
// guarda en localStorage, IndexedDB, ni en ningún estado de React que
// sobreviva fuera de la función que la solicita. Se usa una sola vez para
// construir el mensaje de WhatsApp y se descarta de inmediato al terminar
// esa llamada. Ningún otro módulo de la app debe cachear el resultado de
// obtenerUbicacion().

export function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject({ code: 'NO_SUPPORT' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      (error) => {
        // Propagamos el error nativo (con su .code: PERMISSION_DENIED,
        // POSITION_UNAVAILABLE o TIMEOUT) tal cual, sin envolverlo.
        reject(error)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  })
}

export function construirLinkMapa(lat, lng) {
  return `https://maps.google.com/?q=${lat},${lng}`
}

// wa.me (el esquema "click to chat" de WhatsApp) solo acepta dígitos —
// código de país + número, sin "+", espacios, guiones ni paréntesis.
// Abrir esta URL nunca envía el mensaje automáticamente: solo abre el chat
// con el texto pre-rellenado, y el usuario debe confirmar el envío desde
// WhatsApp. Esa confirmación manual es una limitación intencional del
// esquema click-to-chat, no un bug de esta integración.
export function construirLinkWhatsApp(telefonoConCodigoPais, mensaje) {
  const soloDigitos = telefonoConCodigoPais.replace(/\D/g, '')
  return `https://wa.me/${soloDigitos}?text=${encodeURIComponent(mensaje)}`
}
