-- Testes de banco da adoção (adoção imediata, sem aprovação). Rodar inteiro numa chamada; tudo é desfeito no ROLLBACK.
-- Falha = erro "FALHA: ...". Sucesso = última linha 'TODOS OS TESTES PASSARAM'.
-- Os papéis anon/authenticated são simulados com SET LOCAL ROLE e request.jwt.claims.
begin;

insert into public.cartinhas (codigo, primeiro_nome, idade, genero, pedido, status, teste) values
  ('C901', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C902', 'Teste', 7, 'menina', 'Boneca', 'pendente', true),
  ('C903', 'Teste', 7, 'menina', 'Boneca', 'apadrinhada', true),
  ('C904', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C905', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C906', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C907', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C908', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C909', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C910', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C911', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C912', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C913', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true),
  ('C914', 'Teste', 7, 'menina', 'Boneca', 'disponivel', true);
insert into public.voluntarios (email, nome) values ('teste-vol@teste.dev', 'Voluntário Teste');

-- ===== Anônimo adota =====
set local role anon;
select set_config('t.adota',       public.adotar_cartinha('C901', 'Padrinho', '61999990001', 'a@teste.dev', 'teste-ip-a'), true);
select set_config('t.pendente',    public.adotar_cartinha('C902', 'Padrinho', '61999990002', 'b@teste.dev', 'teste-ip-b'), true);
select set_config('t.apadrinhada', public.adotar_cartinha('C903', 'Padrinho', '61999990003', 'c@teste.dev', 'teste-ip-c'), true);
select set_config('t.inexistente', public.adotar_cartinha('C999', 'Padrinho', '61999990004', 'd@teste.dev', 'teste-ip-d'), true);
select set_config('t.zap1', public.adotar_cartinha('C904', 'Padrinho', '61988887777', 'z1@teste.dev', 'teste-ip-z1'), true);
select set_config('t.zap2', public.adotar_cartinha('C905', 'Padrinho', '61988887777', 'z2@teste.dev', 'teste-ip-z2'), true);
select set_config('t.zap3', public.adotar_cartinha('C906', 'Padrinho', '61988887777', 'z3@teste.dev', 'teste-ip-z3'), true);
select set_config('t.zap4', public.adotar_cartinha('C907', 'Padrinho', '61988887777', 'z4@teste.dev', 'teste-ip-z4'), true);
select set_config('t.mail1', public.adotar_cartinha('C908', 'Padrinho', '61977770001', 'madrinha@teste.dev', 'teste-ip-m1'), true);
select set_config('t.mail2', public.adotar_cartinha('C909', 'Padrinho', '61977770002', 'madrinha@teste.dev', 'teste-ip-m2'), true);
select set_config('t.mail3', public.adotar_cartinha('C910', 'Padrinho', '61977770003', 'madrinha@teste.dev', 'teste-ip-m3'), true);
select set_config('t.mail4', public.adotar_cartinha('C911', 'Padrinho', '61977770004', 'MADRINHA@teste.dev', 'teste-ip-m4'), true);
select public.adotar_cartinha('C903', 'Padrinho', '6196666000' || g, 'ip' || g || '@teste.dev', 'teste-ip-fixo') from generate_series(0, 9) g;
select set_config('t.ip11', public.adotar_cartinha('C912', 'Padrinho', '61966661111', 'ip11@teste.dev', 'teste-ip-fixo'), true);

do $$
begin
  begin perform 1 from public.adocoes; raise exception 'FALHA: anon leu adocoes';
  exception when insufficient_privilege then null; end;
  begin perform 1 from public.historico; raise exception 'FALHA: anon leu historico';
  exception when insufficient_privilege then null; end;
  begin perform 1 from public.voluntarios; raise exception 'FALHA: anon leu voluntarios';
  exception when insufficient_privilege then null; end;
  begin perform observacoes from public.cartinhas; raise exception 'FALHA: anon leu observacoes';
  exception when insufficient_privilege then null; end;
  begin perform teste from public.cartinhas; raise exception 'FALHA: anon leu coluna teste';
  exception when insufficient_privilege then null; end;
  begin perform public.decidir_adocao(gen_random_uuid(), 'cancelar'); raise exception 'FALHA: anon chamou decidir_adocao';
  exception when insufficient_privilege then null; end;
end $$;
do $$
begin
  begin perform public.adotar_cartinha('C913', 'Padrinho', '123', 'inv@teste.dev', 'teste-ip-inv'); raise exception 'FALHA: aceitou WhatsApp 123';
  exception when check_violation or invalid_parameter_value then null; end;
end $$;
reset role;

-- ===== Conferências =====
do $$
declare v_qtd int;
begin
  if current_setting('t.adota') <> 'ok' then raise exception 'FALHA adota: %', current_setting('t.adota'); end if;
  if (select status from public.cartinhas where codigo = 'C901') <> 'apadrinhada' then raise exception 'FALHA adota: carta não ficou apadrinhada'; end if;
  if (select a.status from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C901') <> 'aprovada'
    then raise exception 'FALHA adota: adoção não ficou aprovada'; end if;
  if (select a.decidido_por from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C901') <> 'automatico'
    then raise exception 'FALHA adota: decidido_por deveria ser automatico'; end if;
  if not exists (select 1 from public.historico h join public.adocoes a on a.id = h.adocao_id join public.cartinhas c on c.id = a.cartinha_id
                 where c.codigo = 'C901' and h.acao = 'adotada') then raise exception 'FALHA adota: sem histórico'; end if;

  if current_setting('t.pendente') <> 'indisponivel' then raise exception 'FALHA pendente: %', current_setting('t.pendente'); end if;
  if current_setting('t.apadrinhada') <> 'indisponivel' then raise exception 'FALHA apadrinhada: %', current_setting('t.apadrinhada'); end if;
  select count(*) into v_qtd from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo in ('C902', 'C903');
  if v_qtd <> 0 then raise exception 'FALHA: gravou adoção em carta indisponível (%)', v_qtd; end if;
  if current_setting('t.inexistente') <> 'nao_encontrada' then raise exception 'FALHA inexistente: %', current_setting('t.inexistente'); end if;

  if concat_ws(',', current_setting('t.zap1'), current_setting('t.zap2'), current_setting('t.zap3'), current_setting('t.zap4')) <> 'ok,ok,ok,limite'
    then raise exception 'FALHA limite whatsapp'; end if;
  if (select status from public.cartinhas where codigo = 'C907') <> 'disponivel' then raise exception 'FALHA: carta do limite mudou de status'; end if;
  if concat_ws(',', current_setting('t.mail1'), current_setting('t.mail2'), current_setting('t.mail3'), current_setting('t.mail4')) <> 'ok,ok,ok,limite'
    then raise exception 'FALHA limite email'; end if;
  if current_setting('t.ip11') <> 'limite' then raise exception 'FALHA limite ip: %', current_setting('t.ip11'); end if;
  if exists (select 1 from cron.job where jobname = 'expirar-pendentes') then raise exception 'FALHA: tarefa de expiração ainda agendada'; end if;
end $$;

-- ===== Cancelar (só voluntário) =====
select set_config('t.id904', (select a.id::text from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C904'), true);
set local role authenticated;
select set_config('request.jwt.claims', '{"email":"intruso@teste.dev","role":"authenticated"}', true);
do $$
begin
  begin perform public.decidir_adocao(current_setting('t.id904')::uuid, 'cancelar'); raise exception 'FALHA: não-voluntário cancelou';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims', '{"email":"teste-vol@teste.dev","role":"authenticated"}', true);
select set_config('t.cancelar',  public.decidir_adocao(current_setting('t.id904')::uuid, 'cancelar'), true);
select set_config('t.st_can',    (select status::text from public.cartinhas where codigo = 'C904'), true);
select set_config('t.cancelar2', public.decidir_adocao(current_setting('t.id904')::uuid, 'cancelar'), true);
reset role;

-- depois do cancelamento, a mesma pessoa pode adotar outra (cancelada não conta no limite)
set local role anon;
select set_config('t.depois', public.adotar_cartinha('C913', 'Padrinho', '61988887777', 'z5@teste.dev', 'teste-ip-z5'), true);
reset role;

do $$
begin
  if current_setting('t.cancelar') <> 'ok' or current_setting('t.st_can') <> 'disponivel' then raise exception 'FALHA cancelar'; end if;
  if current_setting('t.cancelar2') <> 'estado_invalido' then raise exception 'FALHA cancelar duas vezes: %', current_setting('t.cancelar2'); end if;
  if (select decidido_por from public.adocoes where id = current_setting('t.id904')::uuid) <> 'teste-vol@teste.dev'
    then raise exception 'FALHA: decidido_por do cancelamento'; end if;
  if current_setting('t.depois') <> 'ok' then raise exception 'FALHA: cancelada contou no limite (%)', current_setting('t.depois'); end if;
end $$;

select 'TODOS OS TESTES PASSARAM' as resultado;
rollback;
