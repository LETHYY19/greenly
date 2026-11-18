"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, ShieldCheck, User, X, CheckCheck } from "lucide-react";
import { useAuth } from "./Providers";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationsProvider, useNotificacoes } from "./Notifications";
import { cn, tempoRelativo } from "../lib/format";
import { Carregando } from "./ui";

/* ---------- Menu lateral (mesma estrutura do layout aprovado + a logo Greenly) ---------- */
function Sidebar({ itens, ativo, onNavegar, badge, aberto, onFechar }) {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const admin = usuario?.perfil === "admin";

  const itemCls = (a) => cn(
    "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition-all duration-200",
    a ? "bg-olive text-cream shadow-lg shadow-black/20" : "text-cream/75 hover:bg-cream/10 hover:text-cream"
  );

  const conteudo = (
    <div className="flex h-full flex-col bg-gradient-to-b from-forest to-[#1A2510] text-cream">
      <div className="flex items-center justify-between px-6 pb-4 pt-7">
        <Link href={admin ? "/admin" : "/usuario"} aria-label="Greenly — início">
          <img src="/images/logo-light.png" alt="Greenly" className="h-[88px] w-auto" />
        </Link>
        <button onClick={onFechar} className="rounded-lg p-2 text-cream/70 hover:bg-cream/10 lg:hidden" aria-label="Fechar menu"><X size={20} /></button>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1.5 px-4" aria-label="Menu principal">
        {itens.map(({ id, rotulo, icone: Icone, href }) => {
          const a = ativo === id;
          const inner = (
            <>
              <Icone size={20} />
              <span className="flex-1">{rotulo}</span>
              {id === "notificacoes" && badge > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-leaf px-1.5 text-xs font-extrabold text-forest">{badge}</span>
              )}
            </>
          );
          return href ? (
            <Link key={id} href={href} onClick={onFechar} className={itemCls(a)} aria-current={a ? "page" : undefined}>{inner}</Link>
          ) : (
            <button key={id} onClick={() => { onNavegar(id); onFechar(); }} className={itemCls(a)} aria-current={a ? "page" : undefined}>{inner}</button>
          );
        })}
      </nav>

      <div className="border-t border-cream/10 p-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CDE0B4] text-forest ring-2 ring-leaf/60">{admin ? <ShieldCheck size={20} /> : <User size={20} />}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold">{usuario?.nome}</p>
            <p className="text-xs text-cream/60">{admin ? "Administrador" : "Usuário"}</p>
          </div>
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            className="rounded-lg p-2 text-cream/70 transition hover:bg-cream/10 hover:text-cream"
            aria-label="Sair"
            title="Sair"
          ><LogOut size={18} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{conteudo}</aside>
      {/* versão celular: menu que desliza */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", aberto ? "" : "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-black/50 transition-opacity", aberto ? "opacity-100" : "opacity-0")} onClick={onFechar} />
        <aside className={cn("absolute inset-y-0 left-0 w-72 transition-transform duration-300", aberto ? "translate-x-0" : "-translate-x-full")}>{conteudo}</aside>
      </div>
    </>
  );
}

