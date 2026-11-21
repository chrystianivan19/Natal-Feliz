-- Contador de caixas de bombom: "temos" é atualizado pela equipe no painel (Pix de R$ 15 + caixas entregues).
alter table public.configuracoes add column bombom_recebidas int not null default 0
  check (bombom_recebidas >= 0);

grant select (bombom_recebidas) on public.configuracoes to anon;

create or replace view public.configuracoes_publicas with (security_invoker = true) as
  select pix_chave, pix_tipo, pix_recebedor, pix_cidade, pix_banco, whatsapp_contato,
         evento_data_hora, prazo_entrega, video_url, video_capa_path, bombom_valor, bombom_recebidas
  from public.configuracoes;
