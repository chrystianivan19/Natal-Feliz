import type { Metadata } from "next";
import Link from "next/link";
import { exigirVoluntario } from "@/lib/painel/sessao";
import { FormGeral } from "@/components/painel/FormsConteudo";
import { urlImagem } from "@/lib/dados/cartinhas";
import { formatarWhatsapp } from "@/lib/adocao/normalizar";

export const metadata: Metadata = { title: "Pix, contato e datas · Painel" };
export const instant = false;

/** Data e hora no horário de Brasília, para os campos date/time. */
function partesBrasilia(iso: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return { data: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

export default async function PaginaGeral() {
  const { supabase } = await exigirVoluntario();
  const { data: c } = await supabase.from("configuracoes").select("*").eq("id", 1).single();
  const ev = partesBrasilia(c?.evento_data_hora ?? "2026-12-29T09:00:00-03:00");
  return (
    <div className="flex flex-col gap-4">
      <Link href="/painel/conteudo" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">← Conteúdo</Link>
      <h1 className="text-4xl">Pix, contato e datas</h1>
      <FormGeral
        v={{
          pixChave: c?.pix_chave ?? "",
          pixTipo: c?.pix_tipo ?? "",
          pixRecebedor: c?.pix_recebedor ?? "",
          pixCidade: c?.pix_cidade ?? "",
          pixBanco: c?.pix_banco ?? "",
          whatsappContato: c?.whatsapp_contato ? formatarWhatsapp(c.whatsapp_contato) : "",
          eventoData: ev.data,
          eventoHora: ev.hora,
          prazoEntrega: c?.prazo_entrega ?? "2026-12-23",
          videoUrl: c?.video_url ?? "",
          videoCapaUrl: urlImagem("galeria", c?.video_capa_path ?? null),
        }}
      />
    </div>
  );
}
