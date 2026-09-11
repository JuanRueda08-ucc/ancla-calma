import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion'
import BackButton from '../components/BackButton'
import AccountMenu from '../components/AccountMenu'
import { riseIn } from '../animations/transitions'

const ICONOS_DISPONIBLES = ['🎵', '🚶', '📞', '🫁', '💧', '😴', '📝', '🎉', '🌳', '🎨']

const HERRAMIENTAS_INICIALES = [
  { id: 'h-1', icon: '🎵', label: 'Escuchar música tranquila', favorite: false },
  { id: 'h-2', icon: '🚶', label: 'Dar un paseo', favorite: false },
  { id: 'h-3', icon: '📞', label: 'Llamar a alguien de confianza', favorite: false },
  { id: 'h-4', icon: '🫁', label: 'Respirar profundo', favorite: false },
]

function HerramientaRow({
  item,
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
      className="mb-3 flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Arrastrar para reordenar"
        className="cursor-grab touch-none select-none px-1 text-ink-soft/50 active:cursor-grabbing"
      >
        ⋮⋮
      </button>

      <span className="text-xl">{item.icon}</span>

      {isEditing ? (
        <input
          autoFocus
          value={textoEdicion}
          onChange={(e) => setTextoEdicion(e.target.value)}
          onBlur={() => onConfirmarEdicion(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirmarEdicion(item.id)
            if (e.key === 'Escape') onCancelarEdicion()
          }}
          className="flex-1 border-b border-ink/20 bg-transparent text-[14.5px] text-ink outline-none"
        />
      ) : (
        <span className="flex-1 text-[14.5px] text-ink">{item.label}</span>
      )}

      {isEditing ? (
        <>
          <button
            type="button"
            onClick={() => onConfirmarEdicion(item.id)}
            aria-label="Guardar cambios"
            className="text-lg text-acomp-1"
          >
            ✔
          </button>
          <button
            type="button"
            onClick={onCancelarEdicion}
            aria-label="Cancelar edición"
            className="text-lg text-ink-soft"
          >
            ✕
          </button>
        </>
      ) : confirmandoEliminar ? (
        <>
          <button
            type="button"
            onClick={() => onConfirmarEliminar(item.id)}
            className="whitespace-nowrap rounded-full bg-auxilio-1 px-3 py-1 text-xs font-semibold text-white"
          >
            ¿Eliminar?
          </button>
          <button
            type="button"
            onClick={onCancelarEliminar}
            aria-label="Cancelar eliminación"
            className="text-lg text-ink-soft"
          >
            ✕
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onToggleFavorito(item.id)}
            aria-label={item.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
            className={`text-lg ${item.favorite ? 'text-faro-1' : 'text-ink-soft/40'}`}
          >
            {item.favorite ? '★' : '☆'}
          </button>
          <button
            type="button"
            onClick={() => onIniciarEdicion(item)}
            aria-label="Editar"
            className="text-base text-ink-soft/60"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onSolicitarEliminar(item.id)}
            aria-label="Eliminar"
            className="text-base text-ink-soft/60"
          >
            🗑️
          </button>
        </>
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

  const [nuevoIcono, setNuevoIcono] = useState(ICONOS_DISPONIBLES[0])
  const [nuevoTexto, setNuevoTexto] = useState('')

  useEffect(() => {
    return () => clearTimeout(confirmarTimeoutRef.current)
  }, [])

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
    setNuevoTexto('')
    setNuevoIcono(ICONOS_DISPONIBLES[0])
  }

  const cancelarNuevo = () => {
    setNuevoTexto('')
    setNuevoIcono(ICONOS_DISPONIBLES[0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-faro-1 to-faro-2">
      <div className="mx-auto max-w-[620px] px-5 pb-20 pt-10">
        <div className="flex items-center justify-between">
          <BackButton to="/islas" />
          <AccountMenu buttonClassName="bg-white/20 text-white" />
        </div>

        <motion.div {...riseIn(0)} className="mb-8 text-center">
          <svg viewBox="0 0 100 90" width="76" height="76" className="mx-auto mb-3">
            <ellipse cx="50" cy="82" rx="42" ry="7" fill="#04122A" />
            <path d="M18 82 C26 66 40 66 50 66 C60 66 74 66 82 82 Z" fill="#0A2A57" />
            <rect x="43" y="30" width="14" height="38" rx="2" fill="#FFF8EA" />
            <rect x="43" y="30" width="14" height="11" fill="#F2A93B" />
            <rect x="43" y="52" width="14" height="11" fill="#F2A93B" />
            <polygon points="38,30 62,30 50,14" fill="#E85C41" />
            <rect x="46" y="6" width="8" height="8" rx="2" fill="#FFE8B8" />
            <circle cx="50" cy="10" r="3.5" fill="#FFF6DD" />
          </svg>
          <h1 className="mb-1.5 text-[26px] font-semibold text-white">Tu faro</h1>
          <p className="text-sm text-white/[0.85]">
            Herramientas que te ayudan en momentos difíciles
          </p>
        </motion.div>

        <div className="mb-4">
          <Reorder.Group axis="y" values={herramientas} onReorder={setHerramientas}>
            <AnimatePresence initial={false}>
              {herramientas.map((item) => (
                <HerramientaRow
                  key={item.id}
                  item={item}
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
        </div>

        <div className="rounded-lg bg-white/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
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
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              placeholder="Ej: escuchar música, caminar..."
              className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-[14.5px] text-ink placeholder:text-[#B7B0A4] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={agregarHerramienta}
              className="flex-1 rounded-full bg-gradient-to-br from-faro-1 to-[#FF9C4A] py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(242,169,59,0.25)]"
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
        </div>
      </div>
    </div>
  )
}
