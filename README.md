# ANCLA / Calma

App web de acompañamiento emocional para estudiantes universitarios —
herramientas de regulación emocional, apoyo en crisis, y acompañamiento
entre pares. Proyecto del equipo VibeCoders.

📖 Para contexto completo del proyecto (qué es, qué preservar, arquitectura
técnica, decisiones tomadas, estado actual), ver la carpeta [`docs/`](./docs).

## Estructura del repo

```
calma-app/          → frontend (React + Vite + Tailwind + Framer Motion)
supabase/            → migraciones SQL, config del CLI, RLS, Storage
design-reference/    → prototipo HTML estático (solo referencia visual)
docs/                → documentación del proyecto (ver índice abajo)
```

## Empezar a desarrollar

```bash
npm run install:app   # instala dependencias del frontend
npm run dev            # levanta el servidor de desarrollo
```

Variables de entorno necesarias en `calma-app/.env.local` (ver
`calma-app/.env.example`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Backend (Supabase)

```bash
npm run db:migration nombre_descriptivo   # crea una migración nueva
npm run db:push                            # aplica migraciones al proyecto vinculado
```

Requiere haber corrido `supabase login` y `supabase link --project-ref TU_REF`
una vez (ver `docs/ARCHITECTURE.md`).

## Deploy

Vercel, deploy automático por rama (`main` = producción). Root Directory del
proyecto en Vercel: `calma-app`.

## Documentación

- [`docs/PROJECT.md`](./docs/PROJECT.md) — qué es ANCLA/Calma, qué no debe
  cambiar sin discutirlo
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — rutas, esquema de base
  de datos, componentes clave
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — decisiones deliberadas que
  pueden parecer bugs pero no lo son
- [`docs/TASKS.md`](./docs/TASKS.md) — estado actual, qué está en progreso

## Trabajando con agentes de código (Claude Code / Codex)

Este repo usa `AGENTS.md` como fuente de instrucciones compartida (raíz,
`calma-app/`, `supabase/`), con un `CLAUDE.md` en cada una de esas carpetas
que solo importa el `AGENTS.md` correspondiente. Ver `AGENTS.md` en la raíz
para las convenciones completas.
