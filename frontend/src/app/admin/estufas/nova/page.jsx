"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sprout, SlidersHorizontal } from "lucide-react";
import { useAuth, useToast } from "../../../../components/Providers";
import { Button, Carregando, Field, inputCls } from "../../../../components/ui";
import { AdminBanner } from "../../../../components/AdminBanner";
import { Secao } from "../../../../components/AdminUI";
import { FaixasForm, faixasIniciais, lerFaixas } from "../../../../components/FaixasForm";
import { useFetch } from "../../../../components/useFetch";
import { FruitArt, tomCultura } from "../../../../components/FruitArt";
import { api } from "../../../../lib/api";
import { CULTURAS } from "../../../../lib/constants";

export default function NovaEstufa() {
  const { token } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { dados: estufas, carregando, recarregar } = useFetch("/estufas");
  const { dados: colabs } = useFetch("/colaboradores");
  const [f, setF] = useState({ nome: "", cultura: "Tomate", area: "", localizacao: "", colaboradorId: "" });
  const [ideal, setIdeal] = useState(faixasIniciais());
  const [erros, setErros] = useState({});
  const [erroIdeal, setErroIdeal] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  async function salvar(e) {
    e.preventDefault();
    const n = {};
    if (!f.nome.trim()) n.nome = "Informe o nome da estufa.";
    if (!(Number(f.area) > 0)) n.area = "Informe a área em m².";
    setErros(n);
    const lido = lerFaixas(ideal);
    setErroIdeal(lido.erro || "");
    if (Object.keys(n).length || lido.erro) return;
    setEnviando(true);
    try {
      await api("/estufas", { method: "POST", token, body: { nome: f.nome, cultura: f.cultura, area: Number(f.area), localizacao: f.localizacao, faixas: lido.faixas, regaMinutos: lido.regaMinutos, colaboradorId: f.colaboradorId ? Number(f.colaboradorId) : undefined } });
      toast.ok("Estufa cadastrada com sucesso!");
      setF({ nome: "", cultura: "Tomate", area: "", localizacao: "", colaboradorId: "" });
      setIdeal(faixasIniciais());
      recarregar();
    } catch (err) { toast.erro(err.message); }
    setEnviando(false);
  }

  return (
    <>
      <AdminBanner variante="estufas" titulo="Cadastro de Estufas" texto="Registre uma nova estufa e defina as condições ideais: o colaborador vê exatamente esses valores." />
      <div className="grid items-start gap-8 xl:grid-cols-[1.5fr_1fr]">
        <form onSubmit={salvar} noValidate className="space-y-8">
          <Secao icone={Plus} tom="olive" titulo="Nova estufa" sub="Dados gerais da estufa.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome da estufa" error={erros.nome}><input className={inputCls} value={f.nome} onChange={set("nome")} placeholder="Estufa de Feijão" /></Field>
              <Field label="Área (m²)" error={erros.area}><input type="number" min="1" className={inputCls} value={f.area} onChange={set("area")} placeholder="120" /></Field>
              <Field label="Cultura"><select className={inputCls} value={f.cultura} onChange={set("cultura")}>{CULTURAS.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Localização"><input className={inputCls} value={f.localizacao} onChange={set("localizacao")} placeholder="Setor B" /></Field>
              <Field label="Colaborador responsável" className="sm:col-span-2"><select className={inputCls} value={f.colaboradorId} onChange={set("colaboradorId")}><option value="">Selecione...</option>{colabs?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></Field>
            </div>
          </Secao>

          <Secao icone={SlidersHorizontal} tom="sand" titulo="Condições ideais" sub="Umidade do solo, temperatura, umidade do ar, luminosidade e tempo de rega.">
            <FaixasForm valor={ideal} onChange={setIdeal} />
            {erroIdeal && <p role="alert" className="mt-4 text-sm font-bold text-bad">{erroIdeal}</p>}
          </Secao>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={enviando} className="px-7 py-3.5 text-base"><Plus size={18} /> Cadastrar estufa</Button>
            <Button type="button" variant="ghost" className="px-7 py-3.5 text-base" onClick={() => router.push("/admin/estufas")}>Ver todas as estufas</Button>
          </div>
        </form>

        <Secao icone={Sprout} tom="leaf" titulo="Estufas cadastradas" sub={estufas ? `${estufas.length} estufas no sistema` : "Carregando..."}>
          {carregando ? <Carregando /> : (
            <ul className="space-y-3">
              {estufas?.map((e) => { const t = tomCultura(e.cultura); return (
                <li key={e.id} className="flex items-center gap-4 rounded-2xl border border-line p-4" style={{ background: `linear-gradient(90deg, ${t.fundo}55, transparent)` }}>
                  <FruitArt nome={e.cultura} size={52} />
                  <div className="min-w-0 flex-1"><p className="font-extrabold text-ink">{e.nome}</p><p className="text-xs font-semibold text-ink-2">{e.area} m² · solo ideal {e.faixas.umidadeSolo.min}–{e.faixas.umidadeSolo.max}%</p></div>
                </li>
              ); })}
            </ul>
          )}
        </Secao>
      </div>
    </>
  );
}
