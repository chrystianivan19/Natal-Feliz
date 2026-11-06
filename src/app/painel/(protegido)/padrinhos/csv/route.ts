import { exigirVoluntario } from "@/lib/painel/sessao";
import { listarPadrinhos } from "@/lib/painel/padrinhos";
import { gerarCsvPadrinhos } from "@/lib/exportacao/csv";

export async function GET() {
  const { supabase } = await exigirVoluntario();
  const csv = gerarCsvPadrinhos(await listarPadrinhos(supabase));
  const hoje = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="padrinhos-natal-feliz-${hoje}.csv"`,
      "cache-control": "no-store",
    },
  });
}
