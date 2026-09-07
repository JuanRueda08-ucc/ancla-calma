# Calma — App (React + Vite + Tailwind)

Implementación en React del rediseño de **Calma** (Proyecto ANCLA). Ver el [README raíz](../README.md) para el contexto general del producto.

## Stack

- **React 19** + **Vite** — SPA, sin SSR.
- **react-router-dom v7** — enrutamiento (`BrowserRouter` + `Routes`).
- **Tailwind CSS v3** — utilidades, con la paleta y tipografía del proyecto extendidas en `tailwind.config.js` (colores por isla, `font-display`/`font-sans`, `radius-lg`/`radius-xl`).
- **Framer Motion** — todas las animaciones (fades escalonados, `Reorder` para listas arrastrables, `AnimatePresence` para acordeones y transiciones entre pasos).
- Fuentes: **Poppins** (Google Fonts) para todo el texto, **Comba Test** (cdnfonts) solo para el wordmark "Calma".

## Cómo correr el proyecto

```bash
npm install
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # build de producción
npm run preview   # sirve el build de producción localmente
npm run lint       # oxlint
```

## Estructura

```
src/
├── App.jsx                  # definición de rutas
├── main.jsx                 # entry point
├── index.css                # directivas Tailwind + estilos base
├── screens/                 # una pantalla por archivo (ver mapa de rutas abajo)
├── components/
│   ├── BackButton.jsx        # píldora "← Volver" reutilizada en casi todas las pantallas
│   ├── StarField.jsx         # capa de estrellas (fondos nocturnos: Entrada, Puerto Seguro, ejercicios)
│   ├── GuidedExerciseShell.jsx  # shell compartido por los 3 ejercicios guiados de Puerto Seguro
│   │                            # (fondo, barra de pausa/cerrar, progreso, transición entre pasos)
│   ├── Accordion.jsx          # acordeón compartido por IslaSenales y PanelAcompanamiento
│   ├── BlobIcon.jsx           # stub — reservado, no conectado aún
│   ├── IslandCard.jsx         # stub — reservado, no conectado aún
│   └── WaveDivider.jsx        # stub — reservado, no conectado aún
├── animations/
│   └── transitions.js        # `riseIn(delay)` — curva/duración de fade+rise compartida por toda la app
└── styles/
    ├── entrada.css            # gradiente y haz de luz de la pantalla Entrada
    ├── starfield.css           # patrón de estrellas (radial-gradients)
    └── nightSky.js             # clase de fondo nocturno compartida (Puerto Seguro + ejercicios)
```

## Mapa de rutas

| Ruta | Pantalla | Vuelve a |
|---|---|---|
| `/` | `Entrada` | — |
| `/elegir` | `ElegirCamino` | — |
| `/islas` | `Islas` | `/elegir` |
| `/islas/auxilio` | `IslaAuxilio` | `/islas` |
| `/islas/aire` | `IslaAireMenu` | `/islas` |
| `/islas/aire/respiracion` | `EjercicioRespiracion` | `/islas/aire` |
| `/islas/aire/puerto-seguro` | `PuertoSeguro` | `/islas/aire` |
| `/islas/aire/puerto-seguro/grounding` | `EjercicioGrounding` | `/islas/aire/puerto-seguro` |
| `/islas/aire/puerto-seguro/relajacion-muscular` | `EjercicioRelajacionMuscular` | `/islas/aire/puerto-seguro` |
| `/islas/aire/puerto-seguro/sensorial` | `EjercicioSensorial` | `/islas/aire/puerto-seguro` |
| `/bitacora` | `Bitacora` | `/islas` |
| `/islas/faro` | `IslaFaro` | `/islas` |
| `/islas/senales` | `IslaSenales` | `/islas` |
| `/acompanamiento` | `PanelAcompanamiento` | `/elegir` |

## Sistema de diseño

Definido en `tailwind.config.js`:

- **Marca**: `brand.navy` (#002E6B) / `brand.navyDeep` (#001B44).
- **Base**: `sand` (#F5F8FB) / `sand.deep` (#EAF0F7), `ink` (#0A2540) / `ink.soft` (#55677E).
- **Por isla**: `auxilio` (naranja/coral), `aire` (navy/celeste + acento teal), `faro` (ámbar/dorado), `senales` (verde menta), `acomp` (verde/azul acompañamiento).
- **Radios**: `rounded-lg` = 28px, `rounded-xl` = 36px (sobrescriben la escala por defecto de Tailwind).
- **Un solo principio de movimiento**: las animaciones de entrada son un fade+rise de una sola vez (`riseIn` en `animations/transitions.js`); los únicos loops continuos son el círculo de respiración, el haz del faro y el glow sutil de los ejercicios sensoriales — todos respetan `prefers-reduced-motion`.

## Notas de implementación

- No hay backend: todo el estado (bitácora, herramientas del Faro, favoritos, tags, formularios) vive en `useState` de cada pantalla. Los puntos de integración futura están marcados con `// TODO` en el código (guardar entrada, llamar/enviar mensaje, compartir ubicación, enviar alerta, poblar herramientas desde el Faro, etc.).
- Acciones "reales" simuladas (llamar, copiar mensaje, enviar alerta) dan feedback visual inmediato vía un toast, sin bloquear la interfaz.
