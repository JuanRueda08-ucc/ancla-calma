# Reglas específicas — calma-app/ (frontend)

Ver también: ../AGENTS.md (raíz), ../docs/ARCHITECTURE.md, ../docs/DECISIONS.md

## Stack y patrones
- React + Vite + Tailwind + Framer Motion. Sin TypeScript por ahora.
- Estilos SOLO con los tokens de `tailwind.config.js` (colores por isla:
  `auxilio`, `aire`, `faro`, `senales`, `acomp`, más `brand.navy`/`sand`/`ink`).
  No introducir valores hex sueltos en className.
- Tipografía: Poppins para todo excepto el wordmark "CALMA" (Comba Test,
  demo font sin tildes/ñ — nunca usarla en texto con acentos).
- Animaciones de entrada de pantalla: reutilizar `src/animations/transitions.js`
  (`riseIn` y afines), no inventar timings/easings nuevos sueltos por
  componente.

## Patrones de pantalla ya establecidos (seguirlos, no reinventar)
- Confirmación de acciones destructivas (eliminar contacto/entrada): patrón
  inline de dos pasos ("¿Eliminar? / cancelar"), NUNCA `window.confirm`.
- Pantallas protegidas: envolver con `<RequireAuth>` en el router, no
  implementar chequeos de sesión manuales dentro del componente de pantalla.
- Ejercicios guiados (Puerto Seguro): usar `GuidedExerciseShell` — no
  reimplementar la barra de progreso/temporizador/pausa a mano.
- Todas las funciones de `contactosStorage.js`, `bitacoraStorage.js`,
  `audioStorage.js` son ASYNC (hablan con Supabase) — cualquier componente
  que las use necesita manejar estados de carga/error, no asumir que
  resuelven de forma síncrona.

## Antes de escribir CSS/posicionamiento a mano
Si el cambio involucra posicionar overlays o elementos sobre una imagen
(como los resaltados del personaje pirata), usar SIEMPRE porcentajes
relativos al contenedor, nunca píxeles fijos — la app es responsiva y se
prueba en mobile.

## No tocar sin discutir primero
- `EjercicioRespiracion.jsx`: la animación de escala del círculo ignora
  `prefers-reduced-motion` a propósito (ver DECISIONS.md) — no "arreglarlo"
  agregando ese chequeo de vuelta.
- Assets de `src/assets/personajes/pirata/`: son arte de marca real
  extraído de un PDF, no placeholders.
