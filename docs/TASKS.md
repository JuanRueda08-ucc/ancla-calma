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

## Pendiente / ideas anotadas para retomar (sin fecha)
- Eliminar cuenta (Edge Function) — siguiente paso ya planeado para el
  panel de perfil: la política de privacidad remite a contacto manual
  por correo mientras tanto, ver DECISIONS.md
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
