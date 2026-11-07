import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { listarPadrinhos } from "@/lib/painel/padrinhos";
import { formatarWhatsapp } from "@/lib/adocao/normalizar";
import { linkWhatsappAprovacao } from "@/lib/adocao/whatsapp";
import { haQuanto } from "@/lib/tempo/relativo";
import { BotaoCancelar } from "@/components/painel/BotaoCancelar";

export const metadata: Metadata = { title: "Padrinhos · Painel" };
export const instant = false;

const FILTROS = [
  ["", "Todos"],
  ["pendente", "Aguardando"],
  ["aprovada", "Aprovados"],
  ["recusada", "Recusados"],
  ["expirada", "Expirados"],
  ["cancelada", "Cancelados"],
] as const;
const ROTULO: Record<string, string> = { pendente: "Aguardando", aprovada: "Aprovado", recusada: "Recusado", expirada: "Expirou", cancelada: "Cancelado" };

export default async function PaginaPadrinhos({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { supabase } = await exigirVoluntario();
  const lista = await listarPadrinhos(supabase, status);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Padrinhos</h1>
        <a href="/painel/padrinhos/csv" className="inline-flex min-h-11 items-center rounded-full bg-pinheiro px-5 font-semibold text-papel">
          Exportar CSV
        </a>
      </div>
      <nav aria-label="Filtrar por situação" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {FILTROS.map(([valor, rotulo]) => (
          <Link
            key={valor}
            href={valor ? `/painel/padrinhos?status=${valor}` : "/painel/padrinhos"}
            aria-current={(status ?? "") === valor ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold ${(status ?? "") === valor ? "border-pinheiro bg-pinheiro text-papel" : "border-tinta/20 bg-white"}`}
          >
            {rotulo}
          </Link>
        ))}
      </nav>
      <p className="text-tinta-suave">{lista.length} registros</p>
      <ul className="flex flex-col gap-3">
        {lista.map((p) => (
          <li key={p.id} className="rounded-2xl border border-tinta/10 bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{p.codigo} · {p.crianca} · {p.pedido}</p>
              <span className="rounded-full bg-papel-escuro px-3 py-0.5 text-sm">{ROTULO[p.status] ?? p.status}</span>
            </div>
            <p className="mt-1">
              {p.padrinho} · <a className="underline" href={`https://wa.me/55${p.whatsapp}`} target="_blank" rel="noopener">{formatarWhatsapp(p.whatsapp)}</a> ·{" "}
              <a className="underline" href={`mailto:${p.email}`}>{p.email}</a>
            </p>
            <p className="text-sm text-tinta-suave">
              Pedido {haQuanto(p.pedidoEm)}
              {p.decididoEm ? ` · decidido ${haQuanto(p.decididoEm)}${p.decididoPor ? ` por ${p.decididoPor}` : ""}` : ""}
            </p>
            {(p.status === "aprovada" || p.status === "pendente") && (
              <div className="mt-2 flex flex-wrap gap-2">
                {p.status === "aprovada" && (
                  <a
                    href={linkWhatsappAprovacao({ ...p, padrinhoNome: p.padrinho, padrinhoWhatsapp: p.whatsapp, primeiroNome: p.crianca })}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-11 items-center rounded-full border border-pinheiro px-4 text-sm font-semibold text-pinheiro"
                  >
                    Reenviar no WhatsApp
                  </a>
                )}
                <BotaoCancelar id={p.id} codigo={p.codigo} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
