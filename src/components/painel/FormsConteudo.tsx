"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adicionarFotos,
  atualizarFoto,
  excluirEdicao,
  excluirPatrocinador,
  removerFoto,
  salvarEdicao,
  salvarGeral,
  salvarPatrocinador,
  type EstadoConteudo,
} from "@/lib/painel/acoes-conteudo";
import { enviarFoto } from "@/lib/imagem/comprimir";
import { createBrowserClient } from "@/lib/supabase/browser";

const campo = "min-h-12 w-full rounded-xl border border-tinta/25 bg-white px-4 text-base outline-none focus:border-pinheiro";
const botao = "min-h-12 rounded-full bg-pinheiro px-6 font-semibold text-papel hover:bg-pinheiro-escuro disabled:opacity-60";

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-semibold">{rotulo}</span>
      {children}
      {dica && <span className="text-sm text-tinta-suave">{dica}</span>}
    </label>
  );
}

function Aviso({ estado }: { estado: EstadoConteudo }) {
  if (estado.erro) return <p role="alert" className="font-semibold text-vermelho">{estado.erro}</p>;
  if (estado.ok) return <p role="status" className="font-semibold text-pinheiro">{estado.ok}</p>;
  return null;
}

/** Sobe a imagem (se houver) antes de chamar a Server Action. */
function useEnvioComImagem(acao: (f: FormData) => void, bucket: string, campoArquivo: string, campoCaminho: string) {
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  async function enviar(form: FormData) {
    setErro(null);
    const arquivo = form.get(campoArquivo);
    if (arquivo instanceof File && arquivo.size > 0) {
      try {
        setEnviando(true);
        form.set(campoCaminho, await enviarFoto(createBrowserClient(), bucket, `${crypto.randomUUID()}.webp`, arquivo));
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Falha ao enviar a imagem.");
        return;
      } finally {
        setEnviando(false);
      }
    }
    form.delete(campoArquivo);
    acao(form);
  }
  return { enviar, erro, enviando };
}

/* ---------- Geral ---------- */

export type ValoresGeral = {
  pixChave: string;
  pixTipo: string;
  pixRecebedor: string;
  pixCidade: string;
  pixBanco: string;
  whatsappContato: string;
  eventoData: string;
  eventoHora: string;
  prazoEntrega: string;
  videoUrl: string;
  videoCapaUrl: string | null;
};

