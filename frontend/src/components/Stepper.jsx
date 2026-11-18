"use client";
import { Check } from "lucide-react";
import { cn } from "../lib/format";
import { ETAPAS } from "../lib/constants";

/* Etapas da plantação: a linha vai "acendendo" até a etapa atual */
export function Stepper({ etapa }) {
  const max = ETAPAS.length - 1;
  const pct = (etapa / max) * 100;
  return (
    <div className="px-2 pb-2 pt-4 md:px-6">
      <div className="relative">
        {/* trilho */}
        <div className="absolute left-[10%] right-[10%] top-[26px] h-1.5 rounded-full bg-line" />
        {/* linha que acende */}
        <div className="absolute left-[10%] right-[10%] top-[26px] h-1.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-olive via-leaf to-[#D6EC8B]"
            style={{ "--p": `${pct}%`, width: `${pct}%`, animation: "fill-line 1.8s cubic-bezier(.3,.7,.2,1) both", boxShadow: "0 0 16px 2px rgba(167,201,87,.55)" }}
          />
        </div>

        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${ETAPAS.length}, 1fr)` }}>
          {ETAPAS.map((nome, i) => {
            const feito = i < etapa, atual = i === etapa;
            return (
              <li key={nome} className="flex flex-col items-center text-center">
                <span
                  className={cn(
                    "relative flex h-[54px] w-[54px] items-center justify-center rounded-full border-4 transition-colors",
                    feito && "border-leaf bg-olive text-cream",
                    atual && "border-leaf bg-surface text-brand",
                    !feito && !atual && "border-line bg-surface-2 text-ink-2"
                  )}
                  style={(feito || atual) ? { animation: `node-light .7s cubic-bezier(.2,.9,.3,1.2) ${(i / max) * 1.6}s both`, boxShadow: "0 0 18px 2px rgba(167,201,87,.5)" } : undefined}
                >
                  {atual && <span aria-hidden className="absolute inset-0 rounded-full bg-leaf/50" style={{ animation: "pulse-ring 2s ease-out infinite" }} />}
                  {feito ? <Check size={24} strokeWidth={3} /> : atual ? <span className="h-3.5 w-3.5 rounded-full bg-brand" /> : <span className="text-sm font-extrabold">{i + 1}</span>}
                </span>
                <span className={cn("mt-3 text-sm font-bold md:text-base", atual ? "text-ink" : feito ? "text-ink-2" : "text-ink-2/70")}>{nome}</span>
                {atual && <span className="mt-1 rounded-full bg-soft px-2.5 py-0.5 text-[11px] font-extrabold text-brand">Etapa atual</span>}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
