-- ============================================================
-- Tabla: herramientas_faro
-- ============================================================
-- Herramientas de la Isla del Faro: cada persona tiene su propia lista
-- (ícono + texto), puede marcar favoritas y reordenarlas. `orden` es la
-- posición en la lista completa; el frontend la reescribe al reordenar.
create table public.herramientas_faro (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  icon text not null,
  label text not null check (char_length(btrim(label)) between 1 and 120),
  favorite boolean not null default false,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index herramientas_faro_user_orden_idx on public.herramientas_faro(user_id, orden);

alter table public.herramientas_faro enable row level security;

create policy "Usuarios ven solo sus propias herramientas"
  on public.herramientas_faro for select
  using (auth.uid() = user_id);

create policy "Usuarios crean solo sus propias herramientas"
  on public.herramientas_faro for insert
  with check (auth.uid() = user_id);

create policy "Usuarios editan solo sus propias herramientas"
  on public.herramientas_faro for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios eliminan solo sus propias herramientas"
  on public.herramientas_faro for delete
  using (auth.uid() = user_id);

-- Sin este GRANT, RLS falla con 403 "permission denied" antes de evaluar
-- las policies (ver supabase/AGENTS.md y DECISIONS.md).
grant select, insert, update, delete on public.herramientas_faro to authenticated;

-- updated_at automático (reutiliza la función del esquema inicial)
create trigger trg_herramientas_faro_updated_at
  before update on public.herramientas_faro
  for each row execute function public.set_updated_at();
