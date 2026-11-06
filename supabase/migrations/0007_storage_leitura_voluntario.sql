-- O Storage grava a foto com INSERT ... RETURNING (e upsert), e isso exige permissão de SELECT
-- em storage.objects. Sem esta política o envio pelo painel falhava com 400 (RLS).
create policy voluntario_le on storage.objects for select to authenticated
  using (bucket_id in ('cartinhas', 'galeria', 'patrocinadores') and privado.eh_voluntario());
