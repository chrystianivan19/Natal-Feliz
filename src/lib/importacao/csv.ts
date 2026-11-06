import type { Genero } from "@/lib/cartinhas/filtrar";

export type LinhaCartinha = {
  linha: number;
  codigo: string;
  primeiroNome: string;
  idade: number;
  genero: Genero;
  pedido: string;
  tamanhoRoupa: string | null;
  tamanhoCalcado: string | null;
  observacoes: string | null;
};
export type ErroLinha = { linha: number; motivo: string };

const OBRIGATORIAS = ["codigo", "primeiro_nome", "idade", "genero", "pedido"] as const;

/** Quebra o texto em linhas e campos, respeitando aspas ("a;b" e "" dentro de aspas). */
function tokenizar(texto: string, sep: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) {
      if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') aspas = false;
      else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = "";
    } else campo += ch;
  }
  if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

const vazioParaNull = (s: string | undefined) => (s && s.trim() ? s.trim() : null);

/** Lê o CSV exportado da planilha modelo (Google Sheets: vírgula ou ponto e vírgula, com ou sem BOM). */
export function lerCsvCartinhas(bruto: string): { linhas: LinhaCartinha[]; erros: ErroLinha[] } {
  const texto = bruto.replace(/^﻿/, "");
  const primeira = texto.split(/\r?\n/, 1)[0] ?? "";
  const sep = (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0) ? ";" : ",";
  const [cabecalho = [], ...resto] = tokenizar(texto, sep);
  const colunas = cabecalho.map((c) => c.trim().toLowerCase());
  const faltando = OBRIGATORIAS.filter((c) => !colunas.includes(c));
  if (faltando.length) return { linhas: [], erros: [{ linha: 1, motivo: `Faltam colunas: ${faltando.join(", ")}` }] };
  const idx = (nome: string) => colunas.indexOf(nome);

  const linhas: LinhaCartinha[] = [];
  const erros: ErroLinha[] = [];
  resto.forEach((campos, i) => {
    const numero = i + 2;
    if (campos.every((c) => !c.trim())) return;
    const v = (nome: string) => (idx(nome) >= 0 ? (campos[idx(nome)] ?? "").trim() : "");
    if (/exemplo/i.test(v("observacoes"))) return;

    const motivos: string[] = [];
    const codigo = v("codigo").toUpperCase();
    if (!/^C\d{3,4}$/.test(codigo)) motivos.push(`Código inválido: ${v("codigo") || "(vazio)"}`);
    const nome = v("primeiro_nome");
    if (!nome) motivos.push("Nome vazio");
    const idade = Number(v("idade"));
    if (!/^\d{1,2}$/.test(v("idade")) || idade > 17) motivos.push(`Idade inválida: ${v("idade") || "(vazia)"}`);
    const genero = v("genero").toLowerCase();
    if (genero !== "menino" && genero !== "menina") motivos.push(`Gênero inválido: ${v("genero") || "(vazio)"}`);
    const pedido = v("pedido");
    if (!pedido) motivos.push("Pedido vazio");

    if (motivos.length) {
      erros.push({ linha: numero, motivo: motivos.join(" · ") });
      return;
    }
    linhas.push({
      linha: numero,
      codigo,
      primeiroNome: nome,
      idade,
      genero: genero as Genero,
      pedido,
      tamanhoRoupa: vazioParaNull(v("tamanho_roupa")),
      tamanhoCalcado: vazioParaNull(v("tamanho_calcado")),
      observacoes: vazioParaNull(v("observacoes")),
    });
  });
  return { linhas, erros };
}

const EXT = /\.(jpe?g|png|webp)$/i;

/** Casa cada linha com a foto de mesmo código (C001.jpg, c001.JPEG, C001.webp…). */
export function conferirLote(linhas: LinhaCartinha[], nomesArquivos: string[]) {
  const fotos = new Map<string, string>();
  for (const nome of nomesArquivos) {
    if (!EXT.test(nome)) continue;
    fotos.set(nome.replace(EXT, "").toUpperCase(), nome);
  }
  const vistos = new Set<string>();
  const duplicadas: string[] = [];
  const prontas: (LinhaCartinha & { arquivo: string | null })[] = [];
  const semFoto: string[] = [];
  for (const l of linhas) {
    if (vistos.has(l.codigo)) { duplicadas.push(l.codigo); continue; }
    vistos.add(l.codigo);
    const arquivo = fotos.get(l.codigo) ?? null;
    if (arquivo) prontas.push({ ...l, arquivo });
    else semFoto.push(l.codigo);
  }
  const fotoSemLinha = [...fotos.entries()].filter(([cod]) => !vistos.has(cod)).map(([, nome]) => nome);
  return { prontas, semFoto, fotoSemLinha, duplicadas };
}
