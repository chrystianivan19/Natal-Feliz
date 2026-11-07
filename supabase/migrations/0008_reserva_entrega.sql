-- Agendamento da entrega (pedido do usuário em 07/11/2026): o padrinho escolhe ponto, dia e faixa de 1 hora
-- (09h–21h), identificando-se com o código da cartinha + WhatsApp da adoção. Sem limite por faixa.
-- Uma reserva por adoção; reservar de novo troca a anterior.

alter table public.pontos_entrega
  add column telefone text,
  add column referencia text,
  add column logo_path text;

create table public.reservas_entrega (
  id uuid primary key default gen_random_uuid(),
  adocao_id uuid not null unique references public.adocoes(id) on delete cascade,
  ponto_id uuid not null references public.pontos_entrega(id) on delete restrict,
  dia date not null,
  hora smallint not null check (hora between 9 and 20),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index reservas_entrega_dia_idx on public.reservas_entrega (dia, hora);
create index reservas_entrega_ponto_idx on public.reservas_entrega (ponto_id);
create trigger reservas_entrega_atualizado before update on public.reservas_entrega
  for each row execute function public.tocar_atualizado_em();

alter table public.reservas_entrega enable row level security;
revoke all on public.reservas_entrega from anon;
create policy voluntario_tudo on public.reservas_entrega for all to authenticated
  using (privado.eh_voluntario()) with check (privado.eh_voluntario());

create or replace function public.reservar_entrega(
  p_codigo text, p_whatsapp text, p_ponto uuid, p_dia date, p_hora int, p_ip_hash text
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_zap text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  v_ip text := coalesce(nullif(btrim(p_ip_hash), ''), 'sem-ip');
  v_agora timestamp := now() at time zone 'America/Sao_Paulo';
  v_prazo date;
  v_adocao uuid;
  v_codigo text := upper(btrim(coalesce(p_codigo, '')));
begin
  insert into public.tentativas_ip (ip_hash) values (v_ip);
  if (select count(*) from public.tentativas_ip
      where ip_hash = v_ip and quando > now() - interval '1 hour') > 30 then
    return 'limite';
  end if;

  if p_hora is null or p_hora not between 9 and 20 then
    return 'horario_invalido';
  end if;
  select prazo_entrega into v_prazo from public.configuracoes where id = 1;
  if p_dia is null or p_dia < v_agora::date or p_dia > v_prazo then
    return 'dia_invalido';
  end if;
  if p_dia = v_agora::date and p_hora <= extract(hour from v_agora) then
    return 'horario_invalido';
  end if;
  if not exists (select 1 from public.pontos_entrega where id = p_ponto and ativo) then
    return 'ponto_invalido';
  end if;

  select a.id into v_adocao
    from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id
   where c.codigo = v_codigo and a.status = 'aprovada' and a.padrinho_whatsapp = v_zap;
  if v_adocao is null then
    return 'nao_encontrada';
  end if;

  insert into public.reservas_entrega (adocao_id, ponto_id, dia, hora)
    values (v_adocao, p_ponto, p_dia, p_hora)
  on conflict (adocao_id) do update
    set ponto_id = excluded.ponto_id, dia = excluded.dia, hora = excluded.hora;
  insert into public.historico (adocao_id, acao, detalhe)
    values (v_adocao, 'entrega_agendada', v_codigo || ' · ' || to_char(p_dia, 'DD/MM') || ' ' || p_hora || 'h');
  return 'ok';
end $$;

revoke all on function public.reservar_entrega(text, text, uuid, date, int, text) from public;
grant execute on function public.reservar_entrega(text, text, uuid, date, int, text) to anon, authenticated;

-- Logos dos pontos: bucket público próprio; escrita só da equipe.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pontos', 'pontos', true, 2097152, array['image/webp', 'image/png', 'image/svg+xml', 'image/jpeg'])
on conflict (id) do nothing;

drop policy voluntario_escreve on storage.objects;
drop policy voluntario_atualiza on storage.objects;
drop policy voluntario_apaga on storage.objects;
drop policy voluntario_le on storage.objects;
create policy voluntario_escreve on storage.objects for insert to authenticated
  with check (bucket_id in ('cartinhas', 'galeria', 'patrocinadores', 'pontos') and privado.eh_voluntario());
create policy voluntario_atualiza on storage.objects for update to authenticated
  using (bucket_id in ('cartinhas', 'galeria', 'patrocinadores', 'pontos') and privado.eh_voluntario());
create policy voluntario_apaga on storage.objects for delete to authenticated
  using (bucket_id in ('cartinhas', 'galeria', 'patrocinadores', 'pontos') and privado.eh_voluntario());
create policy voluntario_le on storage.objects for select to authenticated
  using (bucket_id in ('cartinhas', 'galeria', 'patrocinadores', 'pontos') and privado.eh_voluntario());
