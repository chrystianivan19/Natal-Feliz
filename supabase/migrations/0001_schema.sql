-- NATAL FELIZ 2026 — schema base (spec §3)

create type public.genero_t as enum ('menino', 'menina');
create type public.status_cartinha_t as enum ('disponivel', 'pendente', 'apadrinhada');
create type public.status_adocao_t as enum ('pendente', 'aprovada', 'recusada', 'expirada', 'cancelada');

create or replace function public.tocar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

create table public.cartinhas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^C\d{3,4}$'),
  primeiro_nome text not null check (length(primeiro_nome) between 1 and 40),
  idade int not null check (idade between 0 and 17),
  genero public.genero_t not null,
  pedido text not null check (length(pedido) between 1 and 200),
  tamanho_roupa text,
  tamanho_calcado text,
  observacoes text,
  imagem_path text,
  status public.status_cartinha_t not null default 'disponivel',
  teste boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create trigger cartinhas_atualizado before update on public.cartinhas
  for each row execute function public.tocar_atualizado_em();

create table public.adocoes (
  id uuid primary key default gen_random_uuid(),
  cartinha_id uuid not null references public.cartinhas(id) on delete cascade,
  padrinho_nome text not null,
  padrinho_whatsapp text not null check (padrinho_whatsapp ~ '^\d{10,11}$'),
  padrinho_email text not null,
  status public.status_adocao_t not null default 'pendente',
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default now() + interval '24 hours',
  decidido_em timestamptz,
  decidido_por text,
  ip_hash text
);
create index adocoes_cartinha_idx on public.adocoes (cartinha_id);
create index adocoes_pendentes_idx on public.adocoes (status, expira_em) where status = 'pendente';
-- no máximo uma adoção ativa (pendente ou aprovada) por cartinha
create unique index adocoes_uma_ativa_idx on public.adocoes (cartinha_id)
  where status in ('pendente', 'aprovada');

create table public.historico (
  id bigint generated always as identity primary key,
  adocao_id uuid references public.adocoes(id) on delete set null,
  acao text not null,
  voluntario_email text,
  quando timestamptz not null default now(),
  detalhe text
);

create table public.pontos_entrega (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text not null,
  horario text,
  maps_url text,
  ordem int not null default 0,
  ativo boolean not null default true
);

create table public.patrocinadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  logo_path text,
  link text,
  ordem int not null default 0,
  ativo boolean not null default true
);

create table public.edicoes (
  id uuid primary key default gen_random_uuid(),
  ano int not null unique,
  edicao_numero int,
  criancas_atendidas int,
  presentes_entregues int,
  texto text,
  ordem int not null default 0
);

create table public.edicao_fotos (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references public.edicoes(id) on delete cascade,
  foto_path text not null,
  alt text,
  ordem int not null default 0
);

create table public.configuracoes (
  id int primary key default 1 check (id = 1),
  pix_chave text,
  pix_tipo text,
  pix_recebedor text,
  pix_cidade text,
  pix_banco text,
  whatsapp_contato text,
  evento_data_hora timestamptz not null default '2026-12-29 09:00:00-03',
  prazo_entrega date not null default '2026-12-23',
  video_url text,
  video_capa_path text
);
insert into public.configuracoes (id) values (1);

create table public.voluntarios (
  email text primary key check (email = lower(email)),
  nome text,
  ativo boolean not null default true
);

-- Leitura pública por views com security_invoker: a RLS e os grants de coluna
-- (0002_rls.sql) decidem o que o anônimo enxerga.
create view public.cartinhas_publicas with (security_invoker = true) as
  select id, codigo, primeiro_nome, idade, genero, pedido, tamanho_roupa, tamanho_calcado, imagem_path, status
  from public.cartinhas;

create view public.configuracoes_publicas with (security_invoker = true) as
  select pix_chave, pix_tipo, pix_recebedor, pix_cidade, pix_banco, whatsapp_contato,
         evento_data_hora, prazo_entrega, video_url, video_capa_path
  from public.configuracoes;
