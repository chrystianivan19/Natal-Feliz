export type StatusCartinha = "disponivel" | "pendente" | "apadrinhada";
export type Genero = "menino" | "menina";
export type FaixaIdade = "0-3" | "4-6" | "7-9" | "10+";

export type CartinhaPublica = {
  codigo: string;
  primeiroNome: string;
  idade: number;
  genero: Genero;
  pedido: string;
  tamanhoRoupa: string | null;
  tamanhoCalcado: string | null;
  imagemUrl: string | null;
  status: StatusCartinha;
};

export type Filtros = {
  busca?: string;
  faixa?: FaixaIdade;
  genero?: Genero;
  soDisponiveis?: boolean;
};

export const FAIXAS: Record<FaixaIdade, [number, number]> = {
  "0-3": [0, 3],
  "4-6": [4, 6],
  "7-9": [7, 9],
  "10+": [10, 17],
};

const ORDEM_STATUS: Record<StatusCartinha, number> = { disponivel: 0, pendente: 1, apadrinhada: 2 };

export function normalizarTexto(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function filtrarCartinhas(lista: CartinhaPublica[], f: Filtros): CartinhaPublica[] {
  const busca = f.busca ? normalizarTexto(f.busca) : "";
  const faixa = f.faixa ? FAIXAS[f.faixa] : null;
  return lista
    .filter((c) => !faixa || (c.idade >= faixa[0] && c.idade <= faixa[1]))
    .filter((c) => !f.genero || c.genero === f.genero)
    .filter((c) => !f.soDisponiveis || c.status === "disponivel")
    .filter(
      (c) => !busca || [c.codigo, c.primeiroNome, c.pedido].some((campo) => normalizarTexto(campo).includes(busca)),
    )
    .sort((a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] || a.codigo.localeCompare(b.codigo));
}
