"use client";
import { Thermometer, Droplets, Sprout, Sun } from "lucide-react";
import { cn, fmt } from "../lib/format";
import { STATUS } from "../lib/constants";
import { StatusPill } from "./ui";

export const ICONES = { temperatura: Thermometer, umidadeAr: Droplets, umidadeSolo: Sprout, luminosidade: Sun };
const ESCALA = { temperatura: [0, 40], umidadeAr: [0, 100], umidadeSolo: [0, 100], luminosidade: [0, 15000] };
const TOM = {
  temperatura: "bg-clay/15 text-clay",
  umidadeAr: "bg-[#4FA3A5]/15 text-[#3C8E90] dark:text-[#6CC4C6]",
  umidadeSolo: "bg-olive/15 text-olive dark:text-leaf",
  luminosidade: "bg-sand/25 text-[#B9741F] dark:text-sand",
};

/* Medidor em arco (270°) com a faixa ideal destacada */
export function Gauge({ chave, valor, min, max, status, size = 132 }) {
  const [e0, e1] = ESCALA[chave];
  const r = 52, C = 2 * Math.PI * r, arco = C * 0.75;
  const f = (v) => Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
  const cor = STATUS[status].cor;
  return (
    <svg width={size} height={size} viewBox="0 0 132 132" className="shrink-0" aria-hidden>
      <g transform="rotate(135 66 66)" fill="none" strokeLinecap="round" strokeWidth="11">
        <circle cx="66" cy="66" r={r} stroke="var(--line)" strokeDasharray={`${arco} ${C}`} />
        <circle cx="66" cy="66" r={r} stroke="var(--ok)" opacity=".28" strokeDasharray={`${arco * (f(max) - f(min))} ${C}`} strokeDashoffset={-arco * f(min)} />
        <circle cx="66" cy="66" r={r} stroke={cor} strokeDasharray={`${Math.max(arco * f(valor), 1)} ${C}`} style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.2,.8,.2,1), stroke .4s" }} />
      </g>
    </svg>
  );
}

/* Mini gráfico de tendência */
export function Spark({ valores, cor, w = 220, h = 44 }) {
  if (!valores || valores.length < 2) return null;
  const mn = Math.min(...valores), mx = Math.max(...valores), span = mx - mn || 1;
  const pts = valores.map((v, i) => [(i / (valores.length - 1)) * w, h - 4 - ((v - mn) / span) * (h - 10)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" preserveAspectRatio="none" aria-hidden>
      <defs><linearGradient id={`sp-${cor.replace(/\W/g, "")}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={cor} stopOpacity=".35" /><stop offset="1" stopColor={cor} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${w} ${h} L0 ${h}Z`} fill={`url(#sp-${cor.replace(/\W/g, "")})`} />
      <path d={d} fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* Cartão grande e visual de cada sensor */
export function MetricCard({ chave, sensor, historico, destaque = true }) {
  const Icone = ICONES[chave];
  const alerta = sensor.status !== "ideal";
  const casas = chave === "temperatura" ? 1 : 0;
  const valor = Number(sensor.valor).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow)] transition-transform duration-300 hover:-translate-y-1", destaque && alerta && `blink-alert ${sensor.status === "critico" ? "blink-critical" : "blink-warning"}`)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={cn("mb-3 flex h-12 w-12 items-center justify-center rounded-2xl", TOM[chave])}><Icone size={24} /></span>
          <p className="text-sm font-bold text-ink-2">{sensor.nome}</p>
        </div>
        <div className="relative">
          <Gauge chave={chave} valor={sensor.valor} min={sensor.min} max={sensor.max} status={sensor.status} size={116} />
        </div>
      </div>
      <p className="-mt-2 text-4xl font-extrabold tracking-tight text-ink md:text-[40px]">{valor}<span className="ml-1 text-lg font-bold text-ink-2">{sensor.unidade.trim()}</span></p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill status={sensor.status} />
        <span className="text-xs font-semibold text-ink-2">Faixa ideal: {fmt(sensor.min)}–{fmt(sensor.max)}{sensor.unidade}</span>
      </div>
      {historico && <div className="mt-4"><Spark valores={historico.map((h) => h[chave])} cor={STATUS[sensor.status].cor.replace("var(--ok)", "#6B8E3A").replace("var(--warn)", "#E07A1F").replace("var(--bad)", "#D8362B")} /></div>}
    </div>
  );
}
