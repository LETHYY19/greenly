"use client";
import { Check } from "lucide-react";
import { cn } from "../lib/format";
import { FruitArt } from "./FruitArt";
import { StatusPill } from "./ui";

/* Seleção das plantações liberadas pelo administrador para o usuário */
export function FruitPicker({ estufas, selecionada, onSelecionar }) {
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Escolha a plantação">
      {estufas.map((e) => {
        const ativo = selecionada === e.id;
        return (
          <button
            key={e.id}
            role="radio"
            aria-checked={ativo}
            onClick={() => onSelecionar(e.id)}
            className={cn(
              "group relative flex min-w-[170px] items-center gap-3 rounded-2xl border-2 bg-surface p-3 pr-5 text-left transition-all duration-300",
              ativo ? "border-brand shadow-lg shadow-brand/20" : "border-line hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
            )}
          >
            <FruitArt nome={e.cultura} size={52} className="transition-transform duration-300 group-hover:scale-110" />
            <span className="flex-1">
              <span className="block text-base font-extrabold text-ink">{e.cultura}</span>
              <span className="mt-0.5 block"><StatusPill status={e.status} className="px-2 py-0.5 text-[10px]" /></span>
            </span>
            {ativo && <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-ink shadow anim-pop"><Check size={14} strokeWidth={3} /></span>}
          </button>
        );
      })}
    </div>
  );
}
