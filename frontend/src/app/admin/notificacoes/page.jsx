"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Bot, Cpu, Send, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useAuth, useToast } from "../../../components/Providers";
import { Button, Field, inputCls } from "../../../components/ui";
import { AdminBanner } from "../../../components/AdminBanner";
import { Secao } from "../../../components/AdminUI";
import { useFetch } from "../../../components/useFetch";
import { useNotificacoes } from "../../../components/Notifications";
import { api } from "../../../lib/api";
import { cn, tempoRelativo } from "../../../lib/format";

const ACOES = ["Adicionar água", "Verificar umidade do solo", "Verificar temperatura", "Ajustar ventilação", "Ajustar luminosidade", "Realizar colheita", "Outra orientação"];
const PRIORIDADES = [["urgente", "Urgente", "bg-bad/15 text-bad border-bad"], ["atencao", "Atenção", "bg-warn/15 text-warn border-warn"], ["info", "Informativo", "bg-[#4FA3A5]/15 text-[#2F7F81] border-[#4FA3A5] dark:text-[#6CC4C6]"]];
const FLUXO = [[Cpu, "IoT", "Sensores coletam os dados"], [Bot, "Inteligência Artificial", "Analisa e gera o alerta"], [ShieldCheck, "Administrador", "Avalia e envia a orientação"], [UserRound, "Colaborador", "Realiza o cuidado na estufa"]];

