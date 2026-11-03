import { motion, useReducedMotion } from 'framer-motion'

// Silueta de un cuerpo de frente (viewBox 0 0 200 400) para la relajación
// muscular. Cada zona es su propia forma; las del lado derecho son las del
// izquierdo reflejadas, así el cuerpo queda simétrico.
//
// `zonas`: las que se trabajan en este paso. `hechas`: las de pasos ya
// terminados (quedan con un brillo tibio). `fase` y `progreso` (0 a 1) mueven
// la animación desde el temporizador del ejercicio, así que al pausar el
// ejercicio la animación también se detiene.
const IZQ = {
  brazo:
    'M60 110 C47 118 42 146 40 178 C39 192 40 204 42 212 L55 212 C56 198 57 184 61 164 C64 148 68 130 68 116 Z',
  mano: 'M38 222 C38 214 44 211 49 212 C54 213 57 218 56 226 C55 236 50 241 45 240 C40 239 38 231 38 222 Z',
  pierna: 'M69 212 C67 258 71 308 75 362 L94 362 C95 316 96 270 97 226 C88 224 77 220 69 212 Z',
  pie: 'M74 361 L95 361 C97 369 97 376 93 381 L67 381 C62 377 66 366 74 361 Z',
}

const espejo = 'translate(200 0) scale(-1 1)'

// Forma de cada zona. Las que no tienen `espejo` van en el centro del cuerpo.
const FORMAS = {
  jaw: [{ d: 'M79 52 C80 72 89 81 100 81 C111 81 120 72 121 52 C114 64 108 68 100 68 C92 68 86 64 79 52 Z' }],
  shoulders: [
    { d: 'M54 116 C60 100 80 94 100 94 C120 94 140 100 146 116 C130 108 116 105 100 105 C84 105 70 108 54 116 Z' },
  ],
  torso: [{ d: 'M70 148 C84 143 116 143 130 148 C132 172 132 194 132 210 C119 219 81 219 68 210 C68 194 68 172 70 148 Z' }],
  armLeft: [{ d: IZQ.brazo }],
  armRight: [{ d: IZQ.brazo, espejo: true }],
  handLeft: [{ d: IZQ.mano }],
  handRight: [{ d: IZQ.mano, espejo: true }],
  legLeft: [{ d: IZQ.pierna }],
  legRight: [{ d: IZQ.pierna, espejo: true }],
  footLeft: [{ d: IZQ.pie }],
  footRight: [{ d: IZQ.pie, espejo: true }],
}

// El cuerpo completo (base sobre la que se iluminan las zonas)
const CABEZA = { cx: 100, cy: 46, rx: 24, ry: 30 }
const CUELLO = 'M90 72 L110 72 L112 96 L88 96 Z'
const TRONCO = 'M60 110 C76 100 124 100 140 110 C144 140 138 172 132 212 C120 222 80 222 68 212 C62 172 56 140 60 110 Z'

function Forma({ d, espejo: reflejada, ...props }) {
  return (
    <g transform={reflejada ? espejo : undefined}>
      <motion.path d={d} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} {...props} />
    </g>
  )
}

// Al tensar la zona se enciende y se contrae un poco; al soltar se apaga
// despacio y vuelve a su tamaño.
function estiloZona(fase, progreso) {
  if (fase === 'tensa') {
    return { opacity: 0.35 + 0.65 * progreso, scale: 1 - 0.06 * progreso }
  }
  const suave = 1 - Math.pow(1 - progreso, 2)
  return { opacity: 1 - 0.85 * suave, scale: 0.94 + 0.06 * suave }
}

