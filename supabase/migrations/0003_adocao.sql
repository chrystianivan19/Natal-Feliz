-- Adoção com trava, decisão do voluntário e expiração automática (spec §4)

create table public.tentativas_ip (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  quando timestamptz not null default now()
);
create index tentativas_ip_idx on public.tentativas_ip (ip_hash, quando);
alter table public.tentativas_ip enable row level security; -- sem políticas: só as funções abaixo escrevem
revoke all on public.tentativas_ip from anon, authenticated;

-- Retorna 'ok' | 'indisponivel' | 'limite' | 'nao_encontrada'.
-- Dados inválidos levantam erro 22023 (invalid_parameter_value).
create or replace function public.adotar_cartinha(
  p_codigo text, p_nome text, p_whatsapp text, p_email text, p_ip_hash text
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_zap text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_nome text := btrim(coalesce(p_nome, ''));
  v_ip text := coalesce(nullif(btrim(p_ip_hash), ''), 'sem-ip');
  v_carta public.cartinhas%rowtype;
  v_adocao uuid;
begin
  if v_zap !~ '^\d{10,11}$' then
    raise exception 'whatsapp_invalido' using errcode = '22023';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'email_invalido' using errcode = '22023';
  end if;
  if length(v_nome) not between 2 and 80 then
    raise exception 'nome_invalido' using errcode = '22023';
  end if;

  insert into public.tentativas_ip (ip_hash) values (v_ip);

  select * into v_carta from public.cartinhas where codigo = upper(btrim(p_codigo)) for update;
  if not found then
    return 'nao_encontrada';
  end if;
  if v_carta.status <> 'disponivel' then
    return 'indisponivel';
  end if;

  if (select count(*) from public.adocoes
      where status = 'pendente' and (padrinho_whatsapp = v_zap or padrinho_email = v_email)) >= 3 then
    return 'limite';
  end if;

  if (select count(*) from public.tentativas_ip
      where ip_hash = v_ip and quando > now() - interval '1 hour') > 10 then
    return 'limite';
  end if;

  update public.cartinhas set status = 'pendente' where id = v_carta.id;
  insert into public.adocoes (cartinha_id, padrinho_nome, padrinho_whatsapp, padrinho_email, ip_hash)
    values (v_carta.id, v_nome, v_zap, v_email, v_ip)
    returning id into v_adocao;
  insert into public.historico (adocao_id, acao, detalhe) values (v_adocao, 'pedido', v_carta.codigo);
  return 'ok';
end $$;
revoke all on function public.adotar_cartinha(text, text, text, text, text) from public;
grant execute on function public.adotar_cartinha(text, text, text, text, text) to anon, authenticated;

-- p_acao: 'aprovar' | 'recusar' | 'cancelar'. Retorna 'ok' | 'estado_invalido'.
-- Só voluntários ativos (e-mail do JWT em voluntarios).
create or replace function public.decidir_adocao(p_adocao_id uuid, p_acao text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_adocao public.adocoes%rowtype;
  v_novo public.status_adocao_t;
  v_carta public.status_cartinha_t;
begin
  if not privado.eh_voluntario() then
    raise exception 'apenas voluntarios' using errcode = '42501';
  end if;
  if p_acao not in ('aprovar', 'recusar', 'cancelar') then
    raise exception 'acao_invalida' using errcode = '22023';
  end if;

  select * into v_adocao from public.adocoes where id = p_adocao_id for update;
  if not found then
    return 'estado_invalido';
  end if;

  if p_acao = 'aprovar' and v_adocao.status = 'pendente' then
    v_novo := 'aprovada'; v_carta := 'apadrinhada';
  elsif p_acao = 'recusar' and v_adocao.status = 'pendente' then
    v_novo := 'recusada'; v_carta := 'disponivel';
  elsif p_acao = 'cancelar' and v_adocao.status in ('pendente', 'aprovada') then
    v_novo := 'cancelada'; v_carta := 'disponivel';
  else
    return 'estado_invalido';
  end if;

  update public.adocoes set status = v_novo, decidido_em = now(), decidido_por = v_email where id = v_adocao.id;
  update public.cartinhas set status = v_carta where id = v_adocao.cartinha_id;
  insert into public.historico (adocao_id, acao, voluntario_email) values (v_adocao.id, v_novo::text, v_email);
  return 'ok';
end $$;
revoke all on function public.decidir_adocao(uuid, text) from public, anon;
grant execute on function public.decidir_adocao(uuid, text) to authenticated;

-- Devolve à lista as cartinhas com pendência vencida. Retorna quantas expiraram.
create or replace function public.expirar_pendentes() returns int
language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  with exp as (
    update public.adocoes set status = 'expirada', decidido_em = now()
    where status = 'pendente' and expira_em < now()
    returning id, cartinha_id
  ), volta as (
    update public.cartinhas c set status = 'disponivel'
    from exp where c.id = exp.cartinha_id and c.status = 'pendente'
    returning c.id
  ), hist as (
    insert into public.historico (adocao_id, acao) select id, 'expirada' from exp
    returning id
  )
  select count(*) into v_n from exp;

  delete from public.tentativas_ip where quando < now() - interval '1 day';
  return v_n;
end $$;
revoke all on function public.expirar_pendentes() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('expirar-pendentes', '0 * * * *', 'select public.expirar_pendentes()');
