"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/format";

/* Carrossel de banners (imagens prontas) com troca automática, setas e bolinhas */
export function Carousel({ slides }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (pausa) return;
    const t = setInterval(() => setI((v) => (v + 1) % total), 6500);
    return () => clearInterval(t);
  }, [pausa, total]);

  const ir = (n) => setI((n + total) % total);

  return (
    <div
      className="relative aspect-[1024/434] w-full overflow-hidden rounded-[28px] bg-forest text-cream shadow-[var(--shadow)]"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques da plataforma"
    >
      {slides.map((s, idx) => (
        <img
          key={s.imagem}
          src={s.imagem}
          alt={s.alt}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-1000", idx === i ? "opacity-100" : "pointer-events-none opacity-0")}
          aria-hidden={idx !== i}
        />
      ))}

      <button onClick={() => ir(i - 1)} className="glass absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-cream/20 md:flex" aria-label="Slide anterior"><ChevronLeft size={20} /></button>
      <button onClick={() => ir(i + 1)} className="glass absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-cream/20 md:flex" aria-label="Próximo slide"><ChevronRight size={20} /></button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`Ir para o slide ${idx + 1}`} aria-current={idx === i} className={cn("h-2 rounded-full transition-all duration-500", idx === i ? "w-9 bg-leaf" : "w-2 bg-cream/60 hover:bg-cream")} />
        ))}
      </div>
    </div>
  );
}
