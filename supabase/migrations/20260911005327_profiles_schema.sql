-- ============================================================
-- Tabla: profiles
-- ============================================================
-- Relación 1:1 con auth.users. El id ES el user_id (no una columna
-- separada) — patrón estándar de Supabase para datos de perfil.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  avatar_id text not null default 'pirata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuarios ven solo su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios actualizan solo su propio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Sin policy de INSERT para el usuario final a propósito: el perfil se
-- crea automáticamente vía trigger (abajo), nunca manualmente desde el
-- frontend. Sin policy de DELETE tampoco: se borra en cascada cuando se
-- borra el usuario de auth.users (ver Edge Function de eliminar cuenta).

grant select, update on public.profiles to authenticated;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
  -- reutiliza la función set_updated_at() ya creada en la migración
  -- inicial (contactos_confianza) — no la dupliques.

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, avatar_id)
  values (new.id, 'pirata');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_create_profile_on_signup
  after insert on auth.users
  for each row execute function public.handle_new_user();