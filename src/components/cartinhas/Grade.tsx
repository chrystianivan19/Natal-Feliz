"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { filtrarCartinhas, type CartinhaPublica, type FaixaIdade, type Genero } from "@/lib/cartinhas/filtrar";
import { ListaCartas } from "./CardCartinha";

const FAIXAS: FaixaIdade[] = ["0-3", "4-6", "7-9", "10+"];

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
        ativo ? "border-pinheiro bg-pinheiro text-papel" : "border-tinta/20 bg-white/70 text-tinta hover:border-pinheiro"
      }`}
    >
      {children}
    </button>
  );
}

/** Filtros + grade. O estado dos filtros vive na URL (?faixa=7-9&genero=menina&disp=1). */
export function Grade({ lista }: { lista: CartinhaPublica[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const caminho = usePathname();
  const [busca, setBusca] = useState(params.get("q") ?? "");

  const faixa = (FAIXAS as string[]).includes(params.get("faixa") ?? "") ? (params.get("faixa") as FaixaIdade) : undefined;
  const genero = (["menino", "menina"] as string[]).includes(params.get("genero") ?? "") ? (params.get("genero") as Genero) : undefined;
  const soDisponiveis = params.get("disp") === "1";

  function definir(chave: string, valor: string | null) {
    const novo = new URLSearchParams(params.toString());
    if (valor === null) novo.delete(chave);
    else novo.set(chave, valor);
    const qs = novo.toString();
    router.replace(qs ? `${caminho}?${qs}` : caminho, { scroll: false });
  }

  const filtrada = useMemo(
    () => filtrarCartinhas(lista, { busca, faixa, genero, soDisponiveis }),
    [lista, busca, faixa, genero, soDisponiveis],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <input
          id="busca"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Buscar por nome, pedido ou código"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar cartinha"
          className="min-h-12 w-full rounded-full border border-tinta/20 bg-white/80 px-5 text-base outline-none placeholder:text-tinta-suave focus:border-pinheiro"
        />
        <div role="group" aria-label="Idade" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {FAIXAS.map((f) => (
            <Chip key={f} ativo={faixa === f} onClick={() => definir("faixa", faixa === f ? null : f)}>
              {f === "10+" ? "10 anos ou mais" : `${f.replace("-", " a ")} anos`}
            </Chip>
          ))}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <div role="group" aria-label="Gênero" className="flex gap-2">
            <Chip ativo={genero === "menina"} onClick={() => definir("genero", genero === "menina" ? null : "menina")}>
              Menina
            </Chip>
            <Chip ativo={genero === "menino"} onClick={() => definir("genero", genero === "menino" ? null : "menino")}>
              Menino
            </Chip>
          </div>
          <Chip ativo={soDisponiveis} onClick={() => definir("disp", soDisponiveis ? null : "1")}>
            Só disponíveis
          </Chip>
        </div>
      </div>
      <p className="text-sm text-tinta-suave" aria-live="polite">
        {filtrada.length} {filtrada.length === 1 ? "cartinha" : "cartinhas"}
      </p>
      <ListaCartas lista={filtrada} />
    </div>
  );
}
