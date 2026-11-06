-- Apaga a cartinha C980 e o que o teste de adoção gravou (rodar depois de npm run test:e2e).
delete from public.historico where detalhe = 'C980'
  or adocao_id in (select a.id from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C980');
delete from public.cartinhas where codigo = 'C980';
delete from public.tentativas_ip where quando > now() - interval '2 hours' and ip_hash not like 'teste-%';
