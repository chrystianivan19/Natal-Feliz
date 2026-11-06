import { describe, expect, test } from "vitest";
import { filtrarCartinhas, type CartinhaPublica } from "@/lib/cartinhas/filtrar";

const c = (codigo: string, idade: number, extra: Partial<CartinhaPublica> = {}): CartinhaPublica => ({
  codigo,
  primeiroNome: "Ana",
  idade,
  genero: "menina",
  pedido: "Bola",
  tamanhoRoupa: null,
  tamanhoCalcado: null,
  imagemUrl: null,
  status: "disponivel",
  ...extra,
});

const lista = [
  c("C003", 10, { status: "apadrinhada" }),
  c("C001", 7, { pedido: "Boneca com acessórios" }),
  c("C002", 9, { genero: "menino", primeiroNome: "João", status: "pendente" }),
  c("C004", 3, { genero: "menino", pedido: "Carrinho" }),
  c("C005", 4),
];

describe("filtrarCartinhas", () => {
  test("faixa 7-9 inclui 7 e 9 e exclui 10", () => {
    expect(filtrarCartinhas(lista, { faixa: "7-9" }).map((x) => x.codigo)).toEqual(["C001", "C002"]);
  });

  test("faixa 0-3 e 10+", () => {
    expect(filtrarCartinhas(lista, { faixa: "0-3" }).map((x) => x.codigo)).toEqual(["C004"]);
    expect(filtrarCartinhas(lista, { faixa: "10+" }).map((x) => x.codigo)).toEqual(["C003"]);
  });

  test("busca ignora acento e caixa", () => {
    expect(filtrarCartinhas(lista, { busca: "BONE" }).map((x) => x.codigo)).toEqual(["C001"]);
    expect(filtrarCartinhas(lista, { busca: "acessorios" }).map((x) => x.codigo)).toEqual(["C001"]);
    expect(filtrarCartinhas(lista, { busca: "joao" }).map((x) => x.codigo)).toEqual(["C002"]);
  });

  test("busca por código", () => {
    expect(filtrarCartinhas(lista, { busca: "c004" }).map((x) => x.codigo)).toEqual(["C004"]);
  });

  test("gênero", () => {
    expect(filtrarCartinhas(lista, { genero: "menino" }).map((x) => x.codigo)).toEqual(["C004", "C002"]);
  });

  test("só disponíveis remove pendente e apadrinhada", () => {
    expect(filtrarCartinhas(lista, { soDisponiveis: true }).map((x) => x.codigo)).toEqual(["C001", "C004", "C005"]);
  });

  test("ordem: disponíveis por código, depois pendentes, depois apadrinhadas", () => {
    expect(filtrarCartinhas(lista, {}).map((x) => x.codigo)).toEqual(["C001", "C004", "C005", "C002", "C003"]);
  });

  test("busca vazia ou só espaços não filtra", () => {
    expect(filtrarCartinhas(lista, { busca: "   " })).toHaveLength(5);
  });
});
