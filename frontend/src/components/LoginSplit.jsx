"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, AlertCircle, Thermometer, BellRing, BarChart3, Users, Building2, Sprout, Sparkles } from "lucide-react";
import { useAuth } from "./Providers";
import { Button, Field, inputCls } from "./ui";
import { ThemeToggle } from "./ThemeToggle";

const TEXTOS = {
  usuario: {
    titulo: "Acesso do Usuário",
    sub: "Entre para acompanhar sua estufa em tempo real.",
    banner: "Sua estufa, sempre sob controle",
    bannerTxt: "Temperatura, umidade e luminosidade em um só lugar — com alertas quando algo precisar de atenção.",
    chips: [[Thermometer, "Sensores em tempo real"], [BarChart3, "Gráficos do cultivo"], [BellRing, "Avisos do administrador"]],
    exemplo: { email: "isabelly@greenly.com", senha: "123456" },
    destino: "/usuario",
  },
  admin: {
    titulo: "Acesso do Administrador",
    sub: "Entre para gerenciar estufas, equipe e produção.",
    banner: "Tudo sob controle para um cultivo mais eficiente",
    bannerTxt: "Cadastre estufas e colaboradores, receba alertas da IA e acompanhe a produção e comercialização.",
    chips: [[Sprout, "Gestão de estufas"], [Users, "Equipe e avisos"], [Building2, "Empresas e lotes"]],
    exemplo: { email: "admin@greenly.com", senha: "admin123" },
    destino: "/admin",
  },
};

export function LoginSplit({ perfil }) {
  const t = TEXTOS[perfil];
  const router = useRouter();
  const { login, usuario, pronto } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (pronto && usuario) router.replace(usuario.perfil === "admin" ? "/admin" : "/usuario");
  }, [pronto, usuario, router]);

  async function enviar(e) {
    e.preventDefault();
    setErroGeral("");
    const novos = {};
    if (!email.trim()) novos.email = "Informe seu e-mail.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) novos.email = "Digite um e-mail válido.";
    if (!senha) novos.senha = "Informe sua senha.";
    setErros(novos);
    if (Object.keys(novos).length) return;
    setEnviando(true);
    try {
      await login(email.trim(), senha, perfil, lembrar);
      router.replace(t.destino);
    } catch (err) {
      setErroGeral(err.message);
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-app lg:grid-cols-2">
      {/* METADE 1 — banner criado para o projeto */}
      <section className="relative hidden overflow-hidden bg-forest text-cream lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div aria-hidden className="absolute inset-0 scale-110 bg-cover bg-center opacity-45" style={{ backgroundImage: "url(/images/estufa-1.jpg)", filter: "blur(3px) saturate(1.1)" }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-forest/95 via-forest/80 to-olive/60" />
        {/* estrutura de estufa em linhas */}
        <svg aria-hidden viewBox="0 0 600 400" className="absolute -bottom-6 -right-10 w-[130%] max-w-none opacity-[.16]" fill="none" stroke="#FEFAE0" strokeWidth="2">
          <path d="M20 380V190L300 40l280 150v190" /><path d="M160 380V115M440 380V115M300 40v340M20 190h560M90 380V150M230 380V80M370 380V80M510 380V150" />
          <path d="M20 380h560" strokeWidth="3" />
        </svg>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} aria-hidden className="absolute rounded-[80%_0_80%_0] bg-leaf/40" style={{ left: `${12 + i * 15}%`, bottom: -20, width: 14 + i * 3, height: 14 + i * 3, "--dx": `${(i % 2 ? 1 : -1) * 40}px`, animation: `drift ${16 + i * 3}s linear ${-i * 4}s infinite` }} />
        ))}

        <Link href="/" aria-label="Greenly" className="relative"><img src="/images/logo-light.png" alt="Greenly" className="h-28 w-auto" /></Link>

        <div className="relative max-w-lg">
          <span className="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf"><Sparkles size={14} /> Cultive com inteligência</span>
          <h2 className="text-4xl font-extrabold leading-tight xl:text-5xl">{t.banner}</h2>
          <p className="mt-4 text-lg leading-relaxed text-cream/75">{t.bannerTxt}</p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {t.chips.map(([Icone, txt]) => (
              <li key={txt} className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"><Icone size={18} className="text-leaf" /> {txt}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs font-medium text-cream/50">A evolução do cultivo começa aqui.</p>
      </section>

      {/* METADE 2 — formulário */}
      <section className="relative flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <span className="w-10" />
          {/* botão de voltar centralizado no topo do formulário */}
          <Link href="/" className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-bold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Voltar para a escolha de acesso
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <img src="/images/logo-color.png" alt="Greenly" className="mx-auto mb-6 h-20 w-auto dark:hidden lg:hidden" />
          <img src="/images/logo-light.png" alt="Greenly" className="mx-auto mb-6 hidden h-20 w-auto dark:block dark:lg:hidden" />

          <h1 className="text-3xl font-extrabold text-ink">{t.titulo}</h1>
          <p className="mt-2 text-ink-2">{t.sub}</p>

          <form onSubmit={enviar} noValidate className="mt-8 space-y-5">
            {erroGeral && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-bad/40 bg-bad/10 p-3.5 text-sm font-semibold text-bad"><AlertCircle size={18} className="mt-0.5 shrink-0" /> {erroGeral}</div>
            )}
            <Field label="E-mail" error={erros.email}>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" />
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@greenly.com" className={`${inputCls} pl-11`} />
              </div>
            </Field>
            <Field label="Senha" error={erros.senha}>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" />
                <input type={ver ? "text" : "password"} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua senha" className={`${inputCls} pl-11 pr-12`} />
                <button type="button" onClick={() => setVer((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-2 hover:text-ink" aria-label={ver ? "Ocultar senha" : "Mostrar senha"}>{ver ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </Field>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink-2">
              <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" /> Manter conectado neste dispositivo
            </label>
            <Button type="submit" loading={enviando} className="w-full py-3.5 text-base">{enviando ? "Entrando..." : "Entrar"}</Button>
          </form>

          <button type="button" onClick={() => { setEmail(t.exemplo.email); setSenha(t.exemplo.senha); setErros({}); setErroGeral(""); }} className="mt-6 rounded-xl border border-dashed border-line p-3.5 text-left text-xs text-ink-2 transition hover:border-brand hover:bg-soft">
            <span className="block font-extrabold text-ink">Conta de demonstração</span>
            Clique para preencher: {t.exemplo.email} · {t.exemplo.senha}
          </button>
        </div>
      </section>
    </main>
  );
}
