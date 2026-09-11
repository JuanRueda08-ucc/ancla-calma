-- Nombre de usuario opcional, sin restricción de unicidad (no es un
-- identificador público entre usuarios todavía, solo un nombre para
-- mostrarle a la propia persona).
alter table public.profiles add column display_name text;