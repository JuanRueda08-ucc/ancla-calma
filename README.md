# ANCLA / Calma

**[Español](#español) · [English](#english)**

---

## Español

App web de acompañamiento emocional para estudiantes universitarios —
herramientas de regulación emocional, apoyo en crisis y acompañamiento
entre pares. Proyecto del equipo VibeCoders.

📖 Para contexto completo del proyecto (qué es, qué preservar, arquitectura
técnica, decisiones tomadas, estado actual), ver la carpeta [`docs/`](./docs).

### Estructura del repo

```
calma-app/          → frontend (React + Vite + Tailwind + Framer Motion + Supabase JS)
supabase/            → migraciones SQL, Edge Functions, config del CLI, RLS, Storage
design-reference/    → prototipo HTML estático (solo referencia visual)
docs/                → documentación del proyecto (ver índice abajo)
```

### Empezar a desarrollar

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

Detalle del frontend (stack, rutas, componentes, sistema de diseño) en
[`calma-app/README.md`](./calma-app/README.md).

### Backend (Supabase)

```bash
npm run db:migration nombre_descriptivo   # crea una migración nueva
npm run db:push                            # aplica migraciones al proyecto vinculado
```

Requiere haber corrido `supabase login` y `supabase link --project-ref TU_REF`
una vez (ver `docs/ARCHITECTURE.md`). Toda tabla nueva necesita RLS,
policies y `GRANT` explícito a `authenticated` (ver `supabase/AGENTS.md`).

### Flujo de trabajo y deploy

- Vercel, deploy automático por rama: `main` = producción, cualquier otra
  rama = preview. Root Directory del proyecto en Vercel: `calma-app`.
- `main` está protegida: no admite force push ni borrado, y el check de
  Vercel debe pasar antes de fusionar. Los cambios entran por rama
  (`feature/…`, `docs/…`) + PR.
- Commits en inglés con Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).

### Documentación

- [`docs/PROJECT.md`](./docs/PROJECT.md) — qué es ANCLA/Calma, qué no debe
  cambiar sin discutirlo
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — rutas, esquema de base
  de datos, componentes clave
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — decisiones deliberadas que
  pueden parecer bugs pero no lo son
- [`docs/TASKS.md`](./docs/TASKS.md) — estado actual, qué está en progreso

### Trabajando con agentes de código (Claude Code / Codex)

Este repo usa `AGENTS.md` como fuente de instrucciones compartida (raíz,
`calma-app/`, `supabase/`), con un `CLAUDE.md` en cada una de esas carpetas
que solo importa el `AGENTS.md` correspondiente. Ver `AGENTS.md` en la raíz
para las convenciones completas.

---

## English

Emotional-support web app for university students — emotional regulation
tools, crisis support, and peer support. A VibeCoders team project.

📖 For full project context (what it is, what to preserve, technical
architecture, decisions made, current status), see the [`docs/`](./docs)
folder (written in Spanish).

### Repo structure

```
calma-app/          → frontend (React + Vite + Tailwind + Framer Motion + Supabase JS)
supabase/            → SQL migrations, Edge Functions, CLI config, RLS, Storage
design-reference/    → static HTML prototype (visual reference only)
docs/                → project documentation (see index below)
```

### Getting started

```bash
npm run install:app   # install frontend dependencies
npm run dev            # start the dev server
```

Required environment variables in `calma-app/.env.local` (see
`calma-app/.env.example`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Frontend details (stack, routes, components, design system) are in
[`calma-app/README.md`](./calma-app/README.md).

### Backend (Supabase)

```bash
npm run db:migration descriptive_name   # create a new migration
npm run db:push                          # apply migrations to the linked project
```

Requires running `supabase login` and `supabase link --project-ref YOUR_REF`
once (see `docs/ARCHITECTURE.md`). Every new table needs RLS, policies, and
an explicit `GRANT` to `authenticated` (see `supabase/AGENTS.md`).

### Workflow and deploy

- Vercel, automatic deploys per branch: `main` = production, any other
  branch = preview. Vercel project Root Directory: `calma-app`.
- `main` is protected: no force pushes or deletion, and the Vercel check
  must pass before merging. Changes land through a branch (`feature/…`,
  `docs/…`) + PR.
- Commits in English using Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).

### Documentation

- [`docs/PROJECT.md`](./docs/PROJECT.md) — what ANCLA/Calma is and what
  must not change without discussion
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — routes, database
  schema, key components
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — deliberate decisions that
  may look like bugs but aren't
- [`docs/TASKS.md`](./docs/TASKS.md) — current status and work in progress

### Working with coding agents (Claude Code / Codex)

This repo uses `AGENTS.md` as the shared instruction source (root,
`calma-app/`, `supabase/`), with a `CLAUDE.md` in each of those folders that
only imports the matching `AGENTS.md`. See the root `AGENTS.md` for the full
conventions.
