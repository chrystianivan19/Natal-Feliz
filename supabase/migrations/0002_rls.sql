-- RLS e permissões (spec §3 "Regras de acesso")

create or replace function public.eh_voluntario() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.voluntarios v
    where v.ativo and v.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.eh_voluntario() from public;
grant execute on function public.eh_voluntario() to anon, authenticated;

alter table public.cartinhas enable row level security;
alter table public.adocoes enable row level security;
alter table public.historico enable row level security;
alter table public.pontos_entrega enable row level security;
alter table public.patrocinadores enable row level security;
alter table public.edicoes enable row level security;
alter table public.edicao_fotos enable row level security;
alter table public.configuracoes enable row level security;
alter table public.voluntarios enable row level security;

-- Tabelas sensíveis: nada para anon; tudo para voluntários.
revoke all on public.adocoes, public.historico, public.voluntarios from anon;

-- Cartinhas e configurações: anon lê só colunas públicas.
revoke select on public.cartinhas, public.configuracoes from anon;
grant select (id, codigo, primeiro_nome, idade, genero, pedido, tamanho_roupa, tamanho_calcado, imagem_path, status)
  on public.cartinhas to anon;
grant select (pix_chave, pix_tipo, pix_recebedor, pix_cidade, pix_banco, whatsapp_contato,
              evento_data_hora, prazo_entrega, video_url, video_capa_path)
  on public.configuracoes to anon;
grant select on public.cartinhas_publicas, public.configuracoes_publicas to anon, authenticated;

-- Leitura pública
create policy leitura_publica on public.cartinhas for select to anon, authenticated using (true);
create policy leitura_publica on public.configuracoes for select to anon, authenticated using (true);
create policy leitura_publica on public.pontos_entrega for select to anon, authenticated using (ativo or public.eh_voluntario());
create policy leitura_publica on public.patrocinadores for select to anon, authenticated using (ativo or public.eh_voluntario());
create policy leitura_publica on public.edicoes for select to anon, authenticated using (true);
create policy leitura_publica on public.edicao_fotos for select to anon, authenticated using (true);

-- Voluntários: escrita em tudo, leitura do que é sensível
create policy voluntario_tudo on public.cartinhas for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.adocoes for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.historico for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.pontos_entrega for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.patrocinadores for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.edicoes for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.edicao_fotos for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.configuracoes for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
create policy voluntario_tudo on public.voluntarios for all to authenticated using (public.eh_voluntario()) with check (public.eh_voluntario());
