import { z } from "zod";
import { normalizarWhatsapp } from "./normalizar";

export type DadosAdocao = { nome: string; whatsapp: string; email: string };
export type CampoAdocao = "nome" | "whatsapp" | "email" | "compromisso";
export type ResultadoValidacao =
  | { ok: true; dados: DadosAdocao }
  | { ok: false; robo?: boolean; erros: Partial<Record<CampoAdocao, string>> };

const schema = z.object({
  nome: z.string().trim().min(2, "Escreva seu nome.").max(80, "Use no máximo 80 letras."),
  whatsapp: z
    .string()
    .transform((v) => normalizarWhatsapp(v))
    .refine((v): v is string => v !== null, "Confira o WhatsApp com DDD."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Confira o e-mail.")),
  compromisso: z.literal("on", { error: "Confirme o compromisso de entrega." }),
});

/** Valida o formulário de adoção. `site` é o campo honeypot: tem que vir vazio. */
export function validarAdocao(entrada: Record<string, unknown>): ResultadoValidacao {
  if (typeof entrada.site === "string" && entrada.site.trim() !== "") return { ok: false, robo: true, erros: {} };
  const r = schema.safeParse({
    nome: String(entrada.nome ?? ""),
    whatsapp: String(entrada.whatsapp ?? ""),
    email: String(entrada.email ?? ""),
    compromisso: entrada.compromisso,
  });
  if (r.success) return { ok: true, dados: { nome: r.data.nome, whatsapp: r.data.whatsapp as string, email: r.data.email } };
  const erros: Partial<Record<CampoAdocao, string>> = {};
  for (const issue of r.error.issues) {
    const campo = issue.path[0] as CampoAdocao;
    erros[campo] ??= issue.message;
  }
  return { ok: false, erros };
}
