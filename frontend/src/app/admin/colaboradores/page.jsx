"use client";
import { useState } from "react";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useAuth, useToast } from "../../../components/Providers";
import { Button, Carregando, Field, inputCls, Vazio } from "../../../components/ui";
import { AdminBanner } from "../../../components/AdminBanner";
import { Avatar, Secao } from "../../../components/AdminUI";
import { useFetch } from "../../../components/useFetch";
import { FruitArt, tomCultura } from "../../../components/FruitArt";
import { api } from "../../../lib/api";
import { cn } from "../../../lib/format";

const VAZIO = { nome: "", email: "", telefone: "", cargo: "Colaborador da produção", senha: "", estufaIds: [] };

export default function Colaboradores() {
  const { token } = useAuth();
  const toast = useToast();
  const { dados: lista, carregando, recarregar } = useFetch("/colaboradores");
  const { dados: estufas } = useFetch("/estufas");
  const [f, setF] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const alternar = (id) => setF((v) => ({ ...v, estufaIds: v.estufaIds.includes(id) ? v.estufaIds.filter((x) => x !== id) : [...v.estufaIds, id] }));

  async function salvar(e) {
    e.preventDefault();
    const n = {};
    if (f.nome.trim().length < 3) n.nome = "Informe o nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) n.email = "Digite um e-mail válido.";
    if (f.senha.length < 6) n.senha = "Mínimo de 6 caracteres.";
    setErros(n);
    if (Object.keys(n).length) return;
    setEnviando(true);
    try {
      await api("/colaboradores", { method: "POST", token, body: f });
      toast.ok(`Colaborador ${f.nome.split(" ")[0]} cadastrado com sucesso!`);
      setF(VAZIO);
      recarregar();
    } catch (err) { toast.erro(err.message); }
    setEnviando(false);
  }

  async function excluir(c) {
    if (!confirm(`Excluir o colaborador ${c.nome}?`)) return;
    try { await api(`/colaboradores/${c.id}`, { method: "DELETE", token }); toast.ok("Colaborador excluído."); recarregar(); }
    catch (err) { toast.erro(err.message); }
  }

  return (
    <>
      <AdminBanner variante="colaboradores" titulo="Cadastro de Colaboradores" texto="Cadastre novos colaboradores e defina qual estufa ficará sob a responsabilidade de cada um." />

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <Secao icone={UserPlus} tom="olive" titulo="Novo colaborador" sub="Preencha as informações abaixo.">
          <form onSubmit={salvar} noValidate className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome completo" error={erros.nome}><input className={inputCls} value={f.nome} onChange={set("nome")} placeholder="Ex.: Maria Souza" /></Field>
            <Field label="E-mail" error={erros.email}><input type="email" className={inputCls} value={f.email} onChange={set("email")} placeholder="maria@greenly.com" /></Field>
            <Field label="Telefone"><input className={inputCls} value={f.telefone} onChange={set("telefone")} placeholder="(11) 98888-0000" /></Field>
            <Field label="Cargo"><select className={inputCls} value={f.cargo} onChange={set("cargo")}><option>Colaborador da produção</option><option>Supervisor de estufa</option><option>Auxiliar de manejo</option></select></Field>
            <div className="sm:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-2">Estufa responsável</span>
              <div className="flex flex-wrap gap-2.5">
                {estufas?.map((e) => {
                  const on = f.estufaIds.includes(e.id);
                  const tom = tomCultura(e.cultura);
                  return (
                    <button type="button" key={e.id} onClick={() => alternar(e.id)} aria-pressed={on}
                      className={cn("flex items-center gap-2 rounded-2xl border-2 px-3.5 py-2 text-sm font-extrabold text-ink transition", on ? "shadow-md" : "border-line bg-surface-2 hover:border-brand/50")}
                      style={on ? { background: tom.fundo, borderColor: tom.borda, color: "#283618" } : undefined}>
                      <FruitArt nome={e.cultura} size={26} fundo={false} /> Estufa de {e.cultura}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Senha provisória" error={erros.senha} className="sm:col-span-2"><input type="password" className={inputCls} value={f.senha} onChange={set("senha")} placeholder="••••••" /></Field>
            <div className="sm:col-span-2"><Button type="submit" loading={enviando} className="px-6 py-3"><UserPlus size={18} /> Cadastrar colaborador</Button></div>
          </form>
        </Secao>

        <Secao icone={Users} tom="sand" titulo="Colaboradores cadastrados" sub={lista ? `${lista.length} colaboradores ativos` : "Carregando..."}>
          {carregando ? <Carregando /> : lista?.length === 0 ? <Vazio icone={Users} titulo="Nenhum colaborador" texto="Cadastre o primeiro ao lado." /> : (
            <ul className="space-y-3">
              {lista?.map((c) => {
                const cult = c.estufaIds.map((id) => estufas?.find((x) => x.id === id)?.cultura).filter(Boolean);
                return (
                  <li key={c.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2 p-4">
                    <Avatar nome={c.nome} id={c.id} size={52} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-extrabold text-ink">{c.nome}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {cult.length === 0 && <span className="text-xs font-semibold text-ink-2">Sem estufa liberada</span>}
                        {cult.map((n) => { const t = tomCultura(n); return <span key={n} className="rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#283618]" style={{ background: t.fundo, border: `1px solid ${t.borda}` }}>Estufa de {n}</span>; })}
                      </div>
                    </div>
                    <span className="rounded-full bg-ok/15 px-3 py-1 text-xs font-extrabold text-ok">Ativo</span>
                    <button onClick={() => excluir(c)} className="rounded-xl p-2.5 text-ink-2 transition hover:bg-bad/10 hover:text-bad" aria-label={`Excluir ${c.nome}`}><Trash2 size={18} /></button>
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>
      </div>
    </>
  );
}
