import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { listarReservas, listarSemHorario, type Reserva } from "@/lib/painel/reservas";
import { formatarWhatsapp } from "@/lib/adocao/normalizar";
import { rotuloDia, rotuloHora } from "@/lib/entrega/agenda";

export const metadata: Metadata = { title: "Reservas · Painel" };
export const instant = false;

export default async function PaginaReservas({ searchParams }: { searchParams: Promise<{ ponto?: string }> }) {
  const { ponto } = await searchParams;
  const { supabase } = await exigirVoluntario();
  const [todas, semHorario, { data: pontos }] = await Promise.all([
    listarReservas(supabase),
    listarSemHorario(supabase),
    supabase.from("pontos_entrega").select("id, nome").order("ordem"),
  ]);
  const lista = ponto ? todas.filter((r) => r.pontoId === ponto) : todas;
  const porDia = new Map<string, Reserva[]>();
  for (const r of lista) porDia.set(r.dia, [...(porDia.get(r.dia) ?? []), r]);

  const filtros = [["", `Todos (${todas.length})`], ...(pontos ?? []).map((p) => [p.id, `${p.nome} (${todas.filter((r) => r.pontoId === p.id).length})`])];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Reservas de entrega</h1>
      <nav aria-label="Filtrar por ponto" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {filtros.map(([valor, rotulo]) => (
          <Link
            key={valor}
            href={valor ? `/painel/reservas?ponto=${valor}` : "/painel/reservas"}
            aria-current={(ponto ?? "") === valor ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold ${(ponto ?? "") === valor ? "border-pinheiro bg-pinheiro text-papel" : "border-tinta/20 bg-white hover:border-pinheiro"}`}
          >
            {rotulo}
          </Link>
        ))}
      </nav>

      {lista.length === 0 && <p className="rounded-2xl border border-tinta/10 bg-white p-4">Nenhuma reserva ainda.</p>}

      {[...porDia].map(([dia, rs]) => (
        <section key={dia} className="flex flex-col gap-2">
          <h2 className="text-2xl capitalize">
            {rotuloDia(dia).completo} <span className="text-base font-normal text-tinta-suave">· {rs.length} {rs.length === 1 ? "entrega" : "entregas"}</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {rs.map((r) => (
              <li key={r.id} className="grid gap-1 rounded-2xl border border-tinta/10 bg-white p-4 md:grid-cols-[9rem_1fr]">
                <p className="font-semibold text-pinheiro">{rotuloHora(r.hora)}</p>
                <div>
                  <p className="font-semibold">{r.codigo} · {r.crianca} · {r.pedido}</p>
                  <p className="text-sm">
                    {r.ponto} · {r.padrinho} ·{" "}
                    <a className="underline" href={`https://wa.me/55${r.whatsapp}`} target="_blank" rel="noopener">{formatarWhatsapp(r.whatsapp)}</a>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <details className="rounded-2xl border border-dashed border-dourado bg-papel p-4">
        <summary className="min-h-11 cursor-pointer content-center font-semibold">
          {semHorario.length} {semHorario.length === 1 ? "padrinho ainda não marcou" : "padrinhos ainda não marcaram"} horário
        </summary>
        <ul className="mt-2 flex flex-col gap-1">
          {semHorario.map((a) => (
            <li key={a.id}>
              {a.codigo} · {a.padrinho} ·{" "}
              <a
                className="underline"
                href={`https://wa.me/55${a.whatsapp}?text=${encodeURIComponent(`Oi, ${a.padrinho.split(" ")[0]}! Falta marcar o horário de entrega do presente da cartinha ${a.codigo}: https://natalfeliz2026.vercel.app/entrega?codigo=${a.codigo}`)}`}
                target="_blank"
                rel="noopener"
              >
                {formatarWhatsapp(a.whatsapp)}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
