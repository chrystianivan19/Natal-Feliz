import "server-only";

type Email = { para: string; nomePara?: string; assunto: string; texto: string; html: string };

/**
 * Envia pelo Brevo (https://api.brevo.com). Precisa de BREVO_API_KEY e EMAIL_REMETENTE
 * (um e-mail verificado no Brevo, ex.: o Gmail da equipe). Sem configuração, não envia e avisa.
 */
export async function enviarEmail(e: Email): Promise<{ ok: boolean; motivo?: string }> {
  const chave = process.env.BREVO_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE;
  if (!chave || !remetente) return { ok: false, motivo: "E-mail ainda não configurado" };
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": chave, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: remetente, name: "Natal Feliz" },
        replyTo: { email: remetente, name: "Natal Feliz" },
        to: [{ email: e.para, name: e.nomePara }],
        subject: e.assunto,
        textContent: e.texto,
        htmlContent: e.html,
      }),
    });
    if (!r.ok) return { ok: false, motivo: `Brevo respondeu ${r.status}` };
    return { ok: true };
  } catch {
    return { ok: false, motivo: "Falha de rede ao enviar" };
  }
}