export function FormGeral({ v }: { v: ValoresGeral }) {
  const [estado, acao, salvando] = useActionState<EstadoConteudo, FormData>(salvarGeral, {});
  const { enviar, erro, enviando } = useEnvioComImagem(acao, "galeria", "video_capa", "video_capa_path");
  return (
    <form action={enviar} className="flex max-w-xl flex-col gap-6">
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-tinta/10 bg-white p-4">
        <legend className="px-1 text-2xl">Pix para doações</legend>
        <Campo rotulo="Chave Pix" dica="Deixe vazio para esconder o bloco do Pix no site.">
          <input name="pix_chave" defaultValue={v.pixChave} className={campo} />
        </Campo>
        <Campo rotulo="Tipo da chave">
          <select name="pix_tipo" defaultValue={v.pixTipo} className={campo}>
            <option value="">Descobrir sozinho</option>
            <option value="email">E-mail</option>
            <option value="telefone">Telefone</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="aleatoria">Chave aleatória</option>
          </select>
        </Campo>
        <Campo rotulo="Nome de quem recebe" dica="Aparece no app do banco na hora do Pix.">
          <input name="pix_recebedor" defaultValue={v.pixRecebedor} className={campo} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Cidade">
            <input name="pix_cidade" defaultValue={v.pixCidade} placeholder="Gama" className={campo} />
          </Campo>
          <Campo rotulo="Banco">
            <input name="pix_banco" defaultValue={v.pixBanco} className={campo} />
          </Campo>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-2xl border border-tinta/10 bg-white p-4">
        <legend className="px-1 text-2xl">Contato e datas</legend>
        <Campo rotulo="WhatsApp de contato" dica="Usado em “Quer patrocinar?” e nos avisos do site.">
          <input name="whatsapp_contato" type="tel" defaultValue={v.whatsappContato} placeholder="(61) 99999-9999" className={campo} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Dia do evento">
            <input name="evento_data" type="date" defaultValue={v.eventoData} required className={campo} />
          </Campo>
          <Campo rotulo="Hora do evento">
            <input name="evento_hora" type="time" defaultValue={v.eventoHora} required className={campo} />
          </Campo>
        </div>
        <Campo rotulo="Último dia de entrega dos presentes">
          <input name="prazo_entrega" type="date" defaultValue={v.prazoEntrega} required className={campo} />
        </Campo>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-2xl border border-tinta/10 bg-white p-4">
        <legend className="px-1 text-2xl">Vídeo da Home</legend>
        <Campo rotulo="Link do vídeo (MP4)" dica="Deixe vazio para esconder o vídeo.">
          <input name="video_url" type="url" defaultValue={v.videoUrl} className={campo} />
        </Campo>
        <div className="flex flex-col gap-1">
          <label htmlFor="video_capa" className="font-semibold">Capa do vídeo {v.videoCapaUrl ? "(trocar)" : ""}</label>
          {v.videoCapaUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- prévia simples no painel
            <img src={v.videoCapaUrl} alt="Capa atual" className="h-28 w-auto self-start rounded-lg border border-tinta/10" />
          )}
          <input id="video_capa" name="video_capa" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-12" />
          {v.videoCapaUrl && (
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" name="remover_capa" className="size-5 accent-pinheiro" /> Remover capa
            </label>
          )}
        </div>
      </fieldset>

      {erro && <p role="alert" className="font-semibold text-vermelho">{erro}</p>}
      <Aviso estado={estado} />
      <button type="submit" disabled={salvando || enviando} className={botao}>
        {enviando ? "Enviando imagem…" : salvando ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}

/* ---------- Patrocinadores ---------- */

export type ValoresPatrocinador = { id: string; nome: string; link: string; ordem: number; ativo: boolean; logoUrl: string | null };

export function FormPatrocinador({ v }: { v: ValoresPatrocinador }) {
  const [estado, acao, salvando] = useActionState<EstadoConteudo, FormData>(salvarPatrocinador, {});
  const { enviar, erro, enviando } = useEnvioComImagem(acao, "patrocinadores", "logo", "logo_path");
  return (
    <form action={enviar} className="flex max-w-xl flex-col gap-4">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <Campo rotulo="Nome">
        <input name="nome" defaultValue={v.nome} required className={campo} />
      </Campo>
      <Campo rotulo="Site ou Instagram" dica="Opcional. O logo vira link.">
        <input name="link" type="url" defaultValue={v.link} placeholder="https://" className={campo} />
      </Campo>
      <Campo rotulo="Ordem na página">
        <input name="ordem" type="number" inputMode="numeric" defaultValue={v.ordem} className={campo} />
      </Campo>
      <div className="flex flex-col gap-1">
        <label htmlFor="logo" className="font-semibold">Logo {v.logoUrl ? "(trocar)" : ""}</label>
        {v.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- prévia simples no painel
          <img src={v.logoUrl} alt="Logo atual" className="h-20 w-auto self-start rounded-lg border border-tinta/10 bg-white p-2" />
        )}
        <input id="logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-12" />
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" name="ativo" defaultChecked={v.ativo} className="size-5 accent-pinheiro" />
        <span>Aparece no site</span>
      </label>
      {erro && <p role="alert" className="font-semibold text-vermelho">{erro}</p>}
      <Aviso estado={estado} />
      <button type="submit" disabled={salvando || enviando} className={botao}>
        {enviando ? "Enviando logo…" : salvando ? "Salvando…" : "Salvar patrocinador"}
      </button>
    </form>
  );
}

/* ---------- Edições ---------- */

export type ValoresEdicao = { id: string; ano: number | ""; numero: string; criancas: string; presentes: string; texto: string };

export function FormEdicao({ v }: { v: ValoresEdicao }) {
  const [estado, acao, salvando] = useActionState<EstadoConteudo, FormData>(salvarEdicao, {});
  return (
    <form action={acao} className="flex max-w-xl flex-col gap-4">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <div className="grid grid-cols-2 gap-4">
        <Campo rotulo="Ano">
          <input name="ano" type="number" inputMode="numeric" defaultValue={v.ano} required className={campo} />
        </Campo>
        <Campo rotulo="Nº da edição">
          <input name="edicao_numero" type="number" inputMode="numeric" defaultValue={v.numero} className={campo} />
        </Campo>
        <Campo rotulo="Crianças atendidas">
          <input name="criancas_atendidas" type="number" inputMode="numeric" defaultValue={v.criancas} className={campo} />
        </Campo>
        <Campo rotulo="Presentes entregues">
          <input name="presentes_entregues" type="number" inputMode="numeric" defaultValue={v.presentes} className={campo} />
        </Campo>
      </div>
      <Campo rotulo="Texto curto" dica="Uma ou duas frases sobre como foi.">
        <textarea name="texto" rows={3} defaultValue={v.texto} className={`${campo} py-3`} />
      </Campo>
      <Aviso estado={estado} />
      <button type="submit" disabled={salvando} className={botao}>
        {salvando ? "Salvando…" : v.id ? "Salvar edição" : "Criar edição e adicionar fotos"}
      </button>
    </form>
  );
}

