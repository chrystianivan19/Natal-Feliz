-- Cartinhas cuja imagem foi refeita com IA (pedido do usuário em 24/11/2026): a criança escreveu,
-- mas o papel não chegou até a equipe por causa do deslocamento. O site mostra um aviso.
alter table public.cartinhas add column feita_com_ia boolean not null default false;

grant select (feita_com_ia) on public.cartinhas to anon;

create or replace view public.cartinhas_publicas with (security_invoker = true) as
  select id, codigo, primeiro_nome, idade, genero, pedido, tamanho_roupa, tamanho_calcado, imagem_path, status, feita_com_ia
  from public.cartinhas;
