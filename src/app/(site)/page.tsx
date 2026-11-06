import Link from "next/link";
import { CardVidro } from "@/components/vidro/CardVidro";
import { Selo } from "@/components/papel/Selo";

// Página provisória da Fase 0: mostra a casca (caderno, vidro, menu).
// A Home completa entra na Fase 3.
export default function Inicio() {
  return (
    <div className="flex flex-col gap-10 pt-10 md:pt-16">
      <header className="flex flex-col gap-4">
        <p className="manuscrita text-2xl text-vermelho">4ª edição · Gama-DF</p>
        <h1 className="text-6xl md:text-8xl">Natal Feliz</h1>
        <p className="max-w-prose">
          Crianças do Gama escreveram cartinhas pedindo um presente de Natal. Você escolhe uma, compra o
          presente e entrega até 23 de dezembro num dos pontos de coleta.
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

      <CardVidro data-testid="card-info" className="max-w-xl">
        <h2 className="text-3xl">Como funciona</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Leia as cartinhas e escolha uma.</li>
          <li>Deixe seu nome, WhatsApp e e-mail.</li>
          <li>A equipe confirma em até 24 horas.</li>
          <li>Entregue o presente até 23/12 num ponto de coleta.</li>
        </ol>
      </CardVidro>

      <div className="flex items-center gap-4">
        <Selo>
          <span className="manuscrita text-3xl leading-none text-pinheiro">29/12</span>
          <span className="text-xs uppercase tracking-wider text-tinta-suave">dia da ação</span>
        </Selo>
        <p className="text-sm text-tinta-suave">Site em construção. As cartinhas entram em breve.</p>
      </div>
    </div>
  );
}
