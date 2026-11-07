-- Testes de banco da reserva de horário de entrega. Rodar inteiro numa chamada; tudo é desfeito no ROLLBACK.
-- Falha = erro "FALHA: ...". Sucesso = última linha 'TODOS OS TESTES PASSARAM'.
begin;

insert into public.cartinhas (codigo, primeiro_nome, idade, genero, pedido, status, teste) values
  ('C921', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C922', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true);
insert into public.pontos_entrega (nome, endereco, telefone, referencia, ordem) values ('Ponto Teste', 'Rua Teste', '6135550000', 'Ao lado', 99);
insert into public.pontos_entrega (nome, endereco, ativo) values ('Ponto Inativo', 'Rua X', false);
insert into public.voluntarios (email) values ('teste-vol@teste.dev');

select set_config('t.ponto', (select id::text from public.pontos_entrega where nome = 'Ponto Teste'), true);
select set_config('t.inativo', (select id::text from public.pontos_entrega where nome = 'Ponto Inativo'), true);
select set_config('t.amanha', ((now() at time zone 'America/Sao_Paulo')::date + 1)::text, true);
select set_config('t.hoje', ((now() at time zone 'America/Sao_Paulo')::date)::text, true);

set local role anon;
select public.adotar_cartinha('C921', 'Padrinho', '61999990921', 'r1@teste.dev', 'teste-ip-r1');
select public.adotar_cartinha('C922', 'Padrinho', '61999990922', 'r2@teste.dev', 'teste-ip-r2');

select set_config('t.ok',        public.reservar_entrega('c921', '61999990921', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 14, 'teste-ip-rr'), true);
select set_config('t.troca',     public.reservar_entrega('C921', '61999990921', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 9, 'teste-ip-rr'), true);
select set_config('t.zaperrado', public.reservar_entrega('C921', '61999990000', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 9, 'teste-ip-rr'), true);
select set_config('t.semadocao', public.reservar_entrega('C999', '61999990921', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 9, 'teste-ip-rr'), true);
select set_config('t.inativo_r', public.reservar_entrega('C922', '61999990922', current_setting('t.inativo')::uuid, current_setting('t.amanha')::date, 9, 'teste-ip-rr'), true);
select set_config('t.ontem',     public.reservar_entrega('C922', '61999990922', current_setting('t.ponto')::uuid, current_setting('t.hoje')::date - 1, 9, 'teste-ip-rr'), true);
select set_config('t.aposprazo', public.reservar_entrega('C922', '61999990922', current_setting('t.ponto')::uuid, '2026-12-24', 9, 'teste-ip-rr'), true);
select set_config('t.hora8',     public.reservar_entrega('C922', '61999990922', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 8, 'teste-ip-rr'), true);
select set_config('t.hora21',    public.reservar_entrega('C922', '61999990922', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 21, 'teste-ip-rr'), true);
-- faixa de hoje que já começou (hora atual de Brasília); só testável antes das 21h
select set_config('t.jacomecou', case when extract(hour from now() at time zone 'America/Sao_Paulo') between 9 and 20
  then public.reservar_entrega('C922', '61999990922', current_setting('t.ponto')::uuid, current_setting('t.hoje')::date,
       extract(hour from now() at time zone 'America/Sao_Paulo')::int, 'teste-ip-rr') else 'horario_invalido' end, true);

-- anônimo não lê reservas
do $$ begin
  if (select count(*) from public.reservas_entrega) <> 0 then raise exception 'FALHA: anon leu reservas'; end if;
exception when insufficient_privilege then null; end $$;
reset role;

do $$
declare n int; h int;
begin
  if current_setting('t.ok') <> 'ok' then raise exception 'FALHA ok: %', current_setting('t.ok'); end if;
  if current_setting('t.troca') <> 'ok' then raise exception 'FALHA troca: %', current_setting('t.troca'); end if;
  select count(*), max(hora) into n, h from public.reservas_entrega r join public.adocoes a on a.id = r.adocao_id
    join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C921';
  if n <> 1 or h <> 9 then raise exception 'FALHA: troca deveria substituir (n=%, hora=%)', n, h; end if;
  if current_setting('t.zaperrado') <> 'nao_encontrada' then raise exception 'FALHA zap errado: %', current_setting('t.zaperrado'); end if;
  if current_setting('t.semadocao') <> 'nao_encontrada' then raise exception 'FALHA sem adoção: %', current_setting('t.semadocao'); end if;
  if current_setting('t.inativo_r') <> 'ponto_invalido' then raise exception 'FALHA ponto inativo: %', current_setting('t.inativo_r'); end if;
  if current_setting('t.ontem') <> 'dia_invalido' then raise exception 'FALHA ontem: %', current_setting('t.ontem'); end if;
  if current_setting('t.aposprazo') <> 'dia_invalido' then raise exception 'FALHA após prazo: %', current_setting('t.aposprazo'); end if;
  if current_setting('t.hora8') <> 'horario_invalido' then raise exception 'FALHA 8h: %', current_setting('t.hora8'); end if;
  if current_setting('t.hora21') <> 'horario_invalido' then raise exception 'FALHA 21h: %', current_setting('t.hora21'); end if;
  if current_setting('t.jacomecou') <> 'horario_invalido' then raise exception 'FALHA já começou: %', current_setting('t.jacomecou'); end if;
  if not exists (select 1 from public.historico where acao = 'entrega_agendada' and detalhe like 'C921%') then
    raise exception 'FALHA: histórico da reserva'; end if;
end $$;

-- limite por IP: 30 tentativas na hora
set local role anon;
select public.reservar_entrega('C922', '61999990000', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 10, 'teste-ip-lim') from generate_series(1, 30);
select set_config('t.lim', public.reservar_entrega('C922', '61999990922', current_setting('t.ponto')::uuid, current_setting('t.amanha')::date, 10, 'teste-ip-lim'), true);
reset role;
do $$ begin
  if current_setting('t.lim') <> 'limite' then raise exception 'FALHA limite IP: %', current_setting('t.lim'); end if;
end $$;

-- voluntário lê reservas; adoção cancelada leva a reserva junto? (não: a reserva fica, o painel filtra)
set local role authenticated;
select set_config('request.jwt.claims', '{"email":"teste-vol@teste.dev","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.reservas_entrega) < 1 then raise exception 'FALHA: voluntário não lê reservas'; end if;
end $$;
reset role;

select 'TODOS OS TESTES PASSARAM' as resultado;
rollback;
