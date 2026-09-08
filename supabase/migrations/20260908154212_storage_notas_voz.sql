-- Bucket privado para las notas de voz — nunca público, el audio de
-- una bitácora emocional es dato sensible.
insert into storage.buckets (id, name, public)
values ('notas-voz', 'notas-voz', false)
on conflict (id) do nothing;

-- Convención de nombres de archivo: {user_id}/{entrada_id}.webm
-- Las políticas usan el primer segmento de la ruta como el user_id,
-- así RLS aísla el acceso sin necesitar una tabla aparte para esto.

create policy "Usuarios suben audio a su propia carpeta"
on storage.objects for insert
with check (
  bucket_id = 'notas-voz'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Usuarios leen audio de su propia carpeta"
on storage.objects for select
using (
  bucket_id = 'notas-voz'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Usuarios eliminan audio de su propia carpeta"
on storage.objects for delete
using (
  bucket_id = 'notas-voz'
  and (storage.foldername(name))[1] = auth.uid()::text
);