import { formatarWhatsapp } from "@/lib/adocao/normalizar";

export type LinhaPadrinho = {
  codigo: string;
  crianca: string;
  pedido: string;
  padrinho: string;
  whatsapp: string;
  email: string;
  status: string;
  pedidoEm: string;
  decididoEm: string | null;
  decididoPor: string | null;
};

const CABECALHO = "codigo;crianca;pedido;padrinho;whatsapp;email;status;pedido_em;decidido_em;decidido_por";

const dataBr = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })
        .format(new Date(iso))
        .replace(",", "")
    : "";

/** Campo seguro para Excel/Sheets: neutraliza fórmula e escapa ; " e quebras de linha. */
function campo(v: string) {
  let s = v ?? "";
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV para abrir direto no Excel em português: BOM UTF-8, separador ;, CRLF. */
export function gerarCsvPadrinhos(linhas: LinhaPadrinho[]) {
  const corpo = linhas.map((l) =>
    [
      l.codigo,
      l.crianca,
      l.pedido,
      l.padrinho,
      formatarWhatsapp(l.whatsapp),
      l.email,
      l.status,
      dataBr(l.pedidoEm),
      dataBr(l.decididoEm),
      l.decididoPor ?? "",
    ]
      .map(campo)
      .join(";"),
  );
  return `﻿${[CABECALHO, ...corpo].join("\r\n")}`;
}
