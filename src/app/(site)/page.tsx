import Link from "next/link";
import { CardVidro } from "@/components/vidro/CardVidro";
import { Contador } from "@/components/home/Contador";
import { Edicoes } from "@/components/home/Edicoes";
import { Video } from "@/components/home/Video";
import { BlocoPix } from "@/components/home/BlocoPix";
import { Cronometro } from "@/components/home/Cronometro";
import { obterContador } from "@/lib/dados/contador";
import { listarEdicoes, obterConfiguracoes } from "@/lib/dados/conteudo";
import { rotuloDia } from "@/lib/entrega/agenda";

function textoEvento(iso: string) {
  const f = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const p = Object.fromEntries(f.map((x) => [x.type, x.value]));
  const hora = p.minute === "00" ? `${Number(p.hour)}h` : `${p.hour}h${p.minute}`;
  return { completo: `${p.weekday}, ${p.day}/${p.month}, às ${hora}`, curto: `${p.day}/${p.month}` };
}

export default async function Inicio() {
  const [contagem, edicoes, config] = await Promise.all([obterContador(), listarEdicoes(), obterConfiguracoes()]);
  const prazo = rotuloDia(config.prazoEntrega).data;
  const evento = textoEvento(config.eventoDataHora);

  return (
    <div className="flex flex-col gap-12 pt-10 pb-10 md:pt-16">
      <header className="flex flex-col gap-4">
        <p className="manuscrita text-2xl text-vermelho">4ª edição · Gama-DF</p>
        <h1 className="text-6xl md:text-8xl">Natal Feliz</h1>
        <p className="max-w-prose text-lg">
          Crianças do Gama escreveram cartinhas pedindo um presente de Natal. Você escolhe uma, compra o presente e
          entrega até <strong>{prazo}</strong> num dos pontos de coleta. No dia {evento.curto}, os presentes chegam às
          crianças.
        </p>
        <div className="pt-2">
          <Link
            href="/cartinhas"
            className="inline-flex min-h-12 items-center rounded-full bg-vermelho px-7 text-lg font-semibold text-papel shadow-[var(--shadow-papel)] transition-colors hover:bg-vermelho-escuro"
          >
            Ler cartinhas
          </Link>
        </div>
      </header>

      {contagem.total > 0 && <Contador {...contagem} />}

      <CardVidro data-testid="card-info" className="max-w-xl">
        <h2 className="text-3xl">Como funciona</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Leia as cartinhas e escolha uma.</li>
          <li>Deixe seu nome, WhatsApp e e-mail. A cartinha fica sua na hora.</li>
          <li>
            Marque em <Link href="/entrega" className="font-semibold text-vermelho underline underline-offset-4">Entrega</Link> o dia e o
            horário para levar o presente, até {prazo}.
          </li>
        </ol>
      </CardVidro>

      <Edicoes edicoes={edicoes} />

      {config.videoUrl && <Video url={config.videoUrl} capa={config.videoCapaUrl} />}

      <BlocoPix pix={config.pix} />

      <Cronometro alvo={config.eventoDataHora} dataTexto={evento.completo} />
    </div>
  );
}
