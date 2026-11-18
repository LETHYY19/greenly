"use client";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "../lib/format";

const TONS = {
  olive: "bg-olive/15 text-olive dark:bg-leaf/15 dark:text-leaf",
  sand: "bg-sand/25 text-[#9A5F12] dark:text-sand",
  clay: "bg-clay/15 text-clay dark:text-[#E59A57]",
  sky: "bg-[#4FA3A5]/15 text-[#2F7F81] dark:text-[#6CC4C6]",
  leaf: "bg-leaf/25 text-[#52681F] dark:text-leaf",
};

/* Cartão padrão do painel: cabeçalho com ícone colorido, título e subtítulo */
export function Secao({ icone: Icone, titulo, sub, tom = "olive", acao, centro = false, className, children, ...p }) {
  return (
    <section className={cn("rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow)] md:p-8", className)} {...p}>
      <div className={cn("mb-6 flex flex-wrap gap-4", centro ? "flex-col items-center text-center" : "items-start justify-between")}>
        <div className={cn("flex gap-4", centro ? "flex-col items-center" : "items-center")}>
          {Icone && <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", TONS[tom])}><Icone size={24} /></span>}
          <div>
            <h2 className="text-xl font-extrabold text-ink md:text-2xl">{titulo}</h2>
            {sub && <p className="mt-0.5 text-sm font-medium text-ink-2">{sub}</p>}
          </div>
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

const CORES_AVATAR = [
  "bg-olive/20 text-olive dark:bg-leaf/20 dark:text-leaf",
  "bg-sand/35 text-[#8A5410] dark:text-sand",
  "bg-clay/20 text-clay dark:text-[#E59A57]",
  "bg-[#4FA3A5]/20 text-[#2F7F81] dark:text-[#6CC4C6]",
  "bg-leaf/35 text-[#46591A] dark:text-leaf",
];
export function Avatar({ nome = "", id = 0, size = 46 }) {
  const ini = nome.trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  return <span className={cn("flex shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold", CORES_AVATAR[id % CORES_AVATAR.length])} style={{ width: size, height: size }}>{ini}</span>;
}

/* Aviso calmo (sem piscar), para não cansar a vista do administrador */
export function Aviso({ tipo = "info", titulo, children, className }) {
  const cfg = {
    ok: { cls: "border-ok bg-ok/10", icone: CheckCircle2, cor: "text-ok" },
    atencao: { cls: "border-warn bg-warn/10", icone: AlertTriangle, cor: "text-warn" },
    critico: { cls: "border-bad bg-bad/10", icone: AlertTriangle, cor: "text-bad" },
    info: { cls: "border-[#4FA3A5] bg-[#4FA3A5]/10", icone: Info, cor: "text-[#2F7F81] dark:text-[#6CC4C6]" },
  }[tipo];
  const I = cfg.icone;
  return (
    <div role={tipo === "critico" || tipo === "atencao" ? "alert" : "status"} className={cn("flex gap-4 rounded-2xl border-l-4 p-5", cfg.cls, className)}>
      <I size={26} className={cn("mt-0.5 shrink-0", cfg.cor)} />
      <div className="min-w-0 flex-1">
        <p className="text-base font-extrabold text-ink">{titulo}</p>
        {children && <div className="mt-1.5 text-sm font-medium text-ink-2">{children}</div>}
      </div>
    </div>
  );
}
