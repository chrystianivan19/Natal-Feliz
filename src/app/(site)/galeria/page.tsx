import type { Metadata } from "next";
import { Galeria } from "@/components/galeria/Galeria";
import { listarEdicoes } from "@/lib/dados/conteudo";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Fotos das edições anteriores do Natal Feliz no Gama-DF.",
};

export default async function PaginaGaleria() {
  const edicoes = await listarEdicoes();
  const temFotos = edicoes.some((e) => e.fotos.length);
  return (
    <div className="flex flex-col gap-6 pt-8 pb-8 md:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl md:text-7xl">Galeria</h1>
        <p className="max-w-prose">Fotos dos anos anteriores: a entrega dos presentes e as pessoas que ajudaram.</p>
      </header>
      {temFotos ? (
        <Galeria edicoes={edicoes} />
      ) : (
        <ul data-testid="fotos-provisorias" className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-tinta/20 bg-papel-escuro text-sm text-tinta-suave">
              Foto provisória
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
