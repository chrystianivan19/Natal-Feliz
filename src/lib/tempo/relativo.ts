const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

function rotulo(ms: number) {
  if (ms < MIN) return null;
  if (ms < HORA) return `${Math.floor(ms / MIN)} min`;
  if (ms < DIA) return `${Math.floor(ms / HORA)} h`;
  const d = Math.floor(ms / DIA);
  return `${d} ${d === 1 ? "dia" : "dias"}`;
}

export function haQuanto(iso: string, agora = new Date()) {
  const r = rotulo(agora.getTime() - Date.parse(iso));
  return r ? `há ${r}` : "agora";
}

export function faltaQuanto(iso: string, agora = new Date()) {
  const ms = Date.parse(iso) - agora.getTime();
  if (ms <= 0) return "expirada";
  return `expira em ${rotulo(ms) ?? "1 min"}`;
}
