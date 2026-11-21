-- Caixa de bombom (pedido do usuário em 21/11/2026): uma por criança; doação por Pix com valor fixo.
alter table public.configuracoes add column bombom_valor numeric(8,2) not null default 15.00
  check (bombom_valor >= 0);

grant select (bombom_valor) on public.configuracoes to anon;

create or replace view public.configuracoes_publicas with (security_invoker = true) as
  select pix_chave, pix_tipo, pix_recebedor, pix_cidade, pix_banco, whatsapp_contato,
         evento_data_hora, prazo_entrega, video_url, video_capa_path, bombom_valor
  from public.configuracoes;
