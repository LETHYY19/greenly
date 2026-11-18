"use client";
import { useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "../lib/format";
import { STATUS } from "../lib/constants";

export function Card({ className, children, ...p }) {
  return <section className={cn("rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow)]", className)} {...p}>{children}</section>;
}

export function Button({ variant = "primary", className, loading, children, ...p }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60";
  const v = {
    primary: "bg-brand text-brand-ink hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-lg",
    ghost: "border border-line bg-transparent text-ink hover:bg-soft",
    danger: "bg-bad/10 text-bad hover:bg-bad/20",
    sand: "bg-sand text-forest hover:brightness-105 hover:-translate-y-0.5 hover:shadow-lg",
  }[variant];
  return (
    <button className={cn(base, v, className)} disabled={loading || p.disabled} {...p}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Field({ label, error, hint, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-2">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-bad">{error}</span> : hint ? <span className="mt-1 block text-xs text-ink-2">{hint}</span> : null}
    </label>
  );
}

export const inputCls = "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-ink placeholder:text-ink-2/60 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export function StatusPill({ status, children, className }) {
  const s = STATUS[status] || STATUS.ideal;
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", s.classe, className)}>{children || s.rotulo}</span>;
}

export function PageBanner({ eyebrow, titulo, texto, children }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-forest p-8 text-cream md:p-10">
      <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url(/images/estufa-1.jpg)" }} />
      <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/85 to-transparent" />
      <div className="relative max-w-2xl">
        <p className="text-sm font-semibold text-cream/80">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">{titulo}</h1>
        {texto && <p className="mt-3 text-sm leading-relaxed text-cream/80 md:text-base">{texto}</p>}
        {children && <div className="mt-5 flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  );
}

export function Modal({ aberto, onClose, titulo, largo = false, children }) {
  useEffect(() => {
    if (!aberto) return;
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [aberto, onClose]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="absolute inset-0 bg-forest/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("anim-pop relative max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-2xl scroll-slim", largo ? "max-w-3xl" : "max-w-lg")}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-ink">{titulo}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-2 hover:bg-soft hover:text-ink" aria-label="Fechar"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Vazio({ icone: Icone, titulo, texto, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      {Icone && <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-brand"><Icone size={26} /></span>}
      <p className="text-lg font-extrabold text-ink">{titulo}</p>
      {texto && <p className="mt-1 max-w-md text-sm text-ink-2">{texto}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Carregando({ texto = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-2">
      <Loader2 className="animate-spin" size={20} /> <span className="text-sm font-semibold">{texto}</span>
    </div>
  );
}
