"use client";

import { useMemo, useState } from "react";
import { conferirLote, lerCsvCartinhas, type ErroLinha, type LinhaCartinha } from "@/lib/importacao/csv";
import { enviarFoto } from "@/lib/imagem/comprimir";
import { createBrowserClient } from "@/lib/supabase/browser";
import { importarLote } from "@/lib/painel/acoes-cartinhas";

export function Importador() {
  const [linhas, setLinhas] = useState<LinhaCartinha[]>([]);
  const [erros, setErros] = useState<ErroLinha[]>([]);
  const [fotos, setFotos] = useState<File[]>([]);
  const [progresso, setProgresso] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ ok: boolean; mensagem: string } | null>(null);

  const conf = useMemo(() => conferirLote(linhas, fotos.map((f) => f.name)), [linhas, fotos]);
  const bloqueado = erros.length > 0 || conf.duplicadas.length > 0 || linhas.length === 0;

  async function lerCsv(arquivo: File | undefined) {
    setResultado(null);
    if (!arquivo) return;
    const r = lerCsvCartinhas(await arquivo.text());
    setLinhas(r.linhas);
    setErros(r.erros);
  }

  async function importar() {
    setResultado(null);
    const supabase = createBrowserClient();
    const porNome = new Map(fotos.map((f) => [f.name, f]));
    const lote: (LinhaCartinha & { imagemPath: string | null })[] = [];
    try {
      const todas = [...conf.prontas, ...linhas.filter((l) => conf.semFoto.includes(l.codigo)).map((l) => ({ ...l, arquivo: null }))];
      for (const [i, l] of todas.entries()) {
        let imagemPath: string | null = null;
        if (l.arquivo) {
          setProgresso(`Enviando foto ${i + 1} de ${todas.length} (${l.codigo})…`);
          imagemPath = await enviarFoto(supabase, "cartinhas", `${l.codigo}.webp`, porNome.get(l.arquivo)!);
        }
        lote.push({ ...l, imagemPath });
      }
      setProgresso("Gravando cartinhas…");
      setResultado(await importarLote(lote));
    } catch (e) {
      setResultado({ ok: false, mensagem: e instanceof Error ? `${e.message}. Nenhuma cartinha foi gravada.` : "Falha no envio." });
    } finally {
      setProgresso(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 rounded-2xl border border-tinta/10 bg-white p-4">
          <span className="font-semibold">1. Planilha (CSV)</span>
          <input type="file" accept=".csv,text/csv" onChange={(e) => lerCsv(e.target.files?.[0])} className="min-h-11" />
        </label>
        <label className="flex flex-col gap-1 rounded-2xl border border-tinta/10 bg-white p-4">
          <span className="font-semibold">2. Fotos das cartinhas</span>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => setFotos([...(e.target.files ?? [])])} className="min-h-11" />
          <span className="text-sm text-tinta-suave">{fotos.length} fotos escolhidas</span>
        </label>
      </div>

      {(linhas.length > 0 || erros.length > 0) && (
        <section className="flex flex-col gap-2 rounded-2xl border border-tinta/10 bg-white p-4">
          <h2 className="text-2xl">Conferência</h2>
          <p><strong>{linhas.length}</strong> linhas válidas · <strong>{conf.prontas.length}</strong> com foto</p>
          {erros.length > 0 && (
            <div className="text-vermelho">
              <p className="font-semibold">Linhas com erro (corrija na planilha e escolha o CSV de novo):</p>
              <ul className="list-disc pl-5">{erros.map((e) => <li key={e.linha}>Linha {e.linha}: {e.motivo}</li>)}</ul>
            </div>
          )}
          {conf.duplicadas.length > 0 && <p className="font-semibold text-vermelho">Códigos repetidos: {conf.duplicadas.join(", ")}</p>}
          {conf.semFoto.length > 0 && <p className="text-dourado-escuro">Sem foto (entram com imagem provisória): {conf.semFoto.join(", ")}</p>}
          {conf.fotoSemLinha.length > 0 && <p className="text-dourado-escuro">Fotos sem linha na planilha (ignoradas): {conf.fotoSemLinha.join(", ")}</p>}
          <p className="text-sm text-tinta-suave">Cartinhas com o mesmo código já cadastradas serão atualizadas.</p>
          <button
            type="button"
            disabled={bloqueado || progresso !== null}
            onClick={importar}
            className="mt-2 min-h-12 self-start rounded-full bg-pinheiro px-6 font-semibold text-papel disabled:opacity-40"
          >
            {progresso ?? `Importar ${linhas.length} cartinhas`}
          </button>
        </section>
      )}
      {resultado && (
        <p role="status" className={`rounded-2xl p-4 font-semibold ${resultado.ok ? "bg-pinheiro/10 text-pinheiro" : "bg-vermelho/10 text-vermelho-escuro"}`}>
          {resultado.mensagem}
        </p>
      )}
    </div>
  );
}
