"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PERFIS = [
  { href: "/login/usuario", titulo: "Usuário", texto: "Acompanhe sua estufa, gráficos e avisos", icone: "/images/icon-usuario.png", delay: "0s" },
  { href: "/login/admin", titulo: "Administrador", texto: "Gerencie estufas, equipe e empresas", icone: "/images/icon-admin.png", delay: "-2.2s" },
];

// folhinhas que sobem suavemente ao fundo
const FOLHAS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 100}%`,
  size: 10 + (i * 5) % 16,
  dur: 14 + (i * 3) % 12,
  delay: -((i * 2.7) % 18),
  dx: ((i % 2 ? 1 : -1) * (30 + (i * 11) % 60)) + "px",
}));

export default function Inicio() {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-forest px-6 py-10 text-cream">
      {/* fundo: foto da estufa escurecida e desfocada para dar destaque aos ícones */}
      <div aria-hidden className="absolute inset-0 scale-110 bg-cover bg-center" style={{ backgroundImage: "url(/images/estufa-bg.jpg)", filter: "blur(7px) brightness(.5) saturate(1.1)" }} />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,54,24,.15),rgba(17,23,11,.88)_75%)]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-forest/70 via-transparent to-forest/80" />
      {FOLHAS.map((f, i) => (
        <span key={i} aria-hidden className="absolute bottom-[-30px] rounded-[80%_0_80%_0] bg-leaf/50" style={{ left: f.left, width: f.size, height: f.size, "--dx": f.dx, animation: `drift ${f.dur}s linear ${f.delay}s infinite` }} />
      ))}

      <header className="anim-fade-up relative z-10 flex flex-col items-center text-center">
        <img src="/images/logo-light.png" alt="Greenly" className="h-36 w-auto drop-shadow-[0_6px_30px_rgba(167,201,87,.35)] md:h-44" />
        <h1 className="mt-6 max-w-3xl bg-gradient-to-r from-cream via-[#E9F2C4] to-leaf bg-clip-text text-3xl font-extrabold uppercase leading-tight tracking-wide text-transparent md:text-5xl">
          A evolução do cultivo começa aqui
        </h1>
        <p className="mt-4 text-base font-medium text-cream/75 md:text-lg">Escolha como você deseja acessar a plataforma</p>
      </header>

      <section className="relative z-10 flex flex-1 flex-wrap items-center justify-center gap-10 py-10 md:gap-20" aria-label="Escolha o tipo de acesso">
        {PERFIS.map((p, i) => (
          <Link
            key={p.href}
            href={p.href}
            className="anim-fade-up group relative flex w-[270px] flex-col items-center text-center outline-none md:w-[330px]"
            style={{ animationDelay: `${0.25 + i * 0.15}s` }}
            aria-label={`Entrar como ${p.titulo}`}
          >
            <div className="relative" style={{ animation: `float-y 6s ease-in-out ${p.delay} infinite` }}>
              {/* brilho pulsante */}
              <span aria-hidden className="absolute inset-0 rounded-full bg-leaf/40" style={{ animation: "pulse-ring 3s ease-out infinite", animationDelay: p.delay }} />
              {/* anel degradê girando */}
              <span aria-hidden className="absolute -inset-3 rounded-full opacity-70 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "conic-gradient(from 0deg, #A7C957, #DDA15E, #606C38, #FEFAE0, #A7C957)", animation: "spin-slow 9s linear infinite", filter: "blur(1px)" }} />
              <span aria-hidden className="absolute -inset-1 rounded-full bg-forest" />
              <img
                src={p.icone}
                alt=""
                className="relative h-[230px] w-[230px] rounded-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:shadow-[0_0_90px_14px_rgba(167,201,87,.5)] group-focus-visible:scale-[1.12] md:h-[290px] md:w-[290px]"
              />
              {/* reflexo degradê no hover */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/0 to-white/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>

            <h2 className="mt-9 text-2xl font-extrabold tracking-wide md:text-3xl">{p.titulo}</h2>
            <p className="mt-1 text-sm font-medium text-cream/70 md:text-base">{p.texto}</p>
            <span className="glass mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-cream transition-all duration-300 group-hover:gap-3 group-hover:bg-leaf group-hover:text-forest">
              Entrar <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>

      <footer className="relative z-10 text-xs font-medium text-cream/50">Greenly · Projeto final — Estufa Inteligente</footer>
    </main>
  );
}
