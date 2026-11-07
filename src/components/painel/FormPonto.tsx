"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirPonto, salvarPonto, type EstadoPonto } from "@/lib/painel/acoes-pontos";
import { enviarFoto } from "@/lib/imagem/comprimir";
import { createBrowserClient } from "@/lib/supabase/browser";

export type ValoresPonto = {
  id: string;
  nome: string;
  endereco: string;
  mapsUrl: string;
  telefone: string;
  referencia: string;
  ordem: number;
  ativo: boolean;
  logoUrl: string | null;
};

const campo = "min-h-12 rounded-xl border border-tinta/25 bg-white px-4 text-base outline-none focus:border-pinheiro";

export function FormPonto({ valores }: { valores: ValoresPonto }) {
  const [estado, acao, salvando] = useActionState<EstadoPonto, FormData>(salvarPonto, {});
  const [erroLogo, setErroLogo] = useState<string | null>(null);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const logo = useRef<HTMLInputElement>(null);

  async function antesDeEnviar(form: FormData) {
    setErroLogo(null);
    const arquivo = logo.current?.files?.[0];
    if (arquivo) {
      try {
        setEnviandoLogo(true);
        form.set("logo_path", await enviarFoto(createBrowserClient(), "pontos", `${crypto.randomUUID()}.webp`, arquivo));
      } catch (e) {
        setErroLogo(e instanceof Error ? e.message : "Falha ao enviar o logo.");
        return;
      } finally {
        setEnviandoLogo(false);
      }
    }
    form.delete("logo");
    acao(form);
  }

  return (
    <form action={antesDeEnviar} className="flex max-w-xl flex-col gap-4">
      {valores.id && <input type="hidden" name="id" value={valores.id} />}
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Nome do lugar</span>
        <input name="nome" defaultValue={valores.nome} required className={campo} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Endereço</span>
        <input name="endereco" defaultValue={valores.endereco} required className={campo} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Link do Google Maps</span>
        <input name="maps_url" type="url" defaultValue={valores.mapsUrl} placeholder="https://maps.app.goo.gl/…" className={campo} />
        <span className="text-sm text-tinta-suave">Opcional. Sem link, o site abre o mapa buscando pelo endereço.</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Telefone</span>
          <input name="telefone" type="tel" defaultValue={valores.telefone} placeholder="(61) 3333-4444" className={campo} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Ordem na página</span>
          <input name="ordem" type="number" inputMode="numeric" defaultValue={valores.ordem} className={campo} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Ponto de referência</span>
        <input name="referencia" defaultValue={valores.referencia} placeholder="Ao lado da padaria da esquina" className={campo} />
      </label>
      <div className="flex flex-col gap-1">
        <label htmlFor="logo" className="font-semibold">Logo {valores.logoUrl ? "(trocar)" : ""}</label>
        {valores.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- prévia simples no painel
          <img src={valores.logoUrl} alt="Logo atual" className="h-20 w-auto self-start rounded-lg border border-tinta/10 bg-white p-2" />
        )}
        <input id="logo" ref={logo} name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-12" />
        <span className="text-sm text-tinta-suave">Opcional. Sem logo, o cartão mostra as iniciais do nome.</span>
        {erroLogo && <p role="alert" className="text-sm font-semibold text-vermelho">{erroLogo}</p>}
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" name="ativo" defaultChecked={valores.ativo} className="size-5 accent-pinheiro" />
        <span>Aparece no site</span>
      </label>
      {estado.erro && <p role="alert" className="font-semibold text-vermelho">{estado.erro}</p>}
      <button
        type="submit"
        disabled={salvando || enviandoLogo}
        className="min-h-12 rounded-full bg-pinheiro px-6 font-semibold text-papel hover:bg-pinheiro-escuro disabled:opacity-60"
      >
        {enviandoLogo ? "Enviando logo…" : salvando ? "Salvando…" : "Salvar ponto"}
      </button>
    </form>
  );
}

export function BotaoExcluirPonto({ id, nome }: { id: string; nome: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pendente}
        onClick={() => {
          if (!confirm(`Excluir o ponto “${nome}”?`)) return;
          iniciar(async () => {
            const r = await excluirPonto(id);
            if (r.ok) router.push("/painel/conteudo/pontos");
            else setMsg(r.mensagem);
          });
        }}
        className="min-h-11 self-start rounded-full border border-vermelho px-5 font-semibold text-vermelho hover:bg-vermelho/5 disabled:opacity-50"
      >
        {pendente ? "Excluindo…" : "Excluir ponto"}
      </button>
      {msg && <p role="alert" className="font-semibold text-vermelho">{msg}</p>}
    </div>
  );
}
