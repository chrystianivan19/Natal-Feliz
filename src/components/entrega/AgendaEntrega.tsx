"use client";

import Image from "next/image";
import { startTransition, useActionState, useRef, useState } from "react";
import type { PontoEntrega } from "@/lib/dados/conteudo";
import { HORAS, diasDisponiveis, horaJaPassou, rotuloDia, rotuloHora } from "@/lib/entrega/agenda";
import { reservar, type EstadoReserva } from "@/lib/entrega/acoes";

const MSG: Record<string, string> = {
  nao_encontrada: "Não achamos uma adoção com esse código e esse WhatsApp. Confira os dois e tente de novo.",
  dia_invalido: "Esse dia não está mais disponível. Escolha outro.",
  horario_invalido: "Esse horário já passou. Escolha outro.",
  ponto_invalido: "Esse ponto não está recebendo presentes agora. Escolha outro.",
  limite: "Muitas tentativas seguidas. Espere um pouco e tente de novo.",
  erro: "Não conseguimos registrar agora. Tente em alguns minutos.",
};

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || nome.slice(0, 2).toUpperCase();
}

function Marca({ p }: { p: PontoEntrega }) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center bg-white">
      {p.logoUrl ? (
        <Image src={p.logoUrl} alt={`Logo de ${p.nome}`} fill sizes="(max-width: 767px) 50vw, 25vw" className="object-contain p-4" />
      ) : (
        <span aria-hidden className="manuscrita flex size-20 items-center justify-center rounded-full bg-pinheiro text-4xl text-papel">
          {iniciais(p.nome)}
        </span>
      )}
    </div>
  );
}

