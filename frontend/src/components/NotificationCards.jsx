"use client";
import { useState } from "react";
import { BellOff, CheckCheck, ShieldCheck, Sprout } from "lucide-react";
import { cn, tempoRelativo } from "../lib/format";
import { useNotificacoes } from "./Notifications";

const PRIORIDADE = {
  urgente: { rotulo: "Urgente", classe: "bg-bad/15 text-bad", barra: "bg-bad" },
  atencao: { rotulo: "Atenção", classe: "bg-warn/15 text-warn", barra: "bg-warn" },
  info: { rotulo: "Informativo", classe: "bg-[#4FA3A5]/15 text-[#3C8E90] dark:text-[#6CC4C6]", barra: "bg-[#4FA3A5]" },
  ok: { rotulo: "Tudo certo", classe: "bg-ok/15 text-ok", barra: "bg-ok" },
};

/* Lista GRANDE de notificações — todas enviadas pelo Administrador */
export function NotificationCards() {
  const { lista, naoLidas, marcarLida, marcarTodas, carregando } = useNotificacoes();
  const [filtro, setFiltro] = useState("todas");
  const mostrar = filtro === "nao" ? lista.filter((n) => !n.lida) : lista;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-2xl border border-line bg-surface p-1.5" role="tablist">
          {[["todas", `Todas (${lista.length})`], ["nao", `Não lidas (${naoLidas})`]].map(([id, rot]) => (
            <button key={id} role="tab" aria-selected={filtro === id} onClick={() => setFiltro(id)} className={cn("rounded-xl px-5 py-2.5 text-sm font-extrabold transition", filtro === id ? "bg-brand text-brand-ink shadow" : "text-ink-2 hover:text-ink")}>{rot}</button>
          ))}
        </div>
        <button onClick={marcarTodas} disabled={!naoLidas} className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-extrabold text-ink transition hover:border-brand hover:bg-soft disabled:opacity-40">
          <CheckCheck size={18} /> Marcar todas como lidas
        </button>
      </div>

      {carregando && <p className="py-10 text-center font-bold text-ink-2">Carregando mensagens...</p>}
      {!carregando && mostrar.length === 0 && (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface py-16 text-center">
          <BellOff size={36} className="text-ink-2" />
          <p className="mt-3 text-xl font-extrabold text-ink">{filtro === "nao" ? "Você está em dia!" : "Nenhuma mensagem ainda"}</p>
          <p className="mt-1 font-bold text-ink-2">{filtro === "nao" ? "Não há mensagens novas do administrador." : "Quando o administrador enviar um aviso, ele aparece aqui."}</p>
        </div>
      )}

      <ul className="space-y-5">
        {mostrar.map((n) => {
          const p = PRIORIDADE[n.prioridade] || PRIORIDADE.info;
          return (
            <li key={n.id}>
              <article className={cn("relative flex gap-5 overflow-hidden rounded-3xl border bg-surface p-6 shadow-[var(--shadow)] transition hover:-translate-y-0.5 md:p-8", n.lida ? "border-line" : "border-brand/50")}>
                <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", p.barra)} />
                <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest text-leaf sm:flex"><ShieldCheck size={32} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-1.5 text-xs font-extrabold text-cream"><ShieldCheck size={14} className="text-leaf" /> Enviado pelo Administrador</span>
                    <span className={cn("rounded-full px-3 py-1.5 text-xs font-extrabold", p.classe)}>{p.rotulo}</span>
                    {n.estufa && <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-xs font-extrabold text-brand"><Sprout size={14} /> {n.estufa}</span>}
                    {!n.lida && <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-cream">Nova</span>}
                    <span className="ml-auto text-sm font-bold text-ink-2">{tempoRelativo(n.criadaEm)}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-ink md:text-2xl">{n.titulo}</h3>
                  <p className="mt-2 text-base font-bold leading-relaxed text-ink-2 md:text-lg">{n.mensagem}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-sm font-bold text-ink-2">Mensagem do Administrador para {n.destinatario === "Todos os colaboradores" ? "todos os colaboradores" : "você"}</p>
                    {!n.lida && <button onClick={() => marcarLida(n.id)} className="rounded-xl bg-brand px-4 py-2 text-sm font-extrabold text-brand-ink transition hover:bg-brand-hover">Marcar como lida</button>}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
