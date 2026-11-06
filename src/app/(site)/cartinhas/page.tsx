import type { Metadata } from "next";
import { Contador } from "@/components/home/Contador";
import { Filtros } from "@/components/cartinhas/Grade";
import { ListaCartas } from "@/components/cartinhas/CardCartinha";
import { listarCartinhas } from "@/lib/dados/cartinhas";
import { obterContador } from "@/lib/dados/contador";
import { filtrarCartinhas } from "@/lib/cartinhas/filtrar";

export const metadata: Metadata = {
  title: "Apadrinhe uma cartinha",
  description: "Leia as cartinhas das crianças do Gama e escolha uma para apadrinhar. Entrega do presente até 23/12.",
};

export default async function PaginaCartinhas() {
  const [lista, contagem] = await Promise.all([listarCartinhas(), obterContador()]);
  return (
    <div className="flex flex-col gap-6 pt-8 md:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl md:text-7xl">Cartinhas</h1>
        <p className="max-w-prose">
          Escolha uma cartinha, leia com calma e toque em <strong>Quero apadrinhar</strong>. O presente é entregue até
          23/12 num ponto de coleta.
        </p>
      </header>
      <Contador {...contagem} />
      <Filtros lista={lista} />
      <ListaCartas lista={filtrarCartinhas(lista, {})} />
    </div>
  );
}