/* ---------- Sino de notificações (funcional) ---------- */
function Sino({ verTodas }) {
  const { lista, naoLidas, marcarLida, marcarTodas } = useNotificacoes();
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => ref.current && !ref.current.contains(e.target) && setAberto(false);
    const esc = (e) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", fora); document.removeEventListener("keydown", esc); };
  }, [aberto]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((a) => !a)}
        aria-label={`Notificações${naoLidas ? `, ${naoLidas} não lidas` : ""}`}
        aria-expanded={aberto}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 transition hover:bg-soft hover:text-ink"
      >
        <Bell size={20} className={naoLidas > 0 ? "wiggle" : ""} />
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clay px-1 text-[10px] font-extrabold text-cream ring-2 ring-surface">{naoLidas}</span>
        )}
      </button>

      {aberto && (
        <div className="anim-pop absolute right-0 top-12 z-50 w-[min(92vw,400px)] origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-extrabold text-ink">Notificações {naoLidas > 0 && <span className="ml-1 rounded-full bg-clay px-2 py-0.5 text-xs text-cream">{naoLidas}</span>}</p>
            <button onClick={marcarTodas} disabled={!naoLidas} className="flex items-center gap-1 text-xs font-bold text-brand disabled:opacity-40"><CheckCheck size={14} /> Marcar todas como lidas</button>
          </div>
          <ul className="scroll-slim max-h-[360px] overflow-y-auto">
            {lista.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-2">Nenhuma notificação por enquanto.</li>}
            {lista.slice(0, 6).map((n) => (
              <li key={n.id}>
                <button onClick={() => marcarLida(n.id)} className={cn("flex w-full gap-3 border-b border-line px-4 py-3 text-left transition hover:bg-soft", !n.lida && "bg-soft/60")}>
                  <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", n.lida ? "bg-transparent" : "bg-clay")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{n.titulo}</span>
                    <span className="line-clamp-2 text-xs text-ink-2">{n.mensagem}</span>
                    <span className="mt-1 block text-[11px] font-semibold text-ink-2/80">{n.remetente} · {tempoRelativo(n.criadaEm)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => { setAberto(false); verTodas(); }} className="w-full px-4 py-3 text-center text-sm font-extrabold text-brand transition hover:bg-soft">Ver todas →</button>
        </div>
      )}
    </div>
  );
}

function Topbar({ onMenu, verTodas, comSino }) {
  const { usuario } = useAuth();
  const admin = usuario?.perfil === "admin";
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-xl md:px-8">
      <button onClick={onMenu} className="rounded-xl p-2 text-ink hover:bg-soft lg:hidden" aria-label="Abrir menu"><Menu size={22} /></button>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        {comSino && <Sino verTodas={verTodas} />}
        <ThemeToggle />
        <div className={cn("flex items-center gap-3", comSino && "ml-2 border-l border-line pl-4")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-brand">{admin ? <ShieldCheck size={20} /> : <User size={20} />}</span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-bold text-ink">{usuario?.nome}</p>
            <p className="text-xs text-ink-2">{admin ? "Administrador" : "Usuário"}</p>
          </div>
          <ChevronDown size={16} className="hidden text-ink-2 sm:block" />
        </div>
      </div>
    </header>
  );
}

/* ---------- Casca da página: protege a rota e junta menu + topo ---------- */
export function Shell({ perfil, itens, ativo, onNavegar, verTodas, avisos = true, children }) {
  const { usuario, pronto } = useAuth();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!pronto) return;
    if (!usuario) router.replace(`/login/${perfil}`);
    else if (usuario.perfil !== perfil) router.replace(usuario.perfil === "admin" ? "/admin" : "/usuario");
  }, [pronto, usuario, perfil, router]);

  if (!pronto || !usuario || usuario.perfil !== perfil) {
    return <div className="flex min-h-screen items-center justify-center bg-app"><Carregando texto="Verificando acesso..." /></div>;
  }

  return (
    <NotificationsProvider>
      <ShellInner itens={itens} ativo={ativo} onNavegar={onNavegar} verTodas={verTodas} avisos={avisos} menu={menu} setMenu={setMenu}>{children}</ShellInner>
    </NotificationsProvider>
  );
}

function ShellInner({ itens, ativo, onNavegar, verTodas, avisos, menu, setMenu, children }) {
  const { naoLidas } = useNotificacoes();
  return (
    <div className="min-h-screen bg-app">
      <Sidebar itens={itens} ativo={ativo} onNavegar={onNavegar} badge={avisos ? naoLidas : 0} aberto={menu} onFechar={() => setMenu(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setMenu(true)} verTodas={verTodas} comSino={avisos} />
        <main>{children}</main>
      </div>
    </div>
  );
}
