"use client";
import { useState } from "react";
import { cn } from "../lib/format";

export const SERIES = [
  { key: "temperatura", label: "Temperatura", unidade: "°C", cor: "#F0A04B" },
  { key: "umidadeAr", label: "Umidade do ar", unidade: "%", cor: "#4FC3C6" },
  { key: "umidadeSolo", label: "Umidade do solo", unidade: "%", cor: "#A7C957" },
];

const W = 900, H = 340, PL = 44, PR = 18, PT = 18, PB = 38;

// curva suave (Catmull-Rom → Bézier) para o efeito de "ondas"
function suave(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/* Painel escuro: legenda com bolinhas à esquerda + gráfico de ondas à direita */
export function WavePanel({ historico, titulo = "Histórico das últimas 24 horas", className }) {
  const [ocultas, setOcultas] = useState({});
  const [hover, setHover] = useState(null);
  const n = historico.length;
  const x = (i) => PL + (i / (n - 1)) * (W - PL - PR);
  const y = (v) => PT + (1 - v / 100) * (H - PT - PB);

  const caminhos = SERIES.map((s) => {
    const pts = historico.map((h, i) => [x(i), y(Math.min(100, Math.max(0, h[s.key])))]);
    const linha = suave(pts);
    return { ...s, linha, area: `${linha} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z` };
  });

  const ultimo = historico[n - 1];
  function mover(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.min(n - 1, Math.max(0, Math.round(((px - PL) / (W - PL - PR)) * (n - 1)))));
  }

  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E2A12] via-[#243216] to-[#1A2410] p-5 text-cream shadow-[var(--shadow)] md:p-7", className)}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[230px_1fr]">
        {/* legenda com bolinhas */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cream/60">Legenda</p>
          <ul className="mt-4 space-y-3">
            {SERIES.map((s) => {
              const off = ocultas[s.key];
              return (
                <li key={s.key}>
                  <button onClick={() => setOcultas((o) => ({ ...o, [s.key]: !o[s.key] }))} aria-pressed={!off} className={cn("flex w-full items-center gap-3 rounded-2xl border border-cream/10 bg-cream/5 px-4 py-3 text-left transition hover:bg-cream/10", off && "opacity-40")}>
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: s.cor, boxShadow: off ? "none" : `0 0 12px ${s.cor}` }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{s.label}</span>
                      <span className="block text-xs font-semibold text-cream/60">agora: {Number(ultimo[s.key]).toLocaleString("pt-BR")} {s.unidade}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-cream/50">Toque em um item para mostrar ou esconder a onda.</p>
        </div>

        {/* gráfico de ondas */}
        <div className="min-w-0">
          <p className="mb-2 text-sm font-bold text-cream/80">{titulo}</p>
          <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-pan-y" onPointerMove={mover} onPointerLeave={() => setHover(null)} role="img" aria-label="Gráfico de ondas com temperatura, umidade do ar e umidade do solo">
              <defs>
                {SERIES.map((s) => (
                  <linearGradient key={s.key} id={`wv-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor={s.cor} stopOpacity=".55" /><stop offset="1" stopColor={s.cor} stopOpacity=".03" />
                  </linearGradient>
                ))}
                <filter id="brilho" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              {[0, 20, 40, 60, 80, 100].map((t) => (
                <g key={t}>
                  <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="#FEFAE0" strokeOpacity=".09" strokeDasharray="4 6" />
                  <text x={PL - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#FEFAE0" fillOpacity=".55">{t}</text>
                </g>
              ))}
              {historico.map((h, i) => (
                <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="12" fill="#FEFAE0" fillOpacity=".6">{h.hora}</text>
              ))}
              {caminhos.map((s) => !ocultas[s.key] && (
                <g key={s.key}>
                  <path d={s.area} fill={`url(#wv-${s.key})`} style={{ animation: "fade-up 1s ease both" }} />
                  <path d={s.linha} fill="none" stroke={s.cor} strokeWidth="3.2" strokeLinecap="round" filter="url(#brilho)" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 0, animation: "draw-line 1.6s ease-out both", "--len": 1 }} />
                </g>
              ))}
              {hover !== null && (
                <g>
                  <line x1={x(hover)} x2={x(hover)} y1={PT} y2={H - PB} stroke="#FEFAE0" strokeOpacity=".35" />
                  {SERIES.map((s) => !ocultas[s.key] && <circle key={s.key} cx={x(hover)} cy={y(historico[hover][s.key])} r="5.5" fill="#1A2410" stroke={s.cor} strokeWidth="3" />)}
                </g>
              )}
            </svg>
            {hover !== null && (
              <div className="pointer-events-none absolute top-2 z-10 w-44 rounded-xl border border-cream/20 bg-[#141b0c]/95 p-3 text-xs shadow-xl" style={{ left: `${Math.min(Math.max((x(hover) / W) * 100, 12), 80)}%`, transform: "translateX(-50%)" }}>
                <p className="mb-1.5 font-extrabold">{historico[hover].hora}</p>
                {SERIES.map((s) => !ocultas[s.key] && (
                  <p key={s.key} className="flex items-center justify-between gap-2 py-0.5 font-semibold"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.cor }} />{s.label}</span><span>{historico[hover][s.key]} {s.unidade}</span></p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
