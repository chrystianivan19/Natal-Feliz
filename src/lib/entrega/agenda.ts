import { normalizarWhatsapp } from "@/lib/adocao/normalizar";

/** Início de cada faixa de uma hora: 09:00–10:00 até 20:00–21:00. */
export const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
const ULTIMA_HORA = 20;

const dois = (n: number) => String(n).padStart(2, "0");

export function rotuloHora(h: number) {
  return `${dois(h)}:00 – ${dois(h + 1)}:00`;
}

/** Data (AAAA-MM-DD) e hora atuais no horário de Brasília. */
function agoraEmBrasilia(agora: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(agora)
      .map((x) => [x.type, x.value]),
  );
  return { dia: `${p.year}-${p.month}-${p.day}`, hora: Number(p.hour) };
}

/** Faixa de hoje que já começou não pode ser reservada. */
export function horaJaPassou(dia: string, hora: number, agora = new Date()) {
  const b = agoraEmBrasilia(agora);
  return dia < b.dia || (dia === b.dia && hora <= b.hora);
}

function somarDia(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Dias que ainda têm horário livre, de hoje até o prazo de entrega. */
export function diasDisponiveis(agora: Date, prazo: string): string[] {
  const b = agoraEmBrasilia(agora);
  const dias: string[] = [];
  let dia = b.hora >= ULTIMA_HORA ? somarDia(b.dia) : b.dia;
  while (dia <= prazo && dias.length < 120) {
    dias.push(dia);
    dia = somarDia(dia);
  }
  return dias;
}

const SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export function rotuloDia(iso: string) {
  const [, m, d] = iso.split("-");
  const nome = SEMANA[new Date(`${iso}T12:00:00Z`).getUTCDay()];
  return { semana: nome.slice(0, 3), data: `${d}/${m}`, completo: `${nome}, ${d}/${m}` };
}

export type CampoReserva = "codigo" | "whatsapp" | "ponto" | "dia" | "hora";
export type DadosReserva = { codigo: string; whatsapp: string; ponto: string; dia: string; hora: number };

export function validarReserva(
  entrada: Record<string, unknown>,
): { ok: true; dados: DadosReserva } | { ok: false; erros: Partial<Record<CampoReserva, string>> } {
  const s = (k: string) => String(entrada[k] ?? "").trim();
  const codigo = s("codigo").toUpperCase();
  const whatsapp = normalizarWhatsapp(s("whatsapp"));
  const ponto = s("ponto");
  const dia = s("dia");
  const hora = Number(s("hora"));
  const erros: Partial<Record<CampoReserva, string>> = {};
  if (!/^C\d{3,4}$/.test(codigo)) erros.codigo = "Escreva o código da cartinha, como C002.";
  if (!whatsapp) erros.whatsapp = "Use o WhatsApp que você informou ao adotar.";
  if (!/^[0-9a-f-]{36}$/i.test(ponto)) erros.ponto = "Escolha um ponto de entrega.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) erros.dia = "Escolha o dia.";
  if (!(HORAS as readonly number[]).includes(hora)) erros.hora = "Escolha o horário.";
  if (Object.keys(erros).length) return { ok: false, erros };
  return { ok: true, dados: { codigo, whatsapp: whatsapp!, ponto, dia, hora } };
}
