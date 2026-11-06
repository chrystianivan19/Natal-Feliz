/**
 * Normaliza um WhatsApp brasileiro para 11 dígitos (DDD + 9 + 8 dígitos) ou devolve null.
 * Aceita +55, zero de operadora, espaços, parênteses, hífens e o número antigo sem o 9.
 */
export function normalizarWhatsapp(entrada: string): string | null {
  let d = (entrada ?? "").replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length === 10 && /[6-9]/.test(d[2])) d = `${d.slice(0, 2)}9${d.slice(2)}`;
  return /^[1-9][1-9]9\d{8}$/.test(d) ? d : null;
}

/** (61) 99999-8888 */
export function formatarWhatsapp(d: string) {
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d;
}
