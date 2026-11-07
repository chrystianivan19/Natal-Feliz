/**
 * Pix "copia e cola" estático (BR Code / EMV MPM), sem valor fixo: a pessoa digita quanto quer doar.
 * Manual de Padrões para Iniciação do Pix (BCB), seção do QR Code estático.
 */

export type TipoChave = "email" | "telefone" | "cpf" | "cnpj" | "aleatoria";

/** CRC-16/CCITT-FALSE (polinômio 0x1021, início 0xFFFF), 4 hex maiúsculos. */
export function crc16(texto: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(texto)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const campo = (id: string, valor: string) => `${id}${String(valor.length).padStart(2, "0")}${valor}`;

/** Sem acento, só caracteres aceitos pelo padrão, em maiúsculas e cortado no tamanho máximo. */
function limpar(texto: string, max: number) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, max)
    .trim();
}

function inferirTipo(chave: string): TipoChave {
  const c = chave.trim();
  if (c.includes("@")) return "email";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c)) return "aleatoria";
  if (/^\+55/.test(c) || /\(/.test(c)) return "telefone";
  const d = c.replace(/\D/g, "");
  if (d.length === 14) return "cnpj";
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(c)) return "cpf";
  return d.length === 11 ? "cpf" : "telefone";
}

/** Chave no formato que o Pix espera: telefone com +55, CPF/CNPJ só dígitos, e-mail minúsculo. */
export function normalizarChave(chave: string, tipo?: TipoChave | null) {
  const t = tipo ?? inferirTipo(chave);
  const c = chave.trim();
  if (t === "email") return c.toLowerCase();
  if (t === "aleatoria") return c.toLowerCase();
  const d = c.replace(/\D/g, "");
  if (t === "telefone") return `+55${d.startsWith("55") && d.length > 11 ? d.slice(2) : d}`;
  return d;
}

export function gerarPayloadPix({
  chave,
  tipo,
  recebedor,
  cidade,
  txid = "***",
}: {
  chave: string;
  tipo?: TipoChave | null;
  recebedor: string;
  cidade: string;
  txid?: string;
}): string {
  const conta = campo("00", "br.gov.bcb.pix") + campo("01", normalizarChave(chave, tipo));
  const semCrc =
    campo("00", "01") +
    campo("26", conta) +
    campo("52", "0000") +
    campo("53", "986") +
    campo("58", "BR") +
    campo("59", limpar(recebedor, 25) || "NATAL FELIZ") +
    campo("60", limpar(cidade, 15) || "GAMA") +
    campo("62", campo("05", txid.replace(/[^A-Za-z0-9*]/g, "").slice(0, 25) || "***")) +
    "6304";
  return semCrc + crc16(semCrc);
}
