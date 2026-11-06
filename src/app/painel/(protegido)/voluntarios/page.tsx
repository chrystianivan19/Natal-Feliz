import type { Metadata } from "next";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { FormVoluntario, BotaoAtivo } from "@/components/painel/Voluntarios";

export const metadata: Metadata = { title: "Voluntários · Painel" };
export const instant = false;

export default async function PaginaVoluntarios() {
  const { supabase, email: eu } = await exigirVoluntario();
  const { data } = await supabase.from("voluntarios").select("email, nome, ativo").order("email");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Voluntários</h1>
      <p className="text-tinta-suave">Quem está aqui e ativo entra no painel pelo link enviado ao e-mail.</p>
      <FormVoluntario />
      <ul className="divide-y divide-tinta/10 rounded-2xl border border-tinta/10 bg-white">
        {(data ?? []).map((v) => (
          <li key={v.email} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <span>
              <strong>{v.nome ?? v.email}</strong>
              {v.nome ? <span className="text-tinta-suave"> · {v.email}</span> : null}
              {!v.ativo && <span className="ml-2 text-sm text-vermelho">desativado</span>}
            </span>
            {v.email !== eu && <BotaoAtivo email={v.email} ativo={v.ativo} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
