-- La tabla contactos_confianza tiene RLS y sus policies, pero al crearla
-- por migración (en vez de por el Table Editor) el rol `authenticated`
-- nunca recibió el GRANT base sobre la tabla. Sin ese GRANT, Postgres
-- rechaza la consulta con "permission denied" ANTES de siquiera evaluar
-- las policies de RLS. Este GRANT es el que Supabase mismo sugiere en
-- el hint del error.
grant select, insert, update, delete on public.contactos_confianza to authenticated;
