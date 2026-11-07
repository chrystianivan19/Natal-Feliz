-- Regras do Storage: voluntário envia foto (INSERT ... RETURNING); quem não é voluntário não envia.
-- Rodar inteiro numa chamada; tudo é desfeito no ROLLBACK.
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"email":"chrystianbarca12@gmail.com","role":"authenticated","sub":"00000000-0000-0000-0000-000000000000"}', true);
insert into storage.objects (bucket_id, name) values ('cartinhas', 'teste-rls.webp') returning name;
select set_config('request.jwt.claims', '{"email":"intruso@teste.dev","role":"authenticated","sub":"00000000-0000-0000-0000-000000000001"}', true);
do $$ begin
  begin insert into storage.objects (bucket_id, name) values ('cartinhas', 'intruso.webp'); raise exception 'FALHA: intruso enviou foto';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'TODOS OS TESTES PASSARAM' as resultado;
rollback;
