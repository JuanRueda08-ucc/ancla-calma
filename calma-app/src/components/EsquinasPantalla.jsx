import { createPortal } from 'react-dom'

// Botones de las esquinas de arriba (Volver a la izquierda; tema y cuenta a la
// derecha). Van montados en <body>, fuera del contenedor de cada pantalla:
// así quedan siempre a la misma distancia del borde aunque cada pantalla tenga
// su propio ancho (420, 540, 620 px...). Es `absolute`, no `fixed`: se van con
// el scroll en vez de flotar encima del contenido.
//
// En el celular coinciden con el margen de siempre (20 px a los lados, 40 px
// arriba); en desktop se pegan a las esquinas. `--alto-aviso` es el alto del
// aviso "sin conexión" (AvisoSinConexion), que empuja la página hacia abajo.
// ScreenHeader deja en la pantalla un espacio de 38 px (el alto de "Volver").

export default function EsquinasPantalla({ izquierda, derecha }) {
  return createPortal(
    <div className="pointer-events-none absolute inset-x-0 top-[var(--alto-aviso,0px)] z-30 flex items-center justify-between px-5 pt-[calc(2.5rem+env(safe-area-inset-top))] lg:px-8 lg:pt-[calc(1.75rem+env(safe-area-inset-top))]">
      <div className="pointer-events-auto">{izquierda}</div>
      <div className="pointer-events-auto flex items-center gap-2">{derecha}</div>
    </div>,
    document.body,
  )
}
