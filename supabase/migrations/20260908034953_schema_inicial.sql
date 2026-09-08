-- ============================================================
-- Tabla: contactos_confianza
-- ============================================================
create table public.contactos_confianza (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contactos_confianza_user_id_idx on public.contactos_confianza(user_id);

-- Máximo 3 contactos por usuario, reforzado a nivel de base de datos
-- (no solo en el frontend, que se puede evadir).
create or replace function public.enforce_max_contactos()
returns trigger as $$
begin
  if (select count(*) from public.contactos_confianza where user_id = new.user_id) >= 3 then
    raise exception 'Máximo 3 contactos de confianza por usuario';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_max_contactos
  before insert on public.contactos_confianza
  for each row execute function public.enforce_max_contactos();

alter table public.contactos_confianza enable row level security;

create policy "Usuarios ven solo sus propios contactos"
  on public.contactos_confianza for select
  using (auth.uid() = user_id);

create policy "Usuarios crean solo sus propios contactos"
  on public.contactos_confianza for insert
  with check (auth.uid() = user_id);

create policy "Usuarios editan solo sus propios contactos"
  on public.contactos_confianza for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios eliminan solo sus propios contactos"
  on public.contactos_confianza for delete
  using (auth.uid() = user_id);


-- ============================================================
-- Tabla: bitacora_entradas
-- ============================================================
create table public.bitacora_entradas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tags text[] not null default '{}',
  emocion_libre text,
  que_siento text,
  que_ocurrio text,
  que_necesito text,
  que_ayudo text,
  tiene_nota_voz boolean not null default false,
  nota_voz_duracion integer,
  created_at timestamptz not null default now()
);

create index bitacora_entradas_user_id_idx on public.bitacora_entradas(user_id);
create index bitacora_entradas_created_at_idx on public.bitacora_entradas(created_at desc);

alter table public.bitacora_entradas enable row level security;

create policy "Usuarios ven solo sus propias entradas"
  on public.bitacora_entradas for select
  using (auth.uid() = user_id);

create policy "Usuarios crean solo sus propias entradas"
  on public.bitacora_entradas for insert
  with check (auth.uid() = user_id);

create policy "Usuarios eliminan solo sus propias entradas"
  on public.bitacora_entradas for delete
  using (auth.uid() = user_id);

-- Nota: no se agrega policy de UPDATE a propósito — las entradas de
-- bitácora son un registro histórico, no se editan una vez guardadas
-- (igual que en localStorage hoy). Si en el futuro se necesita editar,
-- se agrega la policy explícitamente en ese momento.


-- ============================================================
-- updated_at automático en contactos_confianza
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_contactos_updated_at
  before update on public.contactos_confianza
  for each row execute function public.set_updated_at();