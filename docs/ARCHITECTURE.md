# Arquitectura técnica

## Stack
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: Supabase (Postgres + Auth + Storage), plan Free, región São Paulo (sa-east-1)
- Hosting: Vercel (deploy automático por rama; main = producción)

## Rutas y jerarquía de navegación

```
/                                              → Entrada (splash)
/elegir                                        → ElegirCamino (Necesito ayuda / Quiero ayudar)
/islas                                         → Islas (menú, vuelve a /elegir)
/islas/auxilio        [protegida]              → IslaAuxilio (vuelve a /islas)
/islas/aire                                    → IslaAireMenu (vuelve a /islas)
/islas/aire/respiracion                        → EjercicioRespiracion (vuelve a /islas/aire)
/islas/aire/puerto-seguro                      → PuertoSeguro (vuelve a /islas/aire)
/islas/aire/puerto-seguro/grounding            → EjercicioGrounding (vuelve a puerto-seguro)
/islas/aire/puerto-seguro/relajacion-muscular  → EjercicioRelajacionMuscular (vuelve a puerto-seguro)
/islas/aire/puerto-seguro/sensorial            → EjercicioSensorial (vuelve a puerto-seguro)
/islas/faro                                    → IslaFaro (vuelve a /islas)
/islas/senales                                 → IslaSenales (vuelve a /islas)
/bitacora             [protegida]              → Bitacora (vuelve a /islas)
/bitacora/historial   [protegida]              → HistorialBitacora (vuelve a /bitacora)
/acompanamiento                                → PanelAcompanamiento (vuelve a /elegir)
/login                                         → Login
/registro                                      → Registro
/privacidad                                    → Privacidad (stub, pendiente texto legal real)
```

`[protegida]` = envuelta en `RequireAuth`, redirige a `/login` si no hay sesión.

## Autenticación
Supabase Auth, email + contraseña, confirmación de correo obligatoria.
`AuthContext` (`src/context/AuthContext.jsx`) expone `{ user, session, loading, profile, signOut, refreshProfile }` vía `onAuthStateChange`. `profile` (avatar_id, display_name) se carga automáticamente desde la tabla `profiles` una vez que la sesión resuelve, y se resetea a `null` al cerrar sesión. `refreshProfile()` permite volver a cargarlo bajo demanda (usado por Perfil.jsx tras guardar cambios, para que el resto de la app —como el avatar en AccountMenu— se entere sin necesidad de recargar la página). `RequireAuth` (`src/components/RequireAuth.jsx`) es el wrapper de rutas protegidas.

## Base de datos (Postgres, esquema `public`)

**contactos_confianza**: `id, user_id, nombre, telefono, created_at, updated_at`.
Máximo 3 por usuario, reforzado con un trigger `BEFORE INSERT` (`security definer`,
no solo validación de frontend). RLS: select/insert/update/delete todos
`auth.uid() = user_id`.

**bitacora_entradas**: `id, user_id, tags[], emocion_libre, que_siento, que_ocurrio,
que_necesito, que_ayudo, tiene_nota_voz, nota_voz_duracion, created_at`.
RLS: select/insert/delete `auth.uid() = user_id`. **Sin policy de UPDATE a
propósito** — ver DECISIONS.md.

**storage.buckets 'notas-voz'**: privado, no público. Convención de ruta:
`{user_id}/{entrada_id}.webm`. Políticas de RLS en `storage.objects` usan
`(storage.foldername(name))[1] = auth.uid()::text`.

Todas las tablas necesitan GRANT explícito a `authenticated` además de las
policies de RLS — ver DECISIONS.md para el bug que motivó esta regla.

## Componentes/utilidades compartidas clave
- `AccountMenu.jsx`: ícono persistente de cuenta, presente en casi todas
  las pantallas (ver DECISIONS.md para las exclusiones deliberadas: los
  4 ejercicios guiados, Perfil, Login/Registro/Privacidad). Muestra el
  avatar real del usuario si hay sesión y perfil cargado, o el ícono
  genérico como respaldo. Sin sesión, ofrece un acceso directo a
  "Iniciar sesión" en vez de ocultarse.
- `GuidedExerciseShell.jsx`: shell común de los 3 ejercicios de Puerto Seguro
  (fondo StarField, barra superior pausa/cerrar, temporizador real con barra
  de progreso ligada a `durationSeconds`, independiente del avance manual
  por pasos)
- `contactosStorage.js`, `bitacoraStorage.js`, `audioStorage.js`: capa de
  acceso a datos (Supabase), todas async, todas confían en RLS para el
  filtrado por usuario en vez de filtrar manualmente
- `compartirUbicacion.js`: ubicación puntual vía `navigator.geolocation`,
  nunca persistida — ver DECISIONS.md
- `OceanShaderBackground.jsx`: shader WebGL (librería OGL) con ripples
  interactivos, usado solo en `EjercicioSensorial` (contenido dentro de la
  tarjeta de instrucción, no a pantalla completa)
- `TranscribeMicButton.jsx`: transcripción de voz a texto vía Web Speech API
  nativa (no funciona en Firefox, se auto-oculta si no hay soporte)
- `VoiceNoteRecorder.jsx`: grabación de audio real vía MediaRecorder API

## Personaje pirata (Relajación muscular)
Assets en `calma-app/src/assets/personajes/pirata/`. Extraído de un PDF
original con capas de Illustrator (`hombre`/`mujer`/otras — solo `hombre` se
renderiza, el resto parecen residuos de plantilla). Estructura de assets:
- `pieza_base_conojo.png`: personaje completo con un hueco circular exacto
  donde va la pupila (recortado por color, no por transparencia — la pupila
  no tiene borde alfa natural que la separe de la piel/ojo blanco)
- `pieza_pupila.png`: la pupila, se anima con un desplazamiento pequeño
  (centro → derecha → centro → izquierda → centro, loop infinito)
- Overlays de resaltado (glow + ring dorado) por zona, posicionados en %
  del contenedor, uno o dos a la vez según el paso del ejercicio

Se descartó animar el cuerpo por piezas recortadas (hombros/brazos/piernas
con rotate) — ver DECISIONS.md.
