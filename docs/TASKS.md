# Estado del proyecto / traspaso entre agentes

Este archivo es el punto de sincronización entre Claude Code y Codex cuando
trabajan en momentos distintos sobre el mismo repo. Antes de empezar una
tarea grande, revisar qué está "en progreso" acá para no pisar trabajo del
otro agente. Al terminar una tarea significativa, actualizar este archivo.

## En progreso / pendiente ahora mismo
- Reestructuración de documentación multi-agente (este mismo cambio:
  AGENTS.md/CLAUDE.md anidados + carpeta docs/) — recién creada, falta
  hacer commit y verificar que Claude Code efectivamente concatena los
  CLAUDE.md anidados de calma-app/ y supabase/ como se espera.

## Completado (backend real, rama feature/supabase-backend, ya en main)
- Proyecto Supabase creado (región São Paulo), CLI vinculado
- Esquema inicial: `contactos_confianza`, `bitacora_entradas`, RLS +
  triggers + GRANTs (con su bug histórico ya documentado en DECISIONS.md)
- Bucket de Storage `notas-voz` (privado) + políticas
- Auth completo: Login, Registro (con confirmación de correo), logout,
  `RequireAuth` protegiendo `/bitacora`, `/bitacora/historial`,
  `/islas/auxilio`
- Contactos de confianza migrados de localStorage a Supabase (con banner
  de migración de datos existentes)
- Bitácora + audio migrados de localStorage/IndexedDB a Supabase +
  Storage (con banner de migración)
- Aislamiento RLS verificado en vivo con una segunda cuenta real (tanto
  contactos como bitácora, incluyendo acceso directo a Storage con la URL
  exacta del archivo del otro usuario — bloqueado correctamente)

## Completado (funciones puntuales, ya en main)
- Contactos de confianza reales (máx. 3, reforzado en BD) con llamada
  `tel:` responsiva
- Compartir ubicación puntual por WhatsApp (`wa.me`), con selector de
  contacto si hay más de uno guardado
- Transcripción de voz por campo en Bitácora (Web Speech API)
- Nota de voz real adjunta a la bitácora (MediaRecorder + Storage)
- Historial de bitácora con reproducción de audio real
- Shader interactivo de olas/ripples en Ejercicios sensoriales (OGL),
  con fallback a StarField si no hay soporte WebGL
- Animación real del círculo de respiración (sincronizada a fase,
  ignora `prefers-reduced-motion` a propósito)
- Temporizador real (no solo por pasos) en los 3 ejercicios de Puerto
  Seguro, con pausa/play funcional
- Personaje pirata en Relajación muscular: personaje estático + 7 zonas
  de resaltado (glow/ring) por paso + animación sutil de pupila
- Texto real de `/privacidad` (ya no es placeholder): contenido completo
  de la política de privacidad, con fecha y correo de contacto reales —
  sigue pendiente de revisión legal profesional antes de considerarse
  definitivo, ver sección "Privacidad" en DECISIONS.md
- Rediseño de "Cerrar sesión": pasó de texto pequeño inline a un ícono de
  cuenta persistente arriba a la derecha (`AccountMenu`, espejo del
  `BackButton`) con menú desplegable y cierre en un solo tap, sin
  confirmación de dos pasos (ver DECISIONS.md). Como parte del mismo
  cambio, "Ver historial" en Bitácora pasó de link pequeño a botón real
  y visible.
- Pantalla de perfil (`/perfil`): selector de avatar (3 opciones,
  persistido en `profiles.avatar_id`), formulario de cambio de correo
  (con confirmación por email de Supabase) y formulario de cambio de
  contraseña. Accesible desde "Mi perfil" en `AccountMenu`.
- Panel de Perfil: selector de avatar (3 personajes de marca) + nombre
  de usuario opcional, guardados juntos con un botón "Guardar" explícito
  (a diferencia de correo/contraseña, que actualizan de inmediato cada
  uno por separado)
- Perfil del usuario (avatar, nombre) centralizado en AuthContext, con
  `refreshProfile()` para propagar cambios sin recargar la página
- Ícono de cuenta (AccountMenu) presente en toda la app excepto los 4
  ejercicios guiados y las pantallas de Perfil/Login/Registro/Privacidad;
  muestra el avatar real con sesión iniciada, o invita a iniciar sesión
  si no la hay
- Perfil ahora también tiene su propio botón de "Cerrar sesión" al final
  de la pantalla (además del que ya existe en `AccountMenu`), con
  tratamiento visual distinto (ghost/rojo) al resto de botones de
  guardado de la pantalla
- Corregida la asimetría vertical del ícono de cuenta entre pantallas:
  nuevo `ScreenHeader.jsx` centraliza el layout de BackButton +
  AccountMenu (con placeholders cuando falta alguno) para que el
  posicionamiento sea idéntico en todas las pantallas que los usan
- Eliminar cuenta, end-to-end (backend + frontend): Edge Function
  `eliminar-cuenta` (borra Storage de notas de voz, luego el usuario de
  Auth, con cascada hacia `profiles`/`contactos_confianza`/
  `bitacora_entradas`) ya conectada a una sección real "Zona de peligro"
  al final de `/perfil`, con confirmación por texto exacto "ELIMINAR"
  (ver DECISIONS.md). Al eliminar, navega a `/elegir?cuenta_eliminada=1`
  (mismo orden navegar-antes-de-signOut ya usado en cerrar sesión), que
  muestra un banner breve "Tu cuenta fue eliminada".

- Panel de Acompañamiento (`PanelAcompanamiento.jsx`): los placeholders
  simulados de "Contactar a tu persona" / "Llamar" / "Mensaje" ahora son
  funciones reales, reutilizando la misma lista de `contactos_confianza`
  y la lógica de resolución 0/1/2-3 contactos ya construida en
  `IslaAuxilio.jsx`/`compartirUbicacion.js` (ver DECISIONS.md).
  "Contactar a tu persona" navega a `/islas/auxilio`; Llamar usa `tel:`;
  Mensaje abre WhatsApp (`wa.me`) sin texto prellenado, con la misma
  validación de código de país que "Compartir ubicación". El botón
  "Probar alerta" fue eliminado por completo — era simulación sin
  función real detrás, no un placeholder a reemplazar por algo nuevo.

## Pendiente / ideas anotadas para retomar (sin fecha)
- Rediseño estructural grande: layouts distintos por tipo de pantalla en
  vez de la misma plantilla (header + tarjetas apiladas + botón) repetida
  — quedó en pausa antes de la ronda de backend
- Ubicación en tiempo real (requiere backend adicional: Supabase Realtime
  + página propia de mapa en vivo) — pospuesto, ver DECISIONS.md
- Revisión legal profesional del texto de `/privacidad` — el contenido ya
  no es placeholder, pero falta que alguien con criterio legal lo valide
  antes de considerarlo definitivo
- Actualizar el README del repo para que ya no describa funciones como
  "placeholder" que dejaron de serlo (llamadas, compartir ubicación, nota
  de voz, transcripción ya son reales)
