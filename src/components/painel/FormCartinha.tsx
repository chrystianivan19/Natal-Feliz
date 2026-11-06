"use client";

import { useActionState, useRef, useState } from "react";
import { salvarCartinha, type EstadoForm } from "@/lib/painel/acoes-cartinhas";
import { enviarFoto } from "@/lib/imagem/comprimir";
import { createBrowserClient } from "@/lib/supabase/browser";

export type ValoresCartinha = {
  codigo: string;
  primeiroNome: string;
  idade: number | "";
  genero: "menino" | "menina" | "";
  pedido: string;
  tamanhoRoupa: string;
  tamanhoCalcado: string;
  observacoes: string;
  teste: boolean;
  imagemUrl: string | null;
};

const campo = "min-h-12 rounded-xl border border-tinta/25 bg-white px-4 text-base outline-none focus:border-pinheiro";

export function FormCartinha({ valores, editando }: { valores: ValoresCartinha; editando: boolean }) {
  const [estado, acao, salvando] = useActionState<EstadoForm, FormData>(salvarCartinha, {});
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const foto = useRef<HTMLInputElement>(null);

  async function antesDeEnviar(form: FormData) {
    setErroFoto(null);
    const arquivo = foto.current?.files?.[0];
    if (arquivo) {
      const codigo = String(form.get("codigo") ?? "").trim().toUpperCase();
      if (!/^C\d{3,4}$/.test(codigo)) {
        setErroFoto("Preencha o código antes de enviar a foto.");
        return;
      }
      try {
        setEnviandoFoto(true);
        form.set("imagem_path", await enviarFoto(createBrowserClient(), "cartinhas", `${codigo}.webp`, arquivo));
      } catch (e) {
        setErroFoto(e instanceof Error ? e.message : "Falha ao enviar a foto.");
        return;
      } finally {
        setEnviandoFoto(false);
      }
    }
    form.delete("foto");
    acao(form);
  }

  return (
    <form action={antesDeEnviar} className="flex max-w-xl flex-col gap-4">
      {editando && <input type="hidden" name="codigo_original" value={valores.codigo} />}
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Código</span>
        <input name="codigo" defaultValue={valores.codigo} placeholder="C001" required className={`${campo} uppercase`} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Primeiro nome</span>
        <input name="primeiro_nome" defaultValue={valores.primeiroNome} required className={campo} />
        <span className="text-sm text-tinta-suave">Só o primeiro nome. Sobrenome nunca aparece no site.</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Idade</span>
          <input name="idade" type="number" inputMode="numeric" min={0} max={17} defaultValue={valores.idade} required className={campo} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Gênero</span>
          <select name="genero" defaultValue={valores.genero} required className={campo}>
            <option value="" disabled>Escolha</option>
            <option value="menina">Menina</option>
            <option value="menino">Menino</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Pedido</span>
        <input name="pedido" defaultValue={valores.pedido} required className={campo} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Tamanho de roupa</span>
          <input name="tamanho_roupa" defaultValue={valores.tamanhoRoupa} className={campo} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Tamanho de calçado</span>
          <input name="tamanho_calcado" inputMode="numeric" defaultValue={valores.tamanhoCalcado} className={campo} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Observações internas</span>
        <textarea name="observacoes" defaultValue={valores.observacoes} rows={2} className={`${campo} py-3`} />
        <span className="text-sm text-tinta-suave">Só a equipe vê.</span>
      </label>
      <div className="flex flex-col gap-1">
        <label htmlFor="foto" className="font-semibold">Foto da cartinha {valores.imagemUrl ? "(trocar)" : ""}</label>
        <p className="rounded-xl border border-dashed border-dourado bg-papel p-3 text-sm">
          Confira se a carta não mostra sobrenome, endereço ou escola. Cubra antes de enviar.
        </p>
        <input id="foto" ref={foto} name="foto" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-12" />
        {erroFoto && <p role="alert" className="text-sm font-semibold text-vermelho">{erroFoto}</p>}
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" name="teste" defaultChecked={valores.teste} className="size-5 accent-pinheiro" />
        <span>Cartinha de teste (some com “Apagar cartinhas de teste”)</span>
      </label>
      {estado.erro && <p role="alert" className="font-semibold text-vermelho">{estado.erro}</p>}
      <button
        type="submit"
        disabled={salvando || enviandoFoto}
        className="min-h-12 rounded-full bg-pinheiro px-6 font-semibold text-papel hover:bg-pinheiro-escuro disabled:opacity-60"
      >
        {enviandoFoto ? "Enviando foto…" : salvando ? "Salvando…" : "Salvar cartinha"}
      </button>
    </form>
  );
}
