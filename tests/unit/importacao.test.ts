import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { conferirLote, lerCsvCartinhas } from "@/lib/importacao/csv";
import { dimensoesAlvo } from "@/lib/imagem/dimensoes";

const fixture = readFileSync("tests/fixtures/cartinhas-sheets.csv", "utf8");

describe("lerCsvCartinhas", () => {
  const r = lerCsvCartinhas(fixture);

  test("ignora BOM, linha EXEMPLO e linhas vazias; aceita ;", () => {
    expect(r.linhas.map((l) => l.codigo)).toEqual(["C002", "C004"]);
  });

  test("normaliza código, gênero e mantém campo entre aspas com ;", () => {
    const joao = r.linhas[0];
    expect(joao).toMatchObject({ codigo: "C002", primeiroNome: "João", idade: 9, genero: "menino", pedido: "Bola de futebol; tamanho 5" });
  });

  test("campos vazios viram null; observações preservadas", () => {
    expect(r.linhas[1]).toMatchObject({ tamanhoRoupa: null, tamanhoCalcado: "21", observacoes: "irmã da C003" });
  });

  test("idade inválida vira erro com o número da linha", () => {
    expect(r.erros).toEqual([{ linha: 4, motivo: "Idade inválida: sete" }]);
  });

  test("aceita vírgula como separador", () => {
    const csv = "codigo,primeiro_nome,idade,genero,pedido\nC010,Lia,5,Menina,Urso\n";
    expect(lerCsvCartinhas(csv).linhas[0]).toMatchObject({ codigo: "C010", idade: 5 });
  });

  test("cabeçalho sem colunas obrigatórias dá erro na linha 1", () => {
    const r2 = lerCsvCartinhas("nome;idade\nAna;7\n");
    expect(r2.linhas).toHaveLength(0);
    expect(r2.erros[0]).toMatchObject({ linha: 1 });
  });

  test("gênero, código e pedido inválidos", () => {
    const csv = "codigo;primeiro_nome;idade;genero;pedido\nX1;Ana;7;outro;\n";
    expect(lerCsvCartinhas(csv).erros[0].motivo).toBe("Código inválido: X1 · Gênero inválido: outro · Pedido vazio");
  });
});

describe("conferirLote", () => {
  const { linhas } = lerCsvCartinhas(fixture);

  test("casa código com foto sem diferenciar caixa e extensão", () => {
    const c = conferirLote(linhas, ["c002.JPG", "C004.webp", "C010.png", "leiame.txt"]);
    expect(c.prontas.map((p) => [p.codigo, p.arquivo])).toEqual([
      ["C002", "c002.JPG"],
      ["C004", "C004.webp"],
    ]);
    expect(c.semFoto).toEqual([]);
    expect(c.fotoSemLinha).toEqual(["C010.png"]);
    expect(c.duplicadas).toEqual([]);
  });

  test("aponta cartinha sem foto e códigos duplicados", () => {
    const dup = [...linhas, { ...linhas[0] }];
    const c = conferirLote(dup, ["C004.jpeg"]);
    expect(c.semFoto).toEqual(["C002"]);
    expect(c.duplicadas).toEqual(["C002"]);
  });
});

describe("dimensoesAlvo", () => {
  test("reduz para no máximo 1600 de largura mantendo proporção", () => {
    expect(dimensoesAlvo(3000, 4000)).toEqual({ largura: 1600, altura: 2133 });
  });
  test("não aumenta imagem pequena", () => {
    expect(dimensoesAlvo(800, 600)).toEqual({ largura: 800, altura: 600 });
  });
});
