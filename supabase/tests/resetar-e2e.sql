-- Devolve a C001 a "disponível" e limpa o que o teste de adoção (tests/e2e/adocao.spec.ts) gravou.
delete from public.historico where adocao_id in (
  select a.id from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C001');
delete from public.adocoes where cartinha_id = (select id from public.cartinhas where codigo = 'C001');
update public.cartinhas set status = 'disponivel' where codigo = 'C001';
delete from public.tentativas_ip where ip_hash not like 'teste-%' and quando > now() - interval '2 hours';