export default function AdminNotificacoes() {
  const { token } = useAuth();
  const toast = useToast();
  const { lista, recarregar } = useNotificacoes();
  const { dados: estufas } = useFetch("/estufas");
  const { dados: colabs } = useFetch("/colaboradores");
  const [f, setF] = useState({ estufaId: "", destinatarioId: "todos", acao: ACOES[0], prioridade: "urgente", mensagem: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  // pré-preenche quando vem do alerta de uma estufa
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q.get("estufa") || q.get("acao")) setF((v) => ({ ...v, estufaId: q.get("estufa") || "", acao: q.get("acao") || v.acao }));
  }, []);

  // ao escolher a estufa, sugere o colaborador responsável
  useEffect(() => {
    if (!f.estufaId || !colabs) return;
    const c = colabs.find((x) => x.estufaIds.includes(Number(f.estufaId)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c) setF((v) => ({ ...v, destinatarioId: String(c.id) }));
  }, [f.estufaId, colabs]);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    if (f.mensagem.trim().length < 5) { setErro("Escreva a mensagem para o colaborador."); return; }
    setEnviando(true);
    try {
      await api("/notificacoes", { method: "POST", token, body: { titulo: f.acao, mensagem: f.mensagem, prioridade: f.prioridade, estufaId: f.estufaId ? Number(f.estufaId) : undefined, destinatarioId: f.destinatarioId === "todos" ? null : Number(f.destinatarioId) } });
      toast.ok("Notificação enviada ao colaborador!");
      setF((v) => ({ ...v, mensagem: "" }));
      recarregar();
    } catch (err) { setErro(err.message); toast.erro(err.message); }
    setEnviando(false);
  }

  // o admin clica em um alerta da IA e o formulário já vem preenchido para enviar ao colaborador
  function usarAlerta(n) {
    const t = n.titulo.toLowerCase();
    const acao = t.includes("solo") && t.includes("abaixo") ? "Adicionar água"
      : t.includes("água") ? "Adicionar água"
      : t.includes("solo") ? "Verificar umidade do solo"
      : t.includes("temperatura") ? "Verificar temperatura"
      : t.includes("umidade do ar") ? "Ajustar ventilação"
      : t.includes("luminosidade") ? "Ajustar luminosidade"
      : t.includes("colheita") ? "Realizar colheita" : "Outra orientação";
    setF((v) => ({ ...v, estufaId: n.estufaId ? String(n.estufaId) : "", acao, prioridade: n.prioridade === "ok" ? "info" : n.prioridade, mensagem: n.mensagem }));
    document.getElementById("form-mensagem")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function excluir(n) {
    try { await api(`/notificacoes/${n.id}`, { method: "DELETE", token }); toast.ok("Mensagem removida."); recarregar(); }
    catch (err) { toast.erro(err.message); }
  }

  const alertas = lista.filter((n) => n.tipo === "ia");
  const enviadas = lista.filter((n) => n.tipo === "adm");

  return (
    <>
      <AdminBanner
        variante="notificacoes"
        tag="NOTIFICAÇÕES"
        titulo="Fique por dentro de tudo"
        texto="Receba alertas e atualizações em tempo real sobre sua estufa."
      />

      {/* fluxo do alerta, em destaque e proporcional */}
      <section aria-label="Fluxo do alerta" className="grid gap-4 rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow)] sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
        {FLUXO.map(([I, t, d], i) => (
          <div key={t} className="contents">
            <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-soft text-brand"><I size={24} /></span>
              <div><p className="font-extrabold text-ink">{t}</p><p className="text-xs font-medium text-ink-2">{d}</p></div>
            </div>
            {i < FLUXO.length - 1 && <ArrowRight size={22} className="mx-auto hidden text-ink-2 lg:block" />}
          </div>
        ))}
      </section>

      <div className="grid items-stretch gap-8 xl:grid-cols-[1.35fr_1fr]">
        <Secao id="form-mensagem" icone={Send} tom="olive" titulo="Enviar mensagem ao colaborador" sub="O colaborador recebe como “Enviado pelo Administrador”." className="flex flex-col">
          <form onSubmit={enviar} noValidate className="grid flex-1 content-start gap-5 sm:grid-cols-2">
            <Field label="Estufa"><select className={inputCls} value={f.estufaId} onChange={set("estufaId")}><option value="">Todas / geral</option>{estufas?.map((e) => <option key={e.id} value={e.id}>{e.cultura}</option>)}</select></Field>
            <Field label="Colaborador"><select className={inputCls} value={f.destinatarioId} onChange={set("destinatarioId")}><option value="todos">Todos os colaboradores</option>{colabs?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></Field>
            <Field label="Ação necessária" className="sm:col-span-2"><select className={inputCls} value={f.acao} onChange={set("acao")}>{ACOES.map((a) => <option key={a}>{a}</option>)}</select></Field>
            <div className="sm:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-2">Prioridade</span>
              <div className="flex flex-wrap gap-2.5">{PRIORIDADES.map(([id, rot, cls]) => <button type="button" key={id} aria-pressed={f.prioridade === id} onClick={() => setF((v) => ({ ...v, prioridade: id }))} className={cn("rounded-full border-2 px-5 py-2 text-sm font-extrabold transition", f.prioridade === id ? cls : "border-line text-ink-2 hover:border-brand/50")}>{rot}</button>)}</div>
            </div>
            <Field label="Mensagem" className="sm:col-span-2"><textarea rows={8} className={inputCls} value={f.mensagem} onChange={set("mensagem")} placeholder="Ex.: A umidade do solo da estufa de Tomate está baixa. Verifique a irrigação e adicione água." /></Field>
            {erro && <p role="alert" className="text-sm font-bold text-bad sm:col-span-2">{erro}</p>}
            <div className="sm:col-span-2"><Button type="submit" loading={enviando} className="px-7 py-3.5 text-base"><Send size={18} /> Enviar notificação</Button></div>
          </form>
        </Secao>

        <div className="flex flex-col gap-8">
          <Secao icone={Bot} tom="sand" titulo="Alertas da IA" sub="A IA compara os sensores com as condições ideais de cada estufa e avisa aqui.">
            <ul className="space-y-3">
              {alertas.length === 0 && <li className="text-sm font-semibold text-ink-2">Nenhum alerta no momento.</li>}
              {alertas.map((n) => (
                <li key={n.id} className="flex items-start gap-4 rounded-2xl border border-line bg-surface-2 p-4">
                  <AlertTriangle size={22} className={n.prioridade === "urgente" ? "mt-0.5 shrink-0 text-bad" : n.prioridade === "atencao" ? "mt-0.5 shrink-0 text-warn" : "mt-0.5 shrink-0 text-ok"} />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-ink">{n.titulo}</p>
                    <p className="text-sm font-medium text-ink-2">{n.mensagem}</p>
                    <button type="button" onClick={() => usarAlerta(n)} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-extrabold text-brand-ink transition hover:bg-brand-hover"><Send size={15} /> Enviar ao colaborador</button>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-ink-2">{tempoRelativo(n.criadaEm)}</span>
                </li>
              ))}
            </ul>
          </Secao>
          <Secao icone={ShieldCheck} tom="sky" titulo="Mensagens enviadas" sub="Histórico das orientações ao colaborador." className="flex-1">
            <ul className="max-h-[360px] space-y-3 overflow-y-auto pr-1 scroll-slim">
              {enviadas.map((n) => (
                <li key={n.id} className="flex items-start gap-3 rounded-2xl border border-line p-4">
                  <div className="min-w-0 flex-1"><p className="font-extrabold text-ink">{n.titulo}</p><p className="text-xs font-semibold text-ink-2">Para: {n.destinatario} · {tempoRelativo(n.criadaEm)}</p><p className="mt-1.5 text-sm font-medium text-ink-2">{n.mensagem}</p></div>
                  <button onClick={() => excluir(n)} className="rounded-xl p-2 text-ink-2 hover:bg-bad/10 hover:text-bad" aria-label="Remover mensagem"><Trash2 size={17} /></button>
                </li>
              ))}
            </ul>
          </Secao>
        </div>
      </div>
    </>
  );
}
