"use server";

import { updateTag } from "next/cache";
import { exigirVoluntario } from "./sessao";
import { listarPontos } from "@/lib/dados/conteudo";
import { linkWhatsappAprovacao, type DadosAprovacao } from "@/lib/adocao/whatsapp";
import { montarEmailAprovacao } from "@/lib/email/aprovacao";
import { enviarEmail } from "@/lib/email/enviar";

export type ResultadoDecisao = {
  ok: boolean;
  mensagem: string;
  whatsapp?: string;
  emailOk?: boolean;
};

const ROTULO = { aprovar: "aprovada", recusar: "recusada", cancelar: "cancelada" } as const;

/** Aprovar, recusar ou cancelar uma adoção. Na aprovação, envia o e-mail e devolve o link de WhatsApp. */
export async function decidir(adocaoId: string, acao: "aprovar" | "recusar" | "cancelar"): Promise<ResultadoDecisao> {
  const { supabase } = await exigirVoluntario();
  const { data, error } = await supabase.rpc("decidir_adocao", { p_adocao_id: adocaoId, p_acao: acao });
  if (error) return { ok: false, mensagem: "Não foi possível registrar. Tente de novo." };
  if (data !== "ok") return { ok: false, mensagem: "Essa adoção já foi decidida por outra pessoa. Atualize a página." };
  updateTag("cartinhas");

  const { data: a } = await supabase
    .from("adocoes")
    .select("padrinho_nome, padrinho_whatsapp, padrinho_email, cartinhas(codigo, primeiro_nome, pedido, tamanho_roupa, tamanho_calcado)")
    .eq("id", adocaoId)
    .single();
  const c = a?.cartinhas;
  if (!a || !c) return { ok: true, mensagem: `Adoção ${ROTULO[acao]}.` };

  const dados: DadosAprovacao = {
    padrinhoNome: a.padrinho_nome,
    padrinhoWhatsapp: a.padrinho_whatsapp,
    codigo: c.codigo,
    primeiroNome: c.primeiro_nome,
    pedido: c.pedido,
    tamanhoRoupa: c.tamanho_roupa,
    tamanhoCalcado: c.tamanho_calcado,
  };
  if (acao !== "aprovar") return { ok: true, mensagem: `Cartinha ${c.codigo}: adoção ${ROTULO[acao]}. A cartinha voltou para a lista.` };

  const email = montarEmailAprovacao(dados, await listarPontos());
  const envio = await enviarEmail({ para: a.padrinho_email, nomePara: a.padrinho_nome, ...email });
  return {
    ok: true,
    emailOk: envio.ok,
    whatsapp: linkWhatsappAprovacao(dados),
    mensagem: envio.ok
      ? `Cartinha ${c.codigo} aprovada. E-mail enviado para ${a.padrinho_email}.`
      : `Cartinha ${c.codigo} aprovada, mas o e-mail não foi enviado (${envio.motivo}). Avise pelo WhatsApp.`,
  };
}
