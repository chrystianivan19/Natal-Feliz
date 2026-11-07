-- Adoção imediata (decisão do usuário em 06/11/2026): sem etapa de aprovação.
-- O pedido já vira "apadrinhada"; o voluntário só cancela quando precisar.

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

  -- até 3 adoções ativas por pessoa (WhatsApp ou e-mail); canceladas não contam
  if (select count(*) from public.adocoes
      where status in ('pendente', 'aprovada') and (padrinho_whatsapp = v_zap or padrinho_email = v_email)) >= 3 then
    return 'limite';
  end if;

  if (select count(*) from public.tentativas_ip
      where ip_hash = v_ip and quando > now() - interval '1 hour') > 10 then
    return 'limite';
  end if;

  update public.cartinhas set status = 'apadrinhada' where id = v_carta.id;
  insert into public.adocoes (cartinha_id, padrinho_nome, padrinho_whatsapp, padrinho_email, ip_hash, status, decidido_em, decidido_por)
    values (v_carta.id, v_nome, v_zap, v_email, v_ip, 'aprovada', now(), 'automatico')
    returning id into v_adocao;
  insert into public.historico (adocao_id, acao, detalhe) values (v_adocao, 'adotada', v_carta.codigo);
  return 'ok';
end $$;

-- Sem pendências, não há o que expirar.
select cron.unschedule('expirar-pendentes') where exists (select 1 from cron.job where jobname = 'expirar-pendentes');
