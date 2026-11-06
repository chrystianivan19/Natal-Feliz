import "server-only";
import { listarCartinhas } from "./cartinhas";

export type Contagem = { total: number; apadrinhadas: number; faltam: number };

/** Pendentes contam em "faltam": só sai da conta quando a equipe confirma. */
export async function obterContador(): Promise<Contagem> {
  const lista = await listarCartinhas();
  const apadrinhadas = lista.filter((c) => c.status === "apadrinhada").length;
  return { total: lista.length, apadrinhadas, faltam: lista.length - apadrinhadas };
}
