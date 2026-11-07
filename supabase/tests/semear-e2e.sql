-- Cria a cartinha C980 usada pelos testes de tela (rodar antes de npm run test:e2e).
delete from public.historico where detalhe = 'C980'
  or adocao_id in (select a.id from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C980');
delete from public.cartinhas where codigo = 'C980';
insert into public.cartinhas (codigo, primeiro_nome, idade, genero, pedido, tamanho_roupa, tamanho_calcado, status, teste)
values ('C980', 'Teste', 7, 'menina', 'Boneca de teste', '8', '30', 'disponivel', true);
delete from public.tentativas_ip where quando > now() - interval '2 hours' and ip_hash not like 'teste-%';
