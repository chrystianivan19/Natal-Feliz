-- Limpa o que o teste de concorrência deixou (rodar depois de npm run test:db).
-- Conferência: deve existir exatamente 1 adoção para C990 antes de apagar.
select count(*) as adocoes_c990 from public.adocoes a join public.cartinhas c on c.id = a.cartinha_id where c.codigo = 'C990';
delete from public.tentativas_ip where ip_hash like 'teste-conc-%';
delete from public.cartinhas where codigo = 'C990';
