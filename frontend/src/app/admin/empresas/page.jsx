"use client";
import { useState } from "react";
import { Building2, CheckCircle2, Handshake, Mail, Package, Plus, Scale, Trash2 } from "lucide-react";
import { useAuth, useToast } from "../../../components/Providers";
import { Button, Carregando, Field, inputCls, Modal, Vazio } from "../../../components/ui";
import { AdminBanner } from "../../../components/AdminBanner";
import { Secao } from "../../../components/AdminUI";
import { useFetch } from "../../../components/useFetch";
import { FruitArt, tomCultura } from "../../../components/FruitArt";
import { api } from "../../../lib/api";
import { CULTURAS } from "../../../lib/constants";
import { cn, fmt } from "../../../lib/format";

const DISP = { Disponível: "bg-ok/15 text-ok", Reservado: "bg-warn/15 text-warn", "Em análise": "bg-[#4FA3A5]/15 text-[#2F7F81] dark:text-[#6CC4C6]" };
const QUAL = { A: "bg-ok text-white dark:text-forest", B: "bg-sand text-forest", C: "bg-clay text-cream" };
const FILTROS = ["Todos", "Disponível", "Reservado", "Em análise"];

export default function Empresas() {
  const { token } = useAuth();
  const toast = useToast();
  const { dados: empresas, recarregar: recEmp } = useFetch("/empresas");
  const { dados: lotes, carregando, recarregar: recLotes } = useFetch("/lotes");
  const [modal, setModal] = useState(null); // "empresa" | "lote"
  const [emp, setEmp] = useState({ nome: "", segmento: "", contato: "" });
  const [lote, setLote] = useState({ produto: "Laranja", quantidade: "", qualidade: "A", empresaId: "" });
  const [filtro, setFiltro] = useState("Todos");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const fechar = () => { setModal(null); setErro(""); };

  async function salvarEmpresa(e) {
    e.preventDefault(); setErro("");
    if (emp.nome.trim().length < 2) return setErro("Informe o nome da empresa.");
    if (!emp.segmento.trim()) return setErro("Informe o segmento (ex.: Indústria de sucos).");
    if (emp.contato && !/^\S+@\S+\.\S+$/.test(emp.contato)) return setErro("E-mail de contato inválido.");
    setEnviando(true);
    try { await api("/empresas", { method: "POST", token, body: emp }); toast.ok(`Empresa ${emp.nome} cadastrada!`); setEmp({ nome: "", segmento: "", contato: "" }); fechar(); recEmp(); }
    catch (err) { setErro(err.message); }
    setEnviando(false);
  }

  async function salvarLote(e) {
    e.preventDefault(); setErro("");
    if (!(Number(lote.quantidade) > 0)) return setErro("Informe a quantidade em kg.");
    setEnviando(true);
    try { await api("/lotes", { method: "POST", token, body: { produto: lote.produto, quantidade: Number(lote.quantidade), qualidade: lote.qualidade, empresaId: lote.empresaId ? Number(lote.empresaId) : undefined } }); toast.ok("Lote cadastrado!"); setLote({ produto: "Laranja", quantidade: "", qualidade: "A", empresaId: "" }); fechar(); recLotes(); recEmp(); }
    catch (err) { setErro(err.message); }
    setEnviando(false);
  }

  async function excluirLote(l) {
    if (!confirm(`Excluir o ${l.lote}?`)) return;
    try { await api(`/lotes/${l.id}`, { method: "DELETE", token }); toast.ok("Lote excluído."); recLotes(); recEmp(); } catch (err) { toast.erro(err.message); }
  }
  async function excluirEmpresa(e) {
    if (!confirm(`Excluir a empresa ${e.nome}?`)) return;
    try { await api(`/empresas/${e.id}`, { method: "DELETE", token }); toast.ok("Empresa excluída."); recEmp(); recLotes(); } catch (err) { toast.erro(err.message); }
  }

  const disp = lotes?.filter((l) => l.disponibilidade === "Disponível") || [];
  const kgDisp = disp.reduce((s, l) => s + l.quantidade, 0);
  const maior = Math.max(1, ...(lotes || []).map((l) => l.quantidade));
  const visiveis = (lotes || []).filter((l) => filtro === "Todos" || l.disponibilidade === filtro);

  const numeros = [[Package, "Lotes cadastrados", lotes?.length ?? "—"], [CheckCircle2, "Lotes disponíveis", disp.length], [Scale, "Total disponível", `${fmt(kgDisp)} kg`], [Handshake, "Empresas parceiras", empresas?.length ?? "—"]];

  return (
    <>
      <AdminBanner variante="empresas" titulo="Empresas — Produção e Comercialização" texto="Forneça lotes da estufa para indústrias de sucos, geleias e polpas.">
        <button onClick={() => { setErro(""); setModal("lote"); }} className="inline-flex items-center gap-2 rounded-xl bg-cream px-5 py-2.5 text-sm font-extrabold text-forest transition hover:-translate-y-0.5 hover:shadow-lg"><Plus size={16} /> Cadastrar lote</button>
      </AdminBanner>

      <div className="grid divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {numeros.map(([I, t, v]) => (
          <div key={t} className="flex items-center gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand/25 text-[#9A5F12] dark:text-sand"><I size={24} /></span>
            <div><p className="text-2xl font-extrabold text-ink">{v}</p><p className="text-sm font-bold text-ink-2">{t}</p></div>
          </div>
        ))}
      </div>

      {/* LOTES — a parte principal da página */}
      <Secao icone={Package} tom="sand" titulo="Lotes para comercialização" sub="Cada lote mostra produto, quantidade, qualidade, disponibilidade e a empresa de destino."
        acao={<div className="inline-flex flex-wrap rounded-2xl border border-line bg-surface-2 p-1" role="tablist">{FILTROS.map((x) => <button key={x} role="tab" aria-selected={filtro === x} onClick={() => setFiltro(x)} className={cn("rounded-xl px-4 py-2 text-sm font-extrabold transition", filtro === x ? "bg-brand text-brand-ink shadow" : "text-ink-2 hover:text-ink")}>{x}</button>)}</div>}>
        {carregando ? <Carregando /> : visiveis.length === 0 ? <Vazio icone={Package} titulo="Nenhum lote nesta lista" texto="Cadastre um lote ou mude o filtro." /> : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visiveis.map((l) => {
              const t = tomCultura(l.produto);
              return (
                <article key={l.id} className="group overflow-hidden rounded-3xl border border-line bg-surface-2 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-4 p-5" style={{ background: `linear-gradient(120deg, ${t.fundo}, ${t.borda}99)` }}>
                    <FruitArt nome={l.produto} size={64} fundo={false} />
                    <div className="min-w-0 flex-1"><h3 className="text-xl font-extrabold text-[#283618]">{l.produto}</h3><p className="text-sm font-bold text-[#283618]/70">{l.lote}</p></div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-extrabold", QUAL[l.qualidade])}>Qualidade {l.qualidade}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-3xl font-extrabold text-ink">{fmt(l.quantidade)}<span className="ml-1 text-base font-bold text-ink-2">kg</span></p>
                      <span className={cn("rounded-full px-3 py-1 text-xs font-extrabold", DISP[l.disponibilidade])}>{l.disponibilidade}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full rounded-full bg-gradient-to-r from-olive to-leaf" style={{ width: `${Math.max(8, (l.quantidade / maior) * 100)}%` }} /></div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                      <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink-2"><Building2 size={16} className="shrink-0" /><span className="truncate">{l.destino || "Ainda sem destino"}</span></p>
                      <button onClick={() => excluirLote(l)} className="rounded-xl p-2 text-ink-2 transition hover:bg-bad/10 hover:text-bad" aria-label={`Excluir ${l.lote}`}><Trash2 size={17} /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Secao>

      {/* EMPRESAS */}
      <Secao icone={Building2} tom="clay" titulo="Empresas compradoras" sub="Indústrias que recebem lotes de sucos, geleias e polpas."
        acao={<Button onClick={() => { setErro(""); setModal("empresa"); }}><Plus size={16} /> Nova empresa</Button>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {empresas?.map((e) => (
            <div key={e.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay/15 text-clay dark:text-[#E59A57]"><Building2 size={24} /></span>
              <div className="min-w-0 flex-1"><p className="truncate font-extrabold text-ink">{e.nome}</p><p className="truncate text-sm font-medium text-ink-2">{e.segmento}</p>{e.contato && <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-semibold text-ink-2"><Mail size={12} /> {e.contato}</p>}</div>
              <span className="rounded-full bg-ok/15 px-2.5 py-1 text-xs font-extrabold text-ok">{e.totalLotes} {e.totalLotes === 1 ? "lote" : "lotes"}</span>
              <button onClick={() => excluirEmpresa(e)} className="rounded-xl p-2 text-ink-2 hover:bg-bad/10 hover:text-bad" aria-label={`Excluir ${e.nome}`}><Trash2 size={17} /></button>
            </div>
          ))}
        </div>
      </Secao>

      <Modal aberto={modal === "empresa"} onClose={fechar} titulo="Nova empresa">
        <form onSubmit={salvarEmpresa} noValidate className="space-y-4">
          <Field label="Nome da empresa"><input className={inputCls} value={emp.nome} onChange={(e) => setEmp({ ...emp, nome: e.target.value })} placeholder="Ex.: Sucos Bom Gosto" /></Field>
          <Field label="Segmento"><input className={inputCls} value={emp.segmento} onChange={(e) => setEmp({ ...emp, segmento: e.target.value })} placeholder="Indústria de sucos" /></Field>
          <Field label="E-mail de contato"><input type="email" className={inputCls} value={emp.contato} onChange={(e) => setEmp({ ...emp, contato: e.target.value })} placeholder="compras@empresa.com" /></Field>
          {erro && <p role="alert" className="text-sm font-bold text-bad">{erro}</p>}
          <div className="flex gap-3"><Button type="submit" loading={enviando}>Cadastrar empresa</Button><Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button></div>
        </form>
      </Modal>

      <Modal aberto={modal === "lote"} onClose={fechar} titulo="Cadastrar lote">
        <form onSubmit={salvarLote} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Produto"><select className={inputCls} value={lote.produto} onChange={(e) => setLote({ ...lote, produto: e.target.value })}>{CULTURAS.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Quantidade (kg)"><input type="number" min="1" className={inputCls} value={lote.quantidade} onChange={(e) => setLote({ ...lote, quantidade: e.target.value })} placeholder="500" /></Field>
          <Field label="Qualidade"><select className={inputCls} value={lote.qualidade} onChange={(e) => setLote({ ...lote, qualidade: e.target.value })}><option value="A">Qualidade A</option><option value="B">Qualidade B</option><option value="C">Qualidade C</option></select></Field>
          <Field label="Empresa de destino"><select className={inputCls} value={lote.empresaId} onChange={(e) => setLote({ ...lote, empresaId: e.target.value })}><option value="">Ainda sem destino</option>{empresas?.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></Field>
          {erro && <p role="alert" className="text-sm font-bold text-bad sm:col-span-2">{erro}</p>}
          <div className="flex gap-3 sm:col-span-2"><Button type="submit" loading={enviando}>Cadastrar lote</Button><Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button></div>
        </form>
      </Modal>
    </>
  );
}
