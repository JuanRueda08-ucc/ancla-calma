# Proyecto ANCLA / Calma

## Qué es
Calma es una app web de acompañamiento emocional para estudiantes universitarios,
parte de la iniciativa ANCLA (equipo VibeCoders). Ofrece herramientas de
regulación emocional, apoyo en crisis, y acompañamiento entre pares.

Origen: rediseño completo (visual y técnico) de un prototipo original hecho en
Figma Sites, preservando el 100% de la funcionalidad original, con backend
real agregado después (Supabase).

## Lo que NUNCA debe cambiar sin discutirlo explícitamente

**Ninguna herramienta de calma debe quedar detrás de un login.** Respiración,
grounding, ejercicios sensoriales, relajación muscular, señales de alerta —
todo debe seguir siendo de acceso inmediato, sin fricción, incluso para
alguien sin cuenta. Solo Bitácora, Historial y Contactos de confianza
requieren sesión iniciada (necesitan persistir datos reales del usuario).

**Ninguna función de ubicación debe convertirse en tracking en vivo** sin una
decisión explícita y documentada (ver docs/DECISIONS.md) — implica backend
adicional, consideraciones de privacidad serias, y fue pospuesto a propósito.

**RLS (Row Level Security) es obligatorio en toda tabla nueva de Supabase**,
sin excepción, junto con el GRANT explícito correspondiente. Ver
docs/DECISIONS.md para el bug histórico de por qué esto se volvió una regla
no negociable.

**El personaje pirata (Isla del Aire → Relajación muscular) es arte de marca
real**, no un placeholder — cualquier cambio a esos assets debe mantener el
estilo ilustrado/con textura, no reemplazarlo por vectores planos sin
discutirlo primero.

## Estructura narrativa de la app (por si se agregan pantallas nuevas)
La app usa la metáfora de un archipiélago: Isla del Auxilio (ayuda/contactos),
Isla del Aire (respiración/calma), Isla del Faro (recursos personales), Isla
de las Señales (autoconocimiento), más Bitácora y Panel de Acompañamiento
(para quien apoya a otra persona). Cada isla tiene su propia paleta de color
(ver tailwind.config.js) pero comparte tipografía y componentes base.

## Para más detalle técnico
- Arquitectura completa: `docs/ARCHITECTURE.md`
- Por qué se tomaron ciertas decisiones: `docs/DECISIONS.md`
- Estado actual / qué está en progreso: `docs/TASKS.md`
