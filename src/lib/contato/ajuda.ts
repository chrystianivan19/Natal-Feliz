import { formatarWhatsapp } from "@/lib/adocao/normalizar";

/** Números da equipe para dúvidas (pedido do usuário em 21/11/2026). */
const NUMEROS = ["61996526275", "61991053587", "61991663337"];

export const CONTATOS_AJUDA = NUMEROS.map((numero) => ({ numero, rotulo: formatarWhatsapp(numero) }));

export function linkAjuda(numero: string) {
  return `https://wa.me/55${numero}?text=${encodeURIComponent("Oi! Tenho uma dúvida sobre o Natal Feliz.")}`;
}
