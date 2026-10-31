-- ============================================================
-- Tabla: ubicaciones_en_vivo
-- ============================================================
-- Sesiones de "Compartir ubicación en vivo" (Isla del Auxilio). La persona
-- elige 15, 60 o 240 minutos; su teléfono va sobrescribiendo SOLO el último
-- punto (nunca un recorrido) mientras la app está abierta. Sus contactos de
-- confianza no tienen cuenta: ven la ubicación con un enlace secreto
-- (`token`) a través de la función `ver_ubicacion_en_vivo`, nunca leyendo
-- la tabla directamente. Al detenerse o vencer, las coordenadas se borran.
create table public.ubicaciones_en_vivo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- 64 caracteres hex (dos UUID v4 sin guiones, ~244 bits aleatorios):
  -- adivinarlo no es práctico, y es lo único que da acceso de lectura.
  token text not null unique
    default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  duracion_min integer not null check (duracion_min in (15, 60, 240)),
  expira_at timestamptz not null,
  detenida_at timestamptz,
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  precision_m real check (precision_m >= 0),
  actualizada_at timestamptz,
  created_at timestamptz not null default now()
);

create index ubicaciones_en_vivo_user_id_idx on public.ubicaciones_en_vivo(user_id);

alter table public.ubicaciones_en_vivo enable row level security;

create policy "Usuarios ven solo sus propias sesiones de ubicación"
  on public.ubicaciones_en_vivo for select
  using (auth.uid() = user_id);

create policy "Usuarios crean solo sus propias sesiones de ubicación"
  on public.ubicaciones_en_vivo for insert
  with check (auth.uid() = user_id);

create policy "Usuarios actualizan solo sus propias sesiones de ubicación"
  on public.ubicaciones_en_vivo for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios eliminan solo sus propias sesiones de ubicación"
  on public.ubicaciones_en_vivo for delete
  using (auth.uid() = user_id);

-- Sin este GRANT, RLS falla con 403 "permission denied" antes de evaluar
-- las policies (ver supabase/AGENTS.md y DECISIONS.md). `anon` NO recibe
-- acceso a la tabla: solo puede llamar a ver_ubicacion_en_vivo().
grant select, insert, update, delete on public.ubicaciones_en_vivo to authenticated;

-- ============================================================
-- Reglas al crear una sesión
-- ============================================================
-- El vencimiento lo calcula la base de datos (no el cliente), así nadie
-- puede crear un enlace de más de 4 horas. Además, al iniciar una sesión
-- nueva se detienen las anteriores de la misma persona (una sola activa a
-- la vez) y se limpian coordenadas viejas que pudieran haber quedado.
create or replace function public.ubicacion_en_vivo_al_crear()
returns trigger
language plpgsql
as $$
begin
  new.expira_at := now() + make_interval(mins => new.duracion_min);
  new.detenida_at := null;
  new.created_at := now();
  new.actualizada_at := case when new.lat is not null then now() end;

  update public.ubicaciones_en_vivo
    set detenida_at = coalesce(detenida_at, now()), lat = null, lng = null, precision_m = null
    where user_id = new.user_id
      and (detenida_at is null or lat is not null);

  -- Las sesiones terminadas hace más de un día ya no sirven para nada.
  delete from public.ubicaciones_en_vivo
    where user_id = new.user_id
      and coalesce(detenida_at, expira_at) < now() - interval '1 day';

  return new;
end;
$$;

create trigger trg_ubicacion_en_vivo_al_crear
  before insert on public.ubicaciones_en_vivo
  for each row execute function public.ubicacion_en_vivo_al_crear();

-- ============================================================
-- Reglas al actualizar una sesión
-- ============================================================
-- Desde el cliente solo se pueden cambiar la posición y detener la sesión:
-- token, duración y vencimiento son inmutables (no se puede "alargar" un
-- enlace). Una sesión detenida o vencida no acepta más posiciones, y al
-- detenerse se borran las coordenadas.
create or replace function public.ubicacion_en_vivo_al_actualizar()
returns trigger
language plpgsql
as $$
begin
  new.user_id := old.user_id;
  new.token := old.token;
  new.duracion_min := old.duracion_min;
  new.expira_at := old.expira_at;
  new.created_at := old.created_at;

  -- una vez detenida, no se puede reanudar
  if old.detenida_at is not null then
    new.detenida_at := old.detenida_at;
  end if;

  if new.detenida_at is not null or new.expira_at <= now() then
    new.lat := null;
    new.lng := null;
    new.precision_m := null;
  elsif new.lat is not null then
    -- cada envío renueva la hora aunque la persona esté quieta: así el
    -- contacto distingue "no se ha movido" de "la app dejó de enviar"
    new.actualizada_at := now();
  end if;

  return new;
end;
$$;

create trigger trg_ubicacion_en_vivo_al_actualizar
  before update on public.ubicaciones_en_vivo
  for each row execute function public.ubicacion_en_vivo_al_actualizar();

-- ============================================================
-- Función pública: ver una ubicación compartida
-- ============================================================
-- La usa la página /ubicacion/:token, abierta por contactos SIN cuenta
-- (rol anon). `security definer` para poder leer la fila sin abrir la tabla
-- a anon: solo devuelve la sesión cuyo token coincide exactamente, y solo
-- devuelve coordenadas si sigue activa. Si ya venció o se detuvo, aprovecha
-- para borrar las coordenadas que hayan quedado.
create or replace function public.ver_ubicacion_en_vivo(p_token text)
returns table (
  estado text,
  nombre text,
  lat double precision,
  lng double precision,
  precision_m real,
  actualizada_at timestamptz,
  expira_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  sesion public.ubicaciones_en_vivo%rowtype;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return;
  end if;

  select * into sesion from public.ubicaciones_en_vivo u where u.token = p_token;
  if not found then
    return;
  end if;

  if sesion.detenida_at is not null or sesion.expira_at <= now() then
    if sesion.lat is not null then
      update public.ubicaciones_en_vivo
        set lat = null, lng = null, precision_m = null
        where id = sesion.id;
    end if;
    return query select 'terminada'::text, null::text, null::double precision,
      null::double precision, null::real, null::timestamptz, sesion.expira_at;
    return;
  end if;

  return query
    select 'activa'::text,
      coalesce(nullif(btrim(p.display_name), ''), 'Alguien de confianza'),
      sesion.lat, sesion.lng, sesion.precision_m, sesion.actualizada_at, sesion.expira_at
    from (select 1) as uno
    left join public.profiles p on p.id = sesion.user_id;
end;
$$;

revoke all on function public.ver_ubicacion_en_vivo(text) from public;
grant execute on function public.ver_ubicacion_en_vivo(text) to anon, authenticated;
