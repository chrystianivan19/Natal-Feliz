-- Tira eh_voluntario() do schema exposto pela API (alerta 0028/0029 do advisor).
-- As políticas referenciam a função por OID e continuam funcionando.
create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to anon, authenticated;
alter function public.eh_voluntario() set schema privado;
