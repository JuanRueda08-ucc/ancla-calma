# Reglas específicas — supabase/ (base de datos, RLS, Storage)

Ver también: ../AGENTS.md (raíz), ../docs/ARCHITECTURE.md, ../docs/DECISIONS.md

## Antes de crear o modificar cualquier migración
1. Nueva migración: `supabase migration new nombre_descriptivo` (o
   `npm run db:migration nombre_descriptivo` desde la raíz).
2. **GUARDAR EL ARCHIVO (Ctrl+S) antes de correr `db push`.** Un archivo de
   migración sin guardar se aplica como si estuviera vacío, sin ningún
   error — Postgres no falla al ejecutar "nada", y el CLI lo marca como
   "aplicado" igual. Ya pasó una vez, costó una ronda completa de debugging.
3. Aplicar: `supabase db push` (o `npm run db:push` desde la raíz).
4. **Verificar directo en el SQL Editor del dashboard** después de aplicar,
   no confiar solo en el mensaje "Finished" del CLI — hay casos reales
   documentados de que el CLI marca una migración como aplicada en su
   tabla de seguimiento interno sin que el contenido real se haya
   ejecutado correctamente.

## Toda tabla nueva necesita, sin excepción
1. `alter table nombre enable row level security;`
2. Policies explícitas para cada operación que se vaya a usar
   (select/insert/update/delete) — nunca dejar una tabla con RLS activado
   pero sin policies (equivale a bloquear todo el acceso).
3. `grant select, insert, update, delete on nombre to authenticated;`
   (ajustar qué verbos según qué operaciones aplican) — **esto es
   independiente de las policies y se olvida fácil**. RLS sin GRANT falla
   con 403 "permission denied" antes de que se evalúe ninguna policy. Ver
   DECISIONS.md para el historial de este bug (pasó dos veces).

## Storage
- Buckets de contenido de usuario van `public: false` siempre, salvo
  decisión explícita en contrario.
- Convención de rutas: `{user_id}/{identificador}.ext` — las políticas de
  `storage.objects` filtran con
  `(storage.foldername(name))[1] = auth.uid()::text`, así que el primer
  segmento de la ruta SIEMPRE debe ser el user_id real.

## No tocar sin discutir primero
- `bitacora_entradas` no tiene policy de UPDATE — es intencional (entradas
  inmutables), no un olvido.
- El trigger de máximo 3 contactos en `contactos_confianza` usa
  `security definer` a propósito (si no, el `count(*)` interno choca con
  las mismas policies de RLS de forma circular).
