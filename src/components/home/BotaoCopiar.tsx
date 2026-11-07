"use client";

import { useEffect, useState } from "react";

export function BotaoCopiar({ texto, rotulo, confirmacao, secundario = false }: { texto: string; rotulo: string; confirmacao: string; secundario?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // navegador sem permissão: seleciona num campo temporário
      const t = document.createElement("textarea");
      t.value = texto;
      document.body.append(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopiado(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={copiar}
        className={
          secundario
            ? "min-h-12 rounded-full border border-pinheiro px-5 font-semibold text-pinheiro transition-colors hover:bg-pinheiro/10"
            : "min-h-12 rounded-full bg-pinheiro px-6 font-semibold text-papel transition-colors hover:bg-pinheiro-escuro"
        }
      >
        {copiado ? confirmacao : rotulo}
      </button>
      <span className="sr-only" aria-live="polite">{copiado ? confirmacao : ""}</span>
    </>
  );
}
