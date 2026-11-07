-- Apaga as cartinhas C980/C981 e o que os testes gravaram (rodar depois de npm run test:e2e).
-- Adoções e reservas saem junto (on delete cascade).
delete from public.historico where detalhe like 'C98%'
  or adocao_id in (select a.id from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo in ('C980', 'C981'));
delete from public.cartinhas where codigo in ('C980', 'C981');
delete from public.tentativas_ip where quando > now() - interval '2 hours' and ip_hash not like 'teste-%';