export function AgendaEntrega({ pontos, prazo }: { pontos: PontoEntrega[]; prazo: string }) {
  const painel = useRef<HTMLDialogElement>(null);
  const [ponto, setPonto] = useState<PontoEntrega | null>(null);
  const [dias, setDias] = useState<string[]>([]);
  const [codigo, setCodigo] = useState("");

  function abrir(p: PontoEntrega) {
    setPonto(p);
    setDias(diasDisponiveis(new Date(), prazo));
    setCodigo(new URLSearchParams(window.location.search).get("codigo")?.toUpperCase() ?? "");
    painel.current?.showModal();
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {pontos.map((p) => (
          <li key={p.id} data-testid="card-ponto">
            <button
              type="button"
              onClick={() => abrir(p)}
              aria-label={`Escolher horário em ${p.nome}`}
              className="vidro vidro-interativo flex h-full w-full flex-col overflow-hidden p-0 text-left"
            >
              <Marca p={p} />
              <span className="flex flex-1 flex-col gap-1 p-3">
                <span className="manuscrita text-2xl leading-none">{p.nome}</span>
                <span className="text-sm leading-snug text-tinta-suave">{p.endereco}</span>
                {p.referencia && <span className="line-clamp-2 text-sm leading-snug">{p.referencia}</span>}
                <span className="mt-auto pt-2 text-sm font-semibold text-vermelho underline decoration-2 underline-offset-4">
                  Escolher horário
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={painel}
        aria-label={ponto ? `Agendar entrega em ${ponto.nome}` : "Agendar entrega"}
        onClose={() => setPonto(null)}
        className="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-lg rounded-t-3xl bg-papel p-0 text-tinta backdrop:bg-tinta/60 md:my-auto md:rounded-3xl"
      >
        {ponto && (
          <div className="flex flex-col gap-4 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="flex items-start justify-between gap-4">
              <p className="manuscrita text-3xl leading-tight">{ponto.nome}</p>
              <button type="button" onClick={() => painel.current?.close()} className="min-h-11 min-w-11 rounded-full border border-tinta/20 px-3 font-semibold hover:border-vermelho">
                Fechar
              </button>
            </div>
            <dl className="flex flex-col gap-1 text-sm">
              <div>
                <dt className="sr-only">Endereço</dt>
                <dd>
                  {ponto.endereco}{" "}
                  <a href={ponto.mapsUrl} target="_blank" rel="noopener" className="font-semibold text-vermelho underline underline-offset-4">
                    Ver no mapa
                  </a>
                </dd>
              </div>
              {ponto.referencia && (
                <div>
                  <dt className="inline font-semibold">Referência: </dt>
                  <dd className="inline">{ponto.referencia}</dd>
                </div>
              )}
              {ponto.telefone && (
                <div>
                  <dt className="inline font-semibold">Telefone: </dt>
                  <dd className="inline">
                    <a href={`tel:+55${ponto.telefone.replace(/\D/g, "")}`} className="underline underline-offset-4">{ponto.telefone}</a>
                  </dd>
                </div>
              )}
            </dl>
            <FormReserva key={ponto.id} ponto={ponto} dias={dias} codigoInicial={codigo} fechar={() => painel.current?.close()} />
          </div>
        )}
      </dialog>
    </>
  );
}

const chip =
  "flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-tinta/20 bg-white px-3 text-center font-semibold transition-colors hover:border-pinheiro has-[:checked]:border-pinheiro has-[:checked]:bg-pinheiro has-[:checked]:text-papel has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40 has-[:disabled]:hover:border-tinta/20 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pinheiro";

function FormReserva({ ponto, dias, codigoInicial, fechar }: { ponto: PontoEntrega; dias: string[]; codigoInicial: string; fechar: () => void }) {
  const [estado, acao, enviando] = useActionState<EstadoReserva, FormData>(reservar, { resultado: "inicial" });
  const [dia, setDia] = useState(dias[0] ?? "");
  const [hora, setHora] = useState<number | null>(null);
  const erros = estado.resultado === "invalido" ? estado.erros : {};
  const agora = new Date();

  if (estado.resultado === "ok") {
    return (
      <div data-testid="reserva-ok" role="status" className="flex flex-col gap-3">
        <h2 className="text-4xl">Horário reservado</h2>
        <p className="rounded-xl border border-dashed border-dourado bg-white p-4 text-lg">
          <strong>{ponto.nome}</strong>
          <br />
          {rotuloDia(estado.dia).completo}, das {rotuloHora(estado.hora).replace(" – ", " às ")}
        </p>
        <p>
          Leve o presente com o código <strong>{estado.codigo}</strong> escrito no pacote. Se precisar mudar, é só escolher outro
          horário com o mesmo código e WhatsApp: a reserva antiga é trocada.
        </p>
        <button type="button" onClick={fechar} className="min-h-12 rounded-full bg-pinheiro px-6 font-semibold text-papel hover:bg-pinheiro-escuro">
          Fechar
        </button>
      </div>
    );
  }

  if (!dias.length) {
    return <p className="rounded-xl bg-vermelho/10 p-3 font-semibold text-vermelho-escuro">O prazo de entrega terminou.</p>;
  }

  const horaValida = hora !== null && !horaJaPassou(dia, hora, agora) ? hora : null;

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      // onSubmit em vez de action: assim o React não limpa o formulário quando volta um erro
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => acao(dados));
      }}
    >
      <input type="hidden" name="ponto" value={ponto.id} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">Dia</legend>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {dias.map((d) => {
            const r = rotuloDia(d);
            return (
              <label key={d} className={`${chip} min-w-16 shrink-0 flex-col py-1 leading-tight`}>
                <input type="radio" name="dia" value={d} checked={dia === d} onChange={() => setDia(d)} className="sr-only" />
                <span className="text-xs font-normal uppercase">{r.semana}</span>
                <span>{r.data}</span>
              </label>
            );
          })}
        </div>
        {erros.dia && <p className="text-sm font-semibold text-vermelho">{erros.dia}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">Horário</legend>
        <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
          {HORAS.map((h) => {
            const passou = horaJaPassou(dia, h, agora);
            return (
              <label key={h} className={`${chip} text-sm`}>
                <input
                  type="radio"
                  name="hora"
                  value={h}
                  checked={horaValida === h}
                  disabled={passou}
                  onChange={() => setHora(h)}
                  className="sr-only"
                />
                {rotuloHora(h)}
              </label>
            );
          })}
        </div>
        {erros.hora && <p className="text-sm font-semibold text-vermelho">{erros.hora}</p>}
      </fieldset>

      <div className="grid gap-4 min-[400px]:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="codigo" className="font-semibold">Código da cartinha</label>
          <input
            id="codigo"
            name="codigo"
            defaultValue={codigoInicial}
            placeholder="C002"
            autoCapitalize="characters"
            aria-invalid={erros.codigo ? true : undefined}
            aria-describedby={erros.codigo ? "codigo-erro" : undefined}
            className={`min-h-12 rounded-xl border bg-white px-4 text-base uppercase outline-none focus:border-pinheiro ${erros.codigo ? "border-vermelho" : "border-tinta/25"}`}
          />
          {erros.codigo && <p id="codigo-erro" className="text-sm font-semibold text-vermelho">{erros.codigo}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="whatsapp-reserva" className="font-semibold">WhatsApp</label>
          <input
            id="whatsapp-reserva"
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(61) 99999-9999"
            aria-invalid={erros.whatsapp ? true : undefined}
            aria-describedby={erros.whatsapp ? "whatsapp-reserva-erro" : undefined}
            className={`min-h-12 rounded-xl border bg-white px-4 text-base outline-none focus:border-pinheiro ${erros.whatsapp ? "border-vermelho" : "border-tinta/25"}`}
          />
          {erros.whatsapp && <p id="whatsapp-reserva-erro" className="text-sm font-semibold text-vermelho">{erros.whatsapp}</p>}
        </div>
      </div>
      <p className="-mt-2 text-sm text-tinta-suave">Use o mesmo WhatsApp que você informou quando adotou a cartinha.</p>

      {estado.resultado in MSG && (
        <p role="alert" className="rounded-xl bg-vermelho/10 p-3 font-semibold text-vermelho-escuro">{MSG[estado.resultado]}</p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="min-h-14 rounded-full bg-vermelho px-6 text-lg font-semibold text-papel transition-colors hover:bg-vermelho-escuro disabled:opacity-60"
      >
        {enviando ? "Reservando…" : "Reservar horário"}
      </button>
    </form>
  );
}
