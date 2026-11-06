-- Buckets públicos para leitura; escrita só para voluntários (spec §3 Storage)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cartinhas', 'cartinhas', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']),
  ('galeria', 'galeria', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'video/mp4']),
  ('patrocinadores', 'patrocinadores', true, 2097152, array['image/webp', 'image/png', 'image/svg+xml', 'image/jpeg'])
on conflict (id) do nothing;

create policy voluntario_escreve on storage.objects for insert to authenticated
  with check (bucket_id in ('cartinhas', 'galeria', 'patrocinadores') and public.eh_voluntario());
create policy voluntario_atualiza on storage.objects for update to authenticated
  using (bucket_id in ('cartinhas', 'galeria', 'patrocinadores') and public.eh_voluntario());
create policy voluntario_apaga on storage.objects for delete to authenticated
  using (bucket_id in ('cartinhas', 'galeria', 'patrocinadores') and public.eh_voluntario());