export default function SiluetaCuerpo({ zonas, hechas = [], fase, progreso, pausado, terminado, etiqueta, className = '' }) {
  const reduceMotion = useReducedMotion()
  const estilo = estiloZona(fase, progreso)
  // Transición corta: el temporizador avanza a saltos de 100 ms y esto los suaviza.
  const transicion = { duration: 0.15, ease: 'linear' }

  return (
    <svg viewBox="0 0 200 400" className={`overflow-visible ${className}`} role="img" aria-label={etiqueta}>
      <defs>
        <radialGradient id="siluetaAura" cx="50%" cy="45%" r="55%">
          <stop offset="0%" className="text-faro-2" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" className="text-faro-2" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="siluetaZona" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="text-faro-2" stopColor="currentColor" />
          <stop offset="100%" className="text-auxilio-2" stopColor="currentColor" />
        </linearGradient>
        {/* Une todas las piezas en una sola silueta: relleno tenue y un solo
            contorno exterior, sin las costuras de cada parte encimada. */}
        <filter id="siluetaContorno" x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="grueso" />
          <feComposite in="grueso" in2="SourceAlpha" operator="out" result="borde" />
          <feFlood floodColor="currentColor" floodOpacity="0.5" />
          <feComposite in2="borde" operator="in" result="lineaBorde" />
          <feComponentTransfer in="SourceGraphic" result="relleno">
            <feFuncA type="linear" slope="0.13" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="relleno" />
            <feMergeNode in="lineaBorde" />
          </feMerge>
        </filter>
        <filter id="siluetaBrillo" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* aura que respira detrás del cuerpo */}
      <motion.ellipse
        cx="100"
        cy="190"
        rx="98"
        ry="200"
        fill="url(#siluetaAura)"
        animate={reduceMotion || pausado ? { opacity: 0.7 } : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* el cuerpo completo, en el color del texto del tema */}
      <motion.g
        className="text-cielo"
        style={{ transformBox: 'fill-box', transformOrigin: '50% 60%' }}
        animate={reduceMotion || pausado ? { scale: 1 } : { scale: [1, 1.012, 1] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
      >
        <g fill="currentColor" filter="url(#siluetaContorno)">
          <ellipse {...CABEZA} />
          <path d={CUELLO} />
          <path d={TRONCO} />
          {['brazo', 'mano', 'pierna', 'pie'].map((parte) => (
            <g key={parte}>
              <path d={IZQ[parte]} />
              <path d={IZQ[parte]} transform={espejo} />
            </g>
          ))}
        </g>

        {/* zonas de pasos anteriores: quedan tibias, como ya relajadas */}
        {hechas.flatMap((zona) =>
          FORMAS[zona].map((forma, i) => (
            <Forma key={`${zona}-${i}`} {...forma} fill="url(#siluetaZona)" initial={{ opacity: 0 }} animate={{ opacity: 0.16 }} transition={{ duration: 1.2 }} />
          )),
        )}

        {/* zonas de este paso: brillo difuso + forma nítida */}
        {zonas.flatMap((zona) =>
          FORMAS[zona].map((forma, i) => (
            <g key={`${zona}-${i}`}>
              <Forma
                {...forma}
                fill="url(#siluetaZona)"
                filter="url(#siluetaBrillo)"
                animate={terminado ? { opacity: 0.25, scale: 1 } : { opacity: estilo.opacity, scale: estilo.scale * 1.08 }}
                transition={terminado ? { duration: 1.2 } : transicion}
              />
              <Forma
                {...forma}
                fill="url(#siluetaZona)"
                animate={terminado ? { opacity: 0.35, scale: 1 } : { opacity: estilo.opacity, scale: estilo.scale }}
                transition={terminado ? { duration: 1.2 } : transicion}
              />
              {/* al soltar, una onda de luz sale de la zona y se disuelve */}
              {fase === 'suelta' && !pausado && !terminado && !reduceMotion && (
                <Forma
                  {...forma}
                  fill="none"
                  className="stroke-faro-2"
                  strokeWidth="2"
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.45 }}
                  transition={{ duration: 2.4, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.4 }}
                />
              )}
            </g>
          )),
        )}
      </motion.g>
    </svg>
  )
}
