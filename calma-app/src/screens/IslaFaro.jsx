import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion'
import '../styles/islaNoche.css'
import ScreenHeader from '../components/ScreenHeader'
import StarField from '../components/StarField'
import { riseIn } from '../animations/transitions'

const ICONOS_DISPONIBLES = ['🎵', '🚶', '📞', '🫁', '💧', '😴', '📝', '🎉', '🌳', '🎨']

const HERRAMIENTAS_INICIALES = [
  { id: 'h-1', icon: '🎵', label: 'Escuchar música tranquila', favorite: false },
  { id: 'h-2', icon: '🚶', label: 'Dar un paseo', favorite: false },
  { id: 'h-3', icon: '📞', label: 'Llamar a alguien de confianza', favorite: false },
  { id: 'h-4', icon: '🫁', label: 'Respirar profundo', favorite: false },
]

const inputClass =
  'w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14.5px] text-ink placeholder:text-ink-soft/50 focus:border-faro-1 focus:outline-none'

function EstrellaIcon({ llena, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"
        fill={llena ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrastrarIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  )
}

function BotonFavorito({ item, onToggleFavorito, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onToggleFavorito(item.id)}
      aria-label={item.favorite ? `Quitar ${item.label} de favoritas` : `Marcar ${item.label} como favorita`}
      aria-pressed={item.favorite}
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
        item.favorite ? 'text-faro-2' : 'text-white/40'
      } ${className}`}
    >
      <EstrellaIcon llena={item.favorite} className="h-5 w-5" />
    </button>
  )
}

function HerramientaRow({
  item,
  administrando,
  isEditing,
  textoEdicion,
  setTextoEdicion,
  confirmandoEliminar,
  onToggleFavorito,
  onIniciarEdicion,
  onConfirmarEdicion,
  onCancelarEdicion,
  onSolicitarEliminar,
  onConfirmarEliminar,
  onCancelarEliminar,
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5"
    >
      <div className="flex items-center gap-3">
        {/* reordenar solo en modo Administrar, para no arrastrar por accidente */}
        {administrando && (
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            aria-label={`Arrastrar ${item.label} para reordenar`}
            className="cursor-grab touch-none select-none text-white/40 active:cursor-grabbing"
          >
            <ArrastrarIcon className="h-5 w-5" />
          </button>
        )}

        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xl">
          {item.icon}
        </span>

        {isEditing ? (
          <input
            autoFocus
            value={textoEdicion}
            onChange={(e) => setTextoEdicion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirmarEdicion(item.id)
              if (e.key === 'Escape') onCancelarEdicion()
            }}
            aria-label="Nombre de la herramienta"
            className="min-w-0 flex-1 border-b border-white/30 bg-transparent py-1 text-[15px] text-white outline-none focus:border-faro-2"
          />
        ) : (
          <span className="min-w-0 flex-1 text-[15px] text-white">{item.label}</span>
        )}

        {!isEditing && <BotonFavorito item={item} onToggleFavorito={onToggleFavorito} />}
      </div>

      {isEditing && (
        <div className="mt-2.5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelarEdicion}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-white/70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmarEdicion(item.id)}
            className="rounded-full bg-faro-2 px-4 py-1.5 text-sm font-semibold text-brand-navyDeep"
          >
            Guardar
          </button>
        </div>
      )}

      {administrando && !isEditing && (
        <div className="mt-2.5 flex justify-end gap-2 border-t border-white/10 pt-2.5">
          {confirmandoEliminar ? (
            <>
              <button
                type="button"
                onClick={onCancelarEliminar}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-white/70"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onConfirmarEliminar(item.id)}
                className="whitespace-nowrap rounded-full bg-auxilio-1 px-4 py-1.5 text-sm font-semibold text-white"
              >
                ¿Eliminar?
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onIniciarEdicion(item)}
                aria-label={`Editar ${item.label}`}
                className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onSolicitarEliminar(item.id)}
                aria-label={`Eliminar ${item.label}`}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-auxilio-2"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </Reorder.Item>
  )
}

export default function IslaFaro() {
  const [herramientas, setHerramientas] = useState(HERRAMIENTAS_INICIALES)
  const [editandoId, setEditandoId] = useState(null)
  const [textoEdicion, setTextoEdicion] = useState('')
  const [confirmarEliminarId, setConfirmarEliminarId] = useState(null)
  const confirmarTimeoutRef = useRef(null)
  // Editar, eliminar y reordenar quedan detrás de "Administrar".
  const [administrando, setAdministrando] = useState(false)
  const [formAbierto, setFormAbierto] = useState(false)

  const [nuevoIcono, setNuevoIcono] = useState(ICONOS_DISPONIBLES[0])
  const [nuevoTexto, setNuevoTexto] = useState('')

  useEffect(() => {
    return () => clearTimeout(confirmarTimeoutRef.current)
  }, [])

  const favoritas = herramientas.filter((h) => h.favorite)
  const otras = herramientas.filter((h) => !h.favorite)

  // La lista reordenable solo muestra las no favoritas; las favoritas
  // conservan su orden y van primero en el estado.
  const reordenarOtras = (nuevasOtras) => {
    setHerramientas([...favoritas, ...nuevasOtras])
  }

  const toggleFavorito = (id) => {
    setHerramientas((prev) =>
      prev.map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h)),
    )
  }

  const iniciarEdicion = (item) => {
    setConfirmarEliminarId(null)
    setEditandoId(item.id)
    setTextoEdicion(item.label)
  }

  const confirmarEdicion = (id) => {
    const texto = textoEdicion.trim()
    if (texto) {
      setHerramientas((prev) => prev.map((h) => (h.id === id ? { ...h, label: texto } : h)))
    }
    setEditandoId(null)
    setTextoEdicion('')
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setTextoEdicion('')
  }

  const solicitarEliminar = (id) => {
    setConfirmarEliminarId(id)
    clearTimeout(confirmarTimeoutRef.current)
    confirmarTimeoutRef.current = setTimeout(() => setConfirmarEliminarId(null), 3000)
  }

  const confirmarEliminar = (id) => {
    // TODO: persistir la eliminación en backend/localStorage cuando exista
    setHerramientas((prev) => prev.filter((h) => h.id !== id))
    setConfirmarEliminarId(null)
    clearTimeout(confirmarTimeoutRef.current)
  }

  const cancelarEliminar = () => {
    setConfirmarEliminarId(null)
    clearTimeout(confirmarTimeoutRef.current)
  }

  const agregarHerramienta = () => {
    const texto = nuevoTexto.trim()
    if (!texto) return
    // TODO: persistir la nueva herramienta en backend/localStorage cuando exista
    setHerramientas((prev) => [
      ...prev,
      { id: `h-${Date.now()}`, icon: nuevoIcono, label: texto, favorite: false },
    ])
    cancelarNuevo()
  }

  const cancelarNuevo = () => {
    setNuevoTexto('')
    setNuevoIcono(ICONOS_DISPONIBLES[0])
    setFormAbierto(false)
  }

  const alternarAdministrar = () => {
    setAdministrando((valor) => !valor)
    cancelarEliminar()
    cancelarEdicion()
  }

  return (
    <div className="isla-noche-bg relative min-h-[100dvh] overflow-hidden">
      {/* luz ámbar: es la isla del faro */}
      <div className="isla-resplandor isla-resplandor--faro pointer-events-none absolute inset-x-0 top-0 h-[55vh]" aria-hidden="true" />
      <StarField />

      <div className="relative z-[2] mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <ScreenHeader backTo="/islas" accountButtonClassName="bg-white/20 text-white" />

        <motion.div {...riseIn(0)} className="mb-8">
          <h1 className="text-[30px] font-semibold leading-tight text-white">Tu faro</h1>
          <p className="mt-1.5 max-w-xs text-[15px] text-white/75">
            Herramientas que te ayudan en momentos difíciles
          </p>
        </motion.div>

        {favoritas.length > 0 && !administrando && (
          <motion.section {...riseIn(0.06)} className="mb-8">
            <h2 className="mb-3 text-[15px] font-semibold text-white">Tus favoritas</h2>
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence initial={false}>
                {favoritas.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-xl border border-faro-2/40 bg-faro-1/[0.22] p-4 pr-10"
                  >
                    <span className="block text-[28px] leading-none">{item.icon}</span>
                    <span className="mt-3 block text-[14.5px] font-semibold leading-snug text-white">
                      {item.label}
                    </span>
                    <BotonFavorito item={item} onToggleFavorito={toggleFavorito} className="absolute right-1.5 top-1.5" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        <motion.div {...riseIn(0.1)} className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">
            {favoritas.length > 0 && !administrando ? 'Otras herramientas' : 'Tus herramientas'}
          </h2>
          {herramientas.length > 0 && (
            <button
              type="button"
              onClick={alternarAdministrar}
              aria-pressed={administrando}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
            >
              {administrando ? 'Listo' : 'Administrar'}
            </button>
          )}
        </motion.div>

        {otras.length === 0 && favoritas.length > 0 && !administrando && (
          <p className="mb-4 text-sm text-white/60">Todas tus herramientas están en favoritas.</p>
        )}

        {/* en modo Administrar la lista muestra todas (también las favoritas) y la
            cuadrícula de favoritas se oculta para no repetirlas */}
        <Reorder.Group
          axis="y"
          values={administrando ? herramientas : otras}
          onReorder={administrando ? setHerramientas : reordenarOtras}
          className="mb-4"
        >
          <AnimatePresence initial={false}>
            {(administrando ? herramientas : otras).map((item) => (
              <HerramientaRow
                key={item.id}
                item={item}
                administrando={administrando}
                isEditing={editandoId === item.id}
                textoEdicion={textoEdicion}
                setTextoEdicion={setTextoEdicion}
                confirmandoEliminar={confirmarEliminarId === item.id}
                onToggleFavorito={toggleFavorito}
                onIniciarEdicion={iniciarEdicion}
                onConfirmarEdicion={confirmarEdicion}
                onCancelarEdicion={cancelarEdicion}
                onSolicitarEliminar={solicitarEliminar}
                onConfirmarEliminar={confirmarEliminar}
                onCancelarEliminar={cancelarEliminar}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {formAbierto ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-white/95 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
          >
            <p className="mb-3 text-sm font-semibold text-ink">Agregar herramienta</p>
            <div className="mb-3 flex gap-2">
              <select
                value={nuevoIcono}
                onChange={(e) => setNuevoIcono(e.target.value)}
                aria-label="Ícono de la herramienta"
                className="rounded-lg border border-black/10 bg-white px-2 py-2 text-lg"
              >
                {ICONOS_DISPONIBLES.map((icono) => (
                  <option key={icono} value={icono}>
                    {icono}
                  </option>
                ))}
              </select>
              <input
                type="text"
                autoFocus
                value={nuevoTexto}
                onChange={(e) => setNuevoTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') agregarHerramienta()
                }}
                aria-label="Nombre de la herramienta"
                placeholder="Ej: escuchar música, caminar..."
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={agregarHerramienta}
                className="flex-1 rounded-full bg-gradient-to-br from-faro-1 to-faro-2 py-2.5 text-sm font-bold text-brand-navyDeep shadow-[0_10px_20px_rgba(242,169,59,0.25)]"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={cancelarNuevo}
                className="flex-1 rounded-full bg-black/10 py-2.5 text-sm font-semibold text-ink"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            {...riseIn(0.14)}
            type="button"
            onClick={() => setFormAbierto(true)}
            className="w-full rounded-full border-[1.5px] border-dashed border-white/50 py-3 text-sm font-semibold text-white"
          >
            + Agregar herramienta
          </motion.button>
        )}
      </div>
    </div>
  )
}
