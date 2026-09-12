# Decisiones — leer antes de "corregir" algo que parece un descuido

Este archivo existe porque varias veces en el desarrollo de este proyecto,
algo que parecía un bug era en realidad una decisión deliberada. Antes de
"arreglar" algo de esta lista, confirmar con el equipo.

## Autenticación y acceso
- **Ninguna herramienta de calma requiere login** (respiración, grounding,
  sensorial, relajación muscular, señales). Solo Bitácora, Historial y
  Contactos de confianza. Decisión de producto: nunca poner fricción frente
  a alguien en un momento de crisis.

## Base de datos
- **`bitacora_entradas` no tiene policy de UPDATE**, a propósito — las
  entradas son un registro histórico inmutable, igual que el comportamiento
  original en localStorage. Si se necesita editar en el futuro, agregar la
  policy explícitamente, no asumir que falta por descuido.
- **Máximo 3 contactos de confianza, reforzado a nivel de base de datos**
  (trigger `BEFORE INSERT`), no solo validado en el frontend — el frontend
  se puede evadir, la base de datos no.
- **Toda tabla nueva necesita GRANT explícito a `authenticated`, además de
  las policies de RLS.** Bug real que costó tiempo de debugging: RLS sin
  GRANT en la tabla base falla con 403 "permission denied" ANTES de que
  ninguna policy se evalúe — parece que las policies están mal, pero el
  problema es el GRANT faltante. Pasó dos veces (contactos_confianza y
  bitacora_entradas) antes de que quedara como regla explícita acá.
- **El audio de las notas de voz vive en Supabase Storage, no en la tabla**
  — solo se guarda `tiene_nota_voz` (boolean) y `nota_voz_duracion` en la
  fila. El Blob real va a un bucket privado (`notas-voz`), nunca a
  localStorage/IndexedDB en la versión con backend (sí se usó IndexedDB
  como solución interina antes de tener backend — ya migrado).

## Ubicación
- **"Compartir ubicación" es un snapshot puntual, nunca tracking en vivo.**
  Se calcula la posición una vez, se arma un link de Google Maps, se envía
  por WhatsApp (`wa.me`), y el dato se descarta de inmediato — no se
  persiste en ningún lado (ni localStorage, ni Supabase). Ubicación en vivo
  requeriría un backend de tiempo real (Supabase Realtime + página propia de
  mapa) y fue pospuesta explícitamente a una fecha futura sin definir — no
  implementarla sin retomar esa conversación primero.
- **WhatsApp (`wa.me`), no Web Share API**, para compartir ubicación —
  decisión explícita del usuario. Requiere que el contacto tenga el
  teléfono guardado CON código de país (`+57...`), si no se bloquea con un
  mensaje pidiendo editar el contacto primero, no se intenta adivinar el
  código de país.
- El link de WhatsApp se abre con `window.location.href`, no
  `window.open()` — `window.open()` requiere gesto de usuario síncrono, y
  como hay un `await` de geolocalización de por medio, se pierde ese
  gesto en navegadores mobile y el navegador bloquea la ventana en
  silencio. `location.href` no tiene esa restricción, y en mobile `wa.me`
  es interceptado por el sistema operativo para abrir la app nativa,
  dejando la pestaña de Calma intacta de fondo.

## Animaciones
- **La animación de escala del círculo de respiración ignora
  `prefers-reduced-motion` a propósito** — decisión explícita de producto,
  no un descuido de accesibilidad. Va en contra de la convención estándar
  de accesibilidad web; se hizo así porque se pidió explícitamente que la
  animación se vea igual en todos los dispositivos sin excepción.
- **El personaje pirata NO se anima por piezas recortadas** (cabeza,
  brazos, piernas rotando) — se probó y el resultado visual no convenció
  (movimiento débil, costuras visibles en los pivotes). El enfoque actual
  es: personaje estático + resaltado de zona (glow/ring dorado) por paso +
  animación sutil de la pupila (traslación, sin rotación, para evitar el
  problema de costuras). No revertir a piezas recortadas sin antes revisar
  por qué se descartó.
- **Componentes visuales complejos generados con IA (video, imágenes) se
  evaluaron y descartaron para el personaje pirata** — Gemini/Veo no genera
  video con canal alfa (transparencia) real, lo cual habría requerido
  chroma-key adicional con riesgo de bordes sucios en una ilustración con
  textura granulada. Si se retoma la idea de video en el futuro, resolver
  primero el problema de transparencia.

## Librerías / decisiones de stack
- **OGL, no Three.js**, para el shader de agua interactivo en Ejercicios
  sensoriales — Three.js es ~175KB gzip para un caso de uso que es
  literalmente "un plano de pantalla completa + un shader", sin necesidad
  de escena/cámara/luces. OGL da la capa mínima necesaria (~30-40KB) con
  API lo bastante parecida a Three.js para que el código generado sea
  confiable.
