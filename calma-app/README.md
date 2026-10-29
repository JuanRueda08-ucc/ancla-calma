# Calma — App (React + Vite + Tailwind + Supabase)

**[Español](#español) · [English](#english)**

---

## Español

Frontend de **Calma** (Proyecto ANCLA). Ver el [README raíz](../README.md) para el contexto general del producto y la carpeta [`docs/`](../docs) para arquitectura y decisiones.

### Stack

- **React 19** + **Vite** — SPA, sin SSR. JavaScript, sin TypeScript.
- **react-router-dom v7** — enrutamiento (`BrowserRouter` + `Routes`); las rutas protegidas se envuelven con `<RequireAuth>`.
- **Supabase** (`@supabase/supabase-js`) — Auth (correo + contraseña con confirmación), Postgres con RLS y Storage (notas de voz). Cliente en `src/lib/supabaseClient.js`.
- **Tailwind CSS v3** — paleta y tipografía del proyecto extendidas en `tailwind.config.js`.
- **Framer Motion** — animaciones de entrada (`riseIn`), `Reorder` para listas arrastrables, `AnimatePresence` para acordeones y pasos.
- **OGL** — shader WebGL de olas/ripples en el ejercicio sensorial, con respaldo a `StarField` si no hay WebGL.
- Fuentes: **Poppins** para todo el texto, **Comba Test** solo para el wordmark "CALMA" (no tiene tildes ni ñ).

### Cómo correr el proyecto

Desde la raíz del repo (recomendado): `npm run install:app` y `npm run dev`. O desde esta carpeta:

```bash
npm install
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # build de producción
npm run preview   # sirve el build localmente
npm run lint      # oxlint
```

Variables de entorno en `.env.local` (plantilla en `.env.example`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Estructura

```
src/
├── App.jsx                    # rutas + AuthProvider
├── main.jsx                   # entry point
├── index.css                  # directivas Tailwind + estilos base
├── screens/                   # una pantalla por archivo (ver mapa de rutas)
├── components/
│   ├── ScreenHeader.jsx        # BackButton + AccountMenu con posición idéntica en todas las pantallas
│   ├── BackButton.jsx          # píldora "← Volver"
│   ├── AccountMenu.jsx         # ícono de cuenta (avatar real o invitación a iniciar sesión)
│   ├── RequireAuth.jsx         # protege rutas que necesitan sesión
│   ├── GuidedExerciseShell.jsx # shell de los ejercicios de Puerto Seguro (progreso, temporizador, pausa)
│   ├── Accordion.jsx           # acordeón de IslaSenales y PanelAcompanamiento
│   ├── VoiceNoteRecorder.jsx   # grabación de nota de voz (MediaRecorder)
│   ├── TranscribeMicButton.jsx # dictado por campo (Web Speech API)
│   ├── OceanShaderBackground.jsx # shader de olas (OGL), usado en EjercicioSensorial
│   ├── StarField.jsx           # capa de estrellas para fondos nocturnos
│   ├── BlobIcon.jsx            # stub — reservado, no conectado aún
│   ├── IslandCard.jsx          # stub — reservado, no conectado aún
│   └── WaveDivider.jsx         # stub — reservado, no conectado aún
├── context/
│   └── AuthContext.jsx         # sesión + perfil (avatar, nombre) con refreshProfile()
├── lib/
│   └── supabaseClient.js
├── utils/                      # acceso a datos (todas ASYNC) y utilidades
│   ├── contactosStorage.js     # contactos de confianza (máx. 3)
│   ├── bitacoraStorage.js      # entradas de bitácora
│   ├── audioStorage.js         # notas de voz en Storage
│   ├── compartirUbicacion.js   # ubicación puntual por WhatsApp (calcular y descartar)
│   └── supportsWebGL.js
├── constants/
│   └── avatares.js             # los 3 avatares de marca
├── animations/
│   └── transitions.js          # riseIn(delay): fade+rise compartido por toda la app
└── styles/
    ├── entrada.css             # cielo, haz del faro y reflejo de la pantalla Entrada
    ├── starfield.css
    └── nightSky.js             # fondo nocturno de Puerto Seguro y ejercicios
```

### Mapa de rutas

🔒 = requiere sesión (`RequireAuth`).

| Ruta | Pantalla | Vuelve a |
|---|---|---|
| `/` | `Entrada` | — |
| `/elegir` | `ElegirCamino` | `/` |
| `/islas` | `Islas` | `/elegir` |
| `/islas/auxilio` 🔒 | `IslaAuxilio` | `/islas` |
| `/islas/aire` | `IslaAireMenu` | `/islas` |
| `/islas/aire/respiracion` | `EjercicioRespiracion` | `/islas/aire` |
| `/islas/aire/puerto-seguro` | `PuertoSeguro` | `/islas/aire` |
| `/islas/aire/puerto-seguro/grounding` | `EjercicioGrounding` | `/islas/aire/puerto-seguro` |
| `/islas/aire/puerto-seguro/relajacion-muscular` | `EjercicioRelajacionMuscular` | `/islas/aire/puerto-seguro` |
| `/islas/aire/puerto-seguro/sensorial` | `EjercicioSensorial` | `/islas/aire/puerto-seguro` |
| `/islas/faro` | `IslaFaro` | `/islas` |
| `/islas/senales` | `IslaSenales` | `/islas` |
| `/bitacora` 🔒 | `Bitacora` | `/islas` |
| `/bitacora/historial` 🔒 | `HistorialBitacora` | `/bitacora` |
| `/acompanamiento` | `PanelAcompanamiento` | `/elegir` |
| `/perfil` 🔒 | `Perfil` | pantalla de origen (`/islas` por defecto) |
| `/login` | `Login` | — |
| `/registro` | `Registro` | — |
| `/privacidad` | `Privacidad` | `/registro` |

### Sistema de diseño

Definido en `tailwind.config.js`. Usar siempre estos tokens, sin hex sueltos en `className`:

- **Marca**: `brand.navy` (#002E6B) / `brand.navyDeep` (#001B44).
- **Base**: `sand` (#F5F8FB) / `sand.deep` (#EAF0F7), `ink` (#0A2540) / `ink.soft` (#55677E).
- **Por isla**: `auxilio` (coral), `aire` (navy/celeste + acento teal), `faro` (ámbar/dorado), `senales` (verde menta), `acomp` (verde/azul).
- **Radios**: `rounded-lg` = 28px, `rounded-xl` = 36px.
- **Movimiento**: las entradas usan `riseIn`; los loops continuos son el círculo de respiración, el haz del faro en Entrada y el brillo de los ejercicios sensoriales.

### Funciones reales (ya no son placeholders)

- Cuentas con Supabase Auth: registro con confirmación de correo, login, cierre de sesión, perfil (avatar, nombre, correo, contraseña) y eliminación de cuenta vía Edge Function `eliminar-cuenta`.
- Contactos de confianza (máx. 3, reforzado en la base de datos) con llamada `tel:` y mensaje por WhatsApp.
- Compartir ubicación puntual por WhatsApp (no se guarda la ubicación).
- Bitácora persistida en Supabase, con dictado por voz, nota de voz adjunta e historial con reproducción.
- Ejercicios guiados con temporizador real y pausa.

Todas las funciones de `utils/*Storage.js` son asíncronas: los componentes que las usan manejan estados de carga y error.

---

## English

Frontend for **Calma** (Project ANCLA). See the [root README](../README.md) for product context and the [`docs/`](../docs) folder for architecture and decisions (written in Spanish).

### Stack

- **React 19** + **Vite** — SPA, no SSR. JavaScript, no TypeScript.
- **react-router-dom v7** — routing (`BrowserRouter` + `Routes`); protected routes are wrapped in `<RequireAuth>`.
- **Supabase** (`@supabase/supabase-js`) — Auth (email + password with confirmation), Postgres with RLS, and Storage (voice notes). Client in `src/lib/supabaseClient.js`.
- **Tailwind CSS v3** — project palette and typography extended in `tailwind.config.js`.
- **Framer Motion** — entrance animations (`riseIn`), `Reorder` for draggable lists, `AnimatePresence` for accordions and steps.
- **OGL** — WebGL wave/ripple shader in the sensory exercise, falling back to `StarField` when WebGL is unavailable.
- Fonts: **Poppins** for all text, **Comba Test** only for the "CALMA" wordmark (it has no accented characters).

### Running the project

From the repo root (recommended): `npm run install:app` and `npm run dev`. Or from this folder:

```bash
npm install
npm run dev       # dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # serve the build locally
npm run lint      # oxlint
```

Environment variables go in `.env.local` (template in `.env.example`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Structure

```
src/
├── App.jsx                    # routes + AuthProvider
├── main.jsx                   # entry point
├── index.css                  # Tailwind directives + base styles
├── screens/                   # one screen per file (see route map)
├── components/
│   ├── ScreenHeader.jsx        # BackButton + AccountMenu, identical placement on every screen
│   ├── BackButton.jsx          # "← Volver" pill
│   ├── AccountMenu.jsx         # account icon (real avatar, or sign-in prompt)
│   ├── RequireAuth.jsx         # guards routes that need a session
│   ├── GuidedExerciseShell.jsx # shell for Puerto Seguro exercises (progress, timer, pause)
│   ├── Accordion.jsx           # accordion for IslaSenales and PanelAcompanamiento
│   ├── VoiceNoteRecorder.jsx   # voice note recording (MediaRecorder)
│   ├── TranscribeMicButton.jsx # per-field dictation (Web Speech API)
│   ├── OceanShaderBackground.jsx # wave shader (OGL), used in EjercicioSensorial
│   ├── StarField.jsx           # star layer for night backgrounds
│   ├── BlobIcon.jsx            # stub — reserved, not wired up yet
│   ├── IslandCard.jsx          # stub — reserved, not wired up yet
│   └── WaveDivider.jsx         # stub — reserved, not wired up yet
├── context/
│   └── AuthContext.jsx         # session + profile (avatar, name) with refreshProfile()
├── lib/
│   └── supabaseClient.js
├── utils/                      # data access (all ASYNC) and helpers
│   ├── contactosStorage.js     # trusted contacts (max. 3)
│   ├── bitacoraStorage.js      # journal entries
│   ├── audioStorage.js         # voice notes in Storage
│   ├── compartirUbicacion.js   # one-off WhatsApp location (compute and discard)
│   └── supportsWebGL.js
├── constants/
│   └── avatares.js             # the 3 brand avatars
├── animations/
│   └── transitions.js          # riseIn(delay): app-wide fade+rise
└── styles/
    ├── entrada.css             # sky, lighthouse beam and reflection on Entrada
    ├── starfield.css
    └── nightSky.js             # night background for Puerto Seguro and exercises
```

### Route map

🔒 = requires a session (`RequireAuth`). Route paths and screen names are in Spanish, as in the code.

| Route | Screen | Back to |
|---|---|---|
| `/` | `Entrada` (welcome) | — |
| `/elegir` | `ElegirCamino` (choose a path) | `/` |
| `/islas` | `Islas` (islands) | `/elegir` |
| `/islas/auxilio` 🔒 | `IslaAuxilio` (crisis help) | `/islas` |
| `/islas/aire` | `IslaAireMenu` (calming exercises) | `/islas` |
| `/islas/aire/respiracion` | `EjercicioRespiracion` (breathing) | `/islas/aire` |
| `/islas/aire/puerto-seguro` | `PuertoSeguro` | `/islas/aire` |
| `/islas/aire/puerto-seguro/grounding` | `EjercicioGrounding` | `/islas/aire/puerto-seguro` |
| `/islas/aire/puerto-seguro/relajacion-muscular` | `EjercicioRelajacionMuscular` (muscle relaxation) | `/islas/aire/puerto-seguro` |
| `/islas/aire/puerto-seguro/sensorial` | `EjercicioSensorial` (sensory) | `/islas/aire/puerto-seguro` |
| `/islas/faro` | `IslaFaro` (lighthouse tools) | `/islas` |
| `/islas/senales` | `IslaSenales` (warning signs) | `/islas` |
| `/bitacora` 🔒 | `Bitacora` (journal) | `/islas` |
| `/bitacora/historial` 🔒 | `HistorialBitacora` (journal history) | `/bitacora` |
| `/acompanamiento` | `PanelAcompanamiento` (peer support) | `/elegir` |
| `/perfil` 🔒 | `Perfil` (profile) | screen of origin (`/islas` by default) |
| `/login` | `Login` | — |
| `/registro` | `Registro` (sign-up) | — |
| `/privacidad` | `Privacidad` (privacy policy) | `/registro` |

### Design system

Defined in `tailwind.config.js`. Always use these tokens, never loose hex values in `className`:

- **Brand**: `brand.navy` (#002E6B) / `brand.navyDeep` (#001B44).
- **Base**: `sand` (#F5F8FB) / `sand.deep` (#EAF0F7), `ink` (#0A2540) / `ink.soft` (#55677E).
- **Per island**: `auxilio` (coral), `aire` (navy/sky blue + teal accent), `faro` (amber/gold), `senales` (mint green), `acomp` (green/blue).
- **Radii**: `rounded-lg` = 28px, `rounded-xl` = 36px.
- **Motion**: entrances use `riseIn`; the only continuous loops are the breathing circle, the lighthouse beam on Entrada, and the sensory exercises' glow.

### Real features (no longer placeholders)

- Supabase Auth accounts: sign-up with email confirmation, login, sign-out, profile (avatar, name, email, password), and account deletion through the `eliminar-cuenta` Edge Function.
- Trusted contacts (max. 3, enforced in the database) with `tel:` calls and WhatsApp messages.
- One-off location sharing via WhatsApp (the location is never stored).
- Journal (bitácora) persisted in Supabase, with voice dictation, attached voice notes, and a history view with playback.
- Guided exercises with a real timer and pause.

Every function in `utils/*Storage.js` is async: components using them handle loading and error states.
