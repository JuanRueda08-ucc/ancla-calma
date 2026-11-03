import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { construirLinkWhatsApp } from '../utils/compartirUbicacion'
import {
  DURACIONES_MIN,
  construirEnlaceSeguimiento,
  etiquetaDuracion,
} from '../utils/ubicacionEnVivo'
import { useUbicacionEnVivo } from '../utils/useUbicacionEnVivo'
import { useTextos } from '../i18n'
import TEXTOS from '../i18n/textos/islaAuxilio'

const cardClass = 'rounded-lg bg-white p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]'
const botonPrincipal =
  'rounded-full bg-gradient-to-br from-auxilio-1 to-auxilio-2 text-sm font-bold text-white shadow-[0_10px_20px_rgba(255,122,89,0.25)] disabled:opacity-70'
const botonSecundario = 'rounded-full bg-black/10 text-sm font-semibold text-ink disabled:opacity-70'

function minutosRestantes(expiraAt) {
  return Math.max(0, Math.ceil((new Date(expiraAt).getTime() - Date.now()) / 60000))
}

function textoRestante(minutos, t) {
  if (minutos <= 1) return t.menosDeUnMin
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

function abrirWhatsApp(contacto, token, duracionMin, t) {
  const mensaje = t.mensaje(etiquetaDuracion(duracionMin), construirEnlaceSeguimiento(token))
  // location.href (no window.open): mismo motivo que en "Compartir mi
  // ubicación" — no lo bloquea el navegador tras una espera asíncrona, y en
  // el celular el sistema abre WhatsApp dejando Calma de fondo.
  window.location.href = construirLinkWhatsApp(contacto.telefono, mensaje)
}

// Bloque "Compartir ubicación en vivo" de la Isla del Auxilio (solo con
// sesión). El paso a paso es: duración → contacto → enlace por WhatsApp.
export default function UbicacionEnVivoPanel({ contactos, onAgregarContacto, onEditarContacto }) {
  const { estado, sesion, error, iniciar, detener } = useUbicacionEnVivo()
  const textos = useTextos(TEXTOS)
  const t = textos.enVivo

  // null | 'duracion' | 'contacto' | 'sin-contacto' | 'sin-codigo-pais'
  const [paso, setPaso] = useState(null)
  const [duracion, setDuracion] = useState(null)
  const [contactoProblema, setContactoProblema] = useState(null)

  // Re-render periódico para que la cuenta regresiva avance.
  const [, setPulso] = useState(0)
  useEffect(() => {
    if (!sesion) return undefined
    const id = setInterval(() => setPulso((n) => n + 1), 20000)
    return () => clearInterval(id)
  }, [sesion])
  const restante = sesion ? minutosRestantes(sesion.expira_at) : 0

  const cerrar = () => {
    setPaso(null)
    setDuracion(null)
    setContactoProblema(null)
  }

  const elegirDuracion = (minutos) => {
    setDuracion(minutos)
    if (contactos.length === 0) {
      setPaso('sin-contacto')
    } else if (contactos.length === 1) {
      elegirContacto(contactos[0], minutos)
    } else {
      setPaso('contacto')
    }
  }

  const elegirContacto = async (contacto, minutos = duracion) => {
    if (!contacto.telefono.trim().startsWith('+')) {
      setContactoProblema(contacto)
      setPaso('sin-codigo-pais')
      return
    }

    // Con sesión activa solo se reenvía el enlace a otro contacto.
    if (sesion) {
      cerrar()
      abrirWhatsApp(contacto, sesion.token, sesion.duracion_min, t)
      return
    }

    cerrar()
    const nueva = await iniciar(minutos)
    if (nueva) abrirWhatsApp(contacto, nueva.token, nueva.duracion_min, t)
  }

  if (estado === 'cargando') return null

  if (estado === 'iniciando') {
    return (
      <div className={`mb-9 flex items-center gap-3 ${cardClass}`}>
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-auxilio-1/30 border-t-auxilio-1"
        />
        <p className="text-sm text-ink-soft">{textos.obteniendoUbicacion}</p>
      </div>
    )
  }

  return (
    <div className="mb-9">
      {estado === 'activa' && sesion && paso === null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cardClass}
          role="status"
        >
          <div className="mb-2 flex items-center gap-2.5">
            <span className="relative flex h-3 w-3" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-auxilio-1 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-auxilio-1" />
            </span>
            <p className="text-[15px] font-semibold text-ink">{t.compartiendo}</p>
          </div>
          <p className="text-sm text-ink-soft">{t.terminaEn(textoRestante(restante, t))}</p>
          <p className="mt-2 text-[13px] leading-snug text-ink-soft">
            {t.mantenAbierta}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={detener} className={`py-3 ${botonPrincipal}`}>
              {t.detener}
            </button>
            <button
              type="button"
              onClick={() => (contactos.length === 1 ? elegirContacto(contactos[0]) : setPaso('contacto'))}
              className={`py-2.5 ${botonSecundario}`}
            >
              {t.otroContacto}
            </button>
          </div>
        </motion.div>
      )}

      {estado === 'inactiva' && paso === null && (
        <button
          type="button"
          onClick={() => setPaso('duracion')}
          className="flex min-h-[68px] w-full items-center gap-3 rounded-full border border-cielo/20 bg-white/[0.08] py-3 pl-3 pr-5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cielo/30"
        >
          <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-auxilio-1" />
            <span className="absolute h-6 w-6 rounded-full border-2 border-auxilio-1/50" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-cielo">{t.boton}</span>
            <span className="block text-[13px] text-cielo/60">{t.botonDetalle}</span>
          </span>
        </button>
      )}

      {paso === 'duracion' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <p className="mb-1 text-sm font-semibold text-ink">{t.cuantoTiempo}</p>
          <p className="mb-4 text-[13px] leading-snug text-ink-soft">
            {t.explicacion}
          </p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {DURACIONES_MIN.map((minutos) => (
              <button
                key={minutos}
                type="button"
                onClick={() => elegirDuracion(minutos)}
                className="rounded-lg border border-auxilio-1/30 bg-auxilio-bg py-3 text-[15px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-auxilio-1/40"
              >
                {etiquetaDuracion(minutos)}
              </button>
            ))}
          </div>
          <button type="button" onClick={cerrar} className={`w-full py-2.5 ${botonSecundario}`}>
            {textos.cancelar}
          </button>
        </motion.div>
      )}

      {paso === 'contacto' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <p className="mb-3 text-sm font-semibold text-ink">{t.aQuien}</p>
          <div className="flex flex-col gap-2">
            {contactos.map((contacto) => (
              <button
                key={contacto.id}
                type="button"
                onClick={() => elegirContacto(contacto)}
                className="rounded-lg bg-auxilio-bg px-4 py-3 text-left text-[14.5px] font-semibold text-ink"
              >
                {contacto.nombre}
              </button>
            ))}
          </div>
          <button type="button" onClick={cerrar} className={`mt-3 w-full py-2.5 ${botonSecundario}`}>
            {textos.cancelar}
          </button>
        </motion.div>
      )}

      {paso === 'sin-contacto' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-center ${cardClass}`}>
          <p className="mb-3 text-sm text-ink-soft">
            {textos.primeroUnContacto}
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                cerrar()
                onAgregarContacto()
              }}
              className={`px-5 py-2.5 ${botonPrincipal}`}
            >
              {t.agregarContacto}
            </button>
            <button type="button" onClick={cerrar} className={`px-5 py-2.5 ${botonSecundario}`}>
              {textos.cancelar}
            </button>
          </div>
        </motion.div>
      )}

      {paso === 'sin-codigo-pais' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-center ${cardClass}`}>
          <p className="mb-3 text-sm text-ink-soft">
            {t.sinCodigoPais(contactoProblema?.nombre)}
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                const contacto = contactoProblema
                cerrar()
                onEditarContacto(contacto)
              }}
              className={`px-5 py-2.5 ${botonPrincipal}`}
            >
              {textos.editarContacto}
            </button>
            <button type="button" onClick={cerrar} className={`px-5 py-2.5 ${botonSecundario}`}>
              {textos.cancelar}
            </button>
          </div>
        </motion.div>
      )}

      {error && paso === null && (
        <p role="alert" className="mt-3 rounded-lg bg-white/[0.08] px-4 py-3 text-sm text-cielo">
          {error}
        </p>
      )}
    </div>
  )
}