- **El shader de Ejercicios sensoriales usa uniforms individuales
  nombrados (`u_ripple0Origin`, `u_ripple1Origin`, ...), no un array GLSL**
  (`u_rippleOrigins[12]`) — un array de uniforms dentro de un loop con
  límite constante se desenrolla en el compilador y WebGL termina
  tratando cada índice como un uniform independiente, que nunca recibe
  valor si solo se asigna la clave del array desde JS. Bug real, costó
  varias rondas de debugging (el síntoma era "el ripple siempre aparece en
  la esquina inferior izquierda y deja de funcionar después de 2s").
- **Web Speech API para transcripción, no un servicio de pago** —
  funciona nativo en Chrome/Edge/Safari, no en Firefox (el componente se
  auto-oculta ahí, no muestra un botón roto). Aceptado como limitación
  conocida mientras no haya presupuesto/necesidad de un servicio de STT de
  pago con mejor cobertura de navegadores.

## Privacidad
- **La política de privacidad declara explícitamente que la transcripción
  de voz usa el reconocimiento de voz nativo del navegador**, lo cual
  envía el audio a servidores de Google (Chrome/Edge) o Apple (Safari) —
  esto es una limitación real de la Web Speech API (ver también la
  entrada sobre Web Speech API más arriba), no un error de redacción ni
  algo a "corregir" ocultándolo en el texto legal.
- **RESUELTO:** el párrafo de "Eliminar tu cuenta por completo" en
  `Privacidad.jsx` decía que esto no era autogestionable y remitía a
  contacto manual por correo — quedó desactualizado cuando se implementó
  la Zona de peligro en `/perfil` (ver "Eliminar cuenta" más abajo), y
  ya se corrigió: ahora describe la autoeliminación real desde Mi perfil
  → Zona de peligro, incluyendo qué se borra y que pide una palabra de
  confirmación.

## Panel de Acompañamiento
- **"Contactar/Llamar/Mensaje" en el Panel de Acompañamiento reutilizan la
  MISMA lista de `contactos_confianza` del usuario que la Isla del
  Auxilio** — no existe un concepto separado de "persona acompañada" con
  su propio contacto guardado aparte. Es una simplificación deliberada,
  no un error: construir un modelo real de "persona vinculada" (con su
  propio registro, posiblemente bidireccional entre acompañante y
  acompañado) es un cambio de arquitectura más grande, pendiente para el
  futuro si se necesita. Mientras tanto, "Contactar a tu persona" navega
  a `/islas/auxilio`, que es donde se gestionan esos contactos, y
  Llamar/Mensaje resuelven el contacto con la misma lógica 0/1/2-3
  contactos que ya usa `compartirConContacto()` en `IslaAuxilio.jsx`.
- **El bloque "Contactar a tu persona / Llamar / Mensaje" es parte del
  flujo normal de la pantalla, NO fijo/sticky al fondo del viewport** —
  se anima con `whileInView` de Framer Motion (fade + slide-up, una sola
  vez, al entrar en el viewport durante el scroll) en vez de quedar
  pegado como una barra de acción siempre visible. Decisión explícita de
  priorizar una pantalla más limpia por sobre tener el CTA de contacto
  siempre a la vista. No convertirlo a `position: fixed`/`sticky`
  pensando que mejora la conversión sin retomar esta conversación
  primero.
- **Panel de Acompañamiento verifica que haya sesión activa (`user` de
  `useAuth()`) ANTES de llamar a `getContactos()`**, y si no hay sesión
  no hace esa llamada en absoluto — muestra directamente "Se requiere
  inicio de sesión para añadir contactos." con un botón a `/login`. Esto
  es necesario porque esta pantalla es de **acceso libre** (no está
  envuelta en `RequireAuth`, a diferencia de `IslaAuxilio`): sin este
  chequeo previo, un usuario sin sesión dispararía siempre el mismo
  error genérico de "no pudimos cargar tus contactos" con un botón
  "Reintentar" que jamás funcionaría, porque la causa real es falta de
  autenticación, no un problema de red. `IslaAuxilio.jsx` SÍ tiene
  sesión garantizada por `RequireAuth` en el router, así que no
  necesita (ni debe) replicar este chequeo.

## Cuenta y sesión
- **"Cerrar sesión" (en `AccountMenu`) NO usa el patrón de confirmación de
  dos pasos** que sí usan las acciones destructivas (eliminar
  contacto/entrada de bitácora) — es una decisión deliberada, no una
  inconsistencia a corregir: cerrar sesión no borra ningún dato del
  usuario (sus contactos y su bitácora siguen intactos en Supabase), así
  que la fricción extra de confirmar no aporta nada ahí.
- **Cambiar contraseña en `/perfil` no pide la contraseña actual** como
  confirmación adicional, a diferencia de lo que haría una app bancaria.
  Es una decisión consciente de mantener la fricción baja para una app de
  bienestar, no un descuido de seguridad — se puede reforzar más adelante
  (reautenticación previa) si se considera necesario.
- **Avatar y nombre de usuario en `/perfil` se guardan juntos con un solo
  botón "Guardar"** (selección en borrador local hasta presionarlo), a
  diferencia de correo y contraseña, que tienen cada uno su propio botón
  de acción inmediata. Es intencional: avatar/nombre son campos
  "cosméticos" de bajo riesgo que se pueden agrupar en un solo guardado,
  mientras que correo y contraseña son cambios sensibles (afectan el
  acceso a la cuenta) que ameritan su propia confirmación explícita y
  aislada, sin mezclarse con otros cambios pendientes en la misma
  pantalla.

## Eliminar cuenta
- **Eliminar cuenta pide escribir "ELIMINAR" exacto (sensible a
  mayúsculas, sin recortar espacios) en vez del patrón de confirmación
  de dos toques** que ya usan las acciones destructivas de un solo
  elemento (borrar un contacto o una entrada de bitácora) — es
  intencional, no inconsistencia: eliminar cuenta es la única acción de
  toda la app que destruye TODO de forma irreversible (contactos de
  confianza, bitácora completa con sus notas de voz, y el perfil), así
  que amerita un nivel de fricción deliberadamente más alto que borrar
  un solo elemento. No reemplazar esto por el patrón de dos toques
  pensando que "unifica" la UX de confirmaciones destructivas — la
  gravedad no es la misma.
- Se pide escribir la palabra fija "ELIMINAR", no el correo del usuario,
  a propósito: es más simple de teclear bajo estrés y evita que un error
  de captura del email (typo) bloquee sin motivo a alguien que sí quiere
  eliminar su cuenta.

## Perfil y cuenta
- **El botón "Volver" de `/perfil` usa `location.state.from`** (mismo
  patrón ya establecido en Login/Registro/`RequireAuth`), no un destino
  fijo a `/islas`. `AccountMenu` pasa el origen real al navegar
  (`navigate('/perfil', { state: { from: location.pathname } })`) para
  que "Volver" regrese a la pantalla desde la que realmente se entró
  (`/acompanamiento`, `/islas/faro`, `/bitacora`, etc.), no siempre a
  `/islas`. El fallback a `/islas` sigue existiendo solo para el caso sin
  ese state (por ejemplo, entrar directo a `/perfil` por URL) — no es un
  error, es intencional para cuando no hay contexto de navegación previo.
  El botón "Cerrar sesión" no se ve afectado por esto: sigue yendo
  siempre a `/elegir`, sin importar el origen, porque cerrar sesión es
  una acción distinta a simplemente "volver".
- AccountMenu muestra "Iniciar sesión" en vez de ocultarse cuando no hay
  sesión activa — decisión explícita, no un descuido: se evaluaron ambas
  opciones (ocultar el ícono vs. mostrar un acceso directo a login) y se
  eligió mantenerlo visible en todas las pantallas sin login obligatorio,
  como invitación constante a crear cuenta.
- Los 4 ejercicios guiados (Respiración, Grounding, Relajación muscular,
  Sensorial) NO llevan el ícono de AccountMenu, a propósito — ya tienen
  su propio header minimalista (pausa/play + cerrar) y agregar un tercer
  ícono ahí sobrecargaría una pantalla pensada para estar enfocada, no
  para navegar. No agregarlo ahí "completando la cobertura" sin revisar
  esta nota primero.
- Avatar y nombre de usuario se guardan juntos con un botón "Guardar"
  explícito (estado local hasta confirmar), mientras que cambiar
  correo/contraseña tienen cada uno su propio botón de acción inmediata
  — son categorías de cambio distintas: avatar/nombre son cosméticos de
  bajo riesgo, correo/contraseña son cambios sensibles que ameritan
  confirmación propia por separado.
- Cambiar contraseña no pide la contraseña actual como paso previo —
  decisión consciente de mantener la fricción baja en una app de
  bienestar, no un descuido de seguridad. Se puede reforzar más adelante
  si se considera necesario.

## Multi-agente (Codex + Claude Code)
- Ver `AGENTS.md` (raíz, `calma-app/`, `supabase/`) para convenciones que
  ambos agentes deben seguir. `CLAUDE.md` en cada una de esas carpetas solo
  importa el `AGENTS.md` correspondiente — Claude Code no lee `AGENTS.md`
  nativamente, así que sin ese archivo de import, se queda ciego a las
  reglas de esa carpeta.
