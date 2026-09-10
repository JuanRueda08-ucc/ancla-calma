# ANCLA / Calma — Guía para agentes de código

## Qué es esto
Calma es la app de acompañamiento emocional del proyecto ANCLA (equipo VibeCoders).
Frontend React + Vite + Tailwind + Framer Motion. Backend Supabase (Postgres + Auth + Storage).

## Estructura del repo
- `calma-app/` — el frontend, toda la app vive aquí (React + Vite + Tailwind)
- `supabase/` — migraciones SQL y config del CLI de Supabase (schema, RLS, Storage). Se maneja desde la RAÍZ del repo, no desde calma-app/
- `design-reference/` — prototipo HTML estático, referencia visual del sistema de diseño (paleta, tipografía, componentes). NO es código de producción, solo consulta

## Comandos
Todos se corren desde la RAÍZ del repo (hay un package.json raíz con scripts
de conveniencia que delegan a calma-app — no es un monorepo con workspaces,
solo un punto de entrada único):
- Instalar dependencias: `npm run install:app`
- Servidor de desarrollo: `npm run dev`
- Build: `npm run build`
- Nueva migración de Supabase: `npm run db:migration nombre_descriptivo`
- Aplicar migraciones: `npm run db:push` (requiere `supabase link` ya hecho una vez)

## Convenciones
- Commits en inglés, formato Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Cambios grandes o riesgosos van en una rama `feature/nombre-descriptivo`; abrir PR en borrador, probar en el preview de Vercel, fusionar a `main` solo cuando esté verificado de punta a punta
- Guarda siempre los archivos antes de correr `supabase db push` — un archivo de migración sin guardar se aplica vacío sin ningún error visible
- Tailwind con los tokens ya definidos en `tailwind.config.js` (paleta por isla: auxilio, aire, faro, senales, acomp, más brand.navy) — no introducir colores sueltos fuera de esos tokens
- Nunca commitear `.env` / `.env.local` (ya están en .gitignore); usar `.env.example` como plantilla

## Seguridad de datos
- Toda tabla nueva en Supabase necesita RLS activado + políticas explícitas + GRANT explícito a `authenticated` en la tabla base (RLS sin GRANT falla en silencio con 403 "permission denied" antes de evaluar ninguna policy)
- La `service_role` key nunca debe usarse ni exponerse en el frontend — solo en contexto de servidor (edge functions), y nunca con prefijo `VITE_`
- Ninguna ubicación/dato sensible se persiste salvo que el usuario lo haya guardado explícitamente (ver `compartirUbicacion.js` para el patrón de "calcular y descartar")

## Deploy
- Vercel, Root Directory = `calma-app`, deploys automáticos por rama (main = producción, cualquier otra rama = preview)
- Variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configuradas en el dashboard de Vercel para los 3 ambientes (Production/Preview/Development) — no viven en el repo
