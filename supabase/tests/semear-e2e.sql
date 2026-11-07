-- Cria as cartinhas usadas pelos testes de tela (rodar antes de npm run test:e2e):
-- C980 disponível (adoção) e C981 já adotada (agendamento da entrega).
delete from public.historico where detalhe like 'C98%'
  or adocao_id in (select a.id from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo in ('C980', 'C981'));
delete from public.cartinhas where codigo in ('C980', 'C981');
insert into public.cartinhas (codigo, primeiro_nome, idade, genero, pedido, tamanho_roupa, tamanho_calcado, status, teste) values
  ('C980', 'Teste', 7, 'menina', 'Boneca de teste', '8', '30', 'disponivel', true),
  ('C981', 'Teste', 9, 'menino', 'Bola de teste', null, null, 'apadrinhada', true);
insert into public.adocoes (cartinha_id, padrinho_nome, padrinho_whatsapp, padrinho_email, status, decidido_em, decidido_por)
  select id, 'Padrinho E2E', '61999990981', 'e2e981@teste.dev', 'aprovada', now(), 'automatico' from public.cartinhas where codigo = 'C981';
delete from public.tentativas_ip where quando > now() - interval '2 hours' and ip_hash not like 'teste-%';
