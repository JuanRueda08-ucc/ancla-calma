# Calma — Proyecto ANCLA

**Calma** es una aplicación de apoyo emocional pensada para acompañar a una persona en momentos de malestar (ansiedad, desborde emocional, crisis leves) y, en paralelo, dar herramientas a quien quiere acompañar a alguien más. Es el rediseño visual de una app ya existente ("Proyecto ANCLA"): misma funcionalidad y flujos, nueva capa de identidad visual (marca navy, formas orgánicas tipo "isla", tipografía Poppins/Comba Test, animaciones con propósito).

Este repositorio contiene:

```
ancla-calma/
├── design-reference/     # Maqueta HTML estática usada como especificación visual
│   └── calma-redesign.html
└── calma-app/             # Implementación real en React + Vite + Tailwind
```

`design-reference/calma-redesign.html` **no es la app** — es un documento de referencia (paleta, tipografía, tarjetas, sombras, olas, blobs) que se usó como guía para construir cada pantalla en `calma-app/`. No se edita ni se sirve; solo se consulta.

## Qué resuelve la app

La app organiza sus herramientas como un archipiélago de "islas", cada una con su propia identidad de color pero un mismo lenguaje visual:

- **Isla del Auxilio** (naranja/coral) — contacto rápido con tu red de apoyo: persona de confianza, compartir ubicación, líneas de ayuda profesional.
- **Isla del Aire** (navy/azul) — respiración y calma: ejercicio de respiración de caja guiado, y un "Puerto Seguro" con tres ejercicios paso a paso (grounding 5-4-3-2-1, relajación muscular progresiva, ejercicios sensoriales).
- **Isla del Faro** (ámbar) — herramientas personales del usuario (lista reordenable de lo que le ayuda: música, caminar, llamar a alguien, respirar).
- **Isla de las Señales** (verde menta) — autoconocimiento: señales emocionales/físicas/cognitivas/conductuales de malestar, en formato acordeón.
- **Bitácora emocional** — registro libre de lo que se siente, con selección múltiple de emociones y notas.
- **Panel de Acompañamiento** — guía para quien quiere ayudar a otra persona: cómo reconocer señales, qué hacer y qué evitar, mensajes de apoyo rápido, y contacto directo.

La entrada a la app bifurca el flujo en dos caminos ("Necesito ayuda" vs. "Quiero ayudar"), cada uno llevando a un subconjunto distinto de estas herramientas.

## Estado del proyecto

Esta es la **capa de interfaz navegable completa**: las 14 pantallas están implementadas con su diseño, animaciones y lógica de interacción (selección de tags, edición/reordenamiento de listas, ciclos de respiración temporizados, acordeones, formularios controlados, etc.). Lo que **no** está implementado todavía es la persistencia/backend real:

- No hay llamadas de red ni base de datos — el estado vive en memoria de cada componente (`useState`).
- Acciones como "llamar", "enviar mensaje", "compartir ubicación", "grabar nota de voz" o "enviar alerta" son *placeholders* con feedback visual (toasts, consola), marcados con comentarios `// TODO` en el código señalando dónde iría la integración real.
- La lista de "Herramientas de apoyo" en el Panel de Acompañamiento está hardcodeada; en el futuro debería poblarse dinámicamente desde el Faro de la persona acompañada.

## Cómo ejecutar

```bash
cd calma-app
npm install
npm run dev
```

Ver [calma-app/README.md](calma-app/README.md) para detalle técnico (stack, estructura de carpetas, mapa de rutas y sistema de diseño).