export type FotoPainel = { id: string; url: string; alt: string; ordem: number };

export function FotosEdicao({ edicaoId, ano, fotos }: { edicaoId: string; ano: number; fotos: FotoPainel[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function enviarTodas() {
    const arquivos = [...(entrada.current?.files ?? [])];
    if (!arquivos.length) return;
    setMsg(null);
    const supabase = createBrowserClient();
    const caminhos: string[] = [];
    const falhas: string[] = [];
    for (const [i, a] of arquivos.entries()) {
      setProgresso(`Enviando ${i + 1} de ${arquivos.length}…`);
      try {
        caminhos.push(await enviarFoto(supabase, "galeria", `${ano}/${crypto.randomUUID()}.webp`, a));
      } catch {
        falhas.push(a.name);
      }
    }
    setProgresso(null);
    if (caminhos.length) {
      const r = await adicionarFotos(edicaoId, caminhos);
      setMsg(r.mensagem + (falhas.length ? ` Falharam: ${falhas.join(", ")}.` : ""));
    } else setMsg(`Nenhuma foto enviada. Falharam: ${falhas.join(", ")}.`);
    if (entrada.current) entrada.current.value = "";
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-3xl">Fotos ({fotos.length})</h2>
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-dourado bg-papel p-4">
        <label htmlFor="fotos" className="font-semibold">Adicionar fotos</label>
        <p className="text-sm">Pode escolher várias de uma vez. Cada foto é reduzida antes de subir.</p>
        <input id="fotos" ref={entrada} type="file" multiple accept="image/jpeg,image/png,image/webp" className="min-h-12" />
        <button type="button" onClick={enviarTodas} disabled={!!progresso} className={`${botao} self-start`}>
          {progresso ?? "Enviar fotos"}
        </button>
        {msg && <p role="status" className="font-semibold">{msg}</p>}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {fotos.map((f) => (
          <li key={f.id} className="flex flex-col gap-2 rounded-xl border border-tinta/10 bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- prévia simples no painel */}
            <img src={f.url} alt={f.alt} className="aspect-square w-full rounded-lg object-cover" loading="lazy" />
            <form
              action={(fd) =>
                iniciar(async () => {
                  await atualizarFoto(f.id, String(fd.get("alt") ?? ""), Number(fd.get("ordem")) || 0);
                  router.refresh();
                })
              }
              className="flex flex-col gap-1"
            >
              <input name="alt" defaultValue={f.alt} placeholder="Descrição da foto" aria-label="Descrição da foto" className="min-h-11 rounded-lg border border-tinta/25 px-2 text-sm" />
              <div className="flex gap-1">
                <input name="ordem" type="number" defaultValue={f.ordem} aria-label="Ordem" className="min-h-11 w-16 rounded-lg border border-tinta/25 px-2 text-sm" />
                <button type="submit" disabled={pendente} className="min-h-11 flex-1 rounded-lg border border-pinheiro text-sm font-semibold text-pinheiro hover:bg-pinheiro/5">
                  Salvar
                </button>
              </div>
            </form>
            <button
              type="button"
              disabled={pendente}
              onClick={() => {
                if (!confirm("Remover esta foto?")) return;
                iniciar(async () => {
                  await removerFoto(f.id);
                  router.refresh();
                });
              }}
              className="min-h-11 rounded-lg text-sm font-semibold text-vermelho hover:bg-vermelho/5"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Excluir (patrocinador / edição) ---------- */

export function BotaoExcluir({ tipo, id, nome }: { tipo: "patrocinador" | "edicao"; id: string; nome: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();
  const destino = tipo === "patrocinador" ? "/painel/conteudo/patrocinadores" : "/painel/conteudo/edicoes";
  return (
    <div className="flex flex-col gap-2 border-t border-tinta/10 pt-4">
      <button
        type="button"
        disabled={pendente}
        onClick={() => {
          if (!confirm(tipo === "edicao" ? `Excluir a edição ${nome} e todas as fotos dela?` : `Excluir ${nome}?`)) return;
          iniciar(async () => {
            const r = tipo === "patrocinador" ? await excluirPatrocinador(id) : await excluirEdicao(id);
            if (r.ok) router.push(destino);
            else setMsg(r.mensagem);
          });
        }}
        className="min-h-11 self-start rounded-full border border-vermelho px-5 font-semibold text-vermelho hover:bg-vermelho/5 disabled:opacity-50"
      >
        {pendente ? "Excluindo…" : "Excluir"}
      </button>
      {msg && <p role="alert" className="font-semibold text-vermelho">{msg}</p>}
    </div>
  );
}
