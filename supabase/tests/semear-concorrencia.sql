-- Prepara a carta C990 para o teste de concorrência (rodar antes de npm run test:db).
delete from public.tentativas_ip where ip_hash like 'teste-conc-%';
delete from public.cartinhas where codigo = 'C990';
insert into public.cartinhas (codigo, primeiro_nome, idade, genero, pedido, status, teste)
values ('C990', 'Teste', 8, 'menino', 'Bola', 'disponivel', true);
