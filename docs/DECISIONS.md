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

## Multi-agente (Codex + Claude Code)
- Ver `AGENTS.md` (raíz, `calma-app/`, `supabase/`) para convenciones que
  ambos agentes deben seguir. `CLAUDE.md` en cada una de esas carpetas solo
  importa el `AGENTS.md` correspondiente — Claude Code no lee `AGENTS.md`
  nativamente, así que sin ese archivo de import, se queda ciego a las
  reglas de esa carpeta.
