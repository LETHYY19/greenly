"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Pencil, Send, SlidersHorizontal, Timer } from "lucide-react";
import { useAuth, useToast } from "../../../../components/Providers";
import { Button, Carregando, Modal, StatusPill } from "../../../../components/ui";
import { AdminBanner } from "../../../../components/AdminBanner";
import { Secao } from "../../../../components/AdminUI";
import { FaixasForm, faixasIniciais, lerFaixas, SENSORES_FAIXA } from "../../../../components/FaixasForm";
import { useFetch } from "../../../../components/useFetch";
import { useLeituras } from "../../../../components/useLeituras";
import { MetricCard } from "../../../../components/Metrics";
import { WavePanel } from "../../../../components/WaveChart";
import { FruitArt } from "../../../../components/FruitArt";
import { api } from "../../../../lib/api";
import { STATUS_GERAL } from "../../../../lib/constants";
import { fmt } from "../../../../lib/format";

const ACAO = { temperatura: "Verificar temperatura", umidadeAr: "Ajustar ventilação", umidadeSolo: "Adicionar água", luminosidade: "Ajustar luminosidade" };

export default function DetalheEstufa() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { token } = useAuth();
  const { dados: estufa, erro, recarregar } = useFetch(`/estufas/${id}`);
  const { dados } = useLeituras(id, token, 15000);
  const [dispensado, setDispensado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);

  if (erro) return <div className="space-y-4"><p role="alert" className="rounded-xl bg-bad/10 p-4 font-bold text-bad">{erro}</p><Link href="/admin/estufas" className="font-extrabold text-brand">← Voltar para as estufas</Link></div>;
  if (!estufa || !dados) return <Carregando texto="Lendo os sensores da estufa..." />;

  const problema = dados.problemas[0];
  const s = problema ? dados.sensores[problema] : null;
  const unid = (k) => (k === "temperatura" ? " °C" : k === "luminosidade" ? " lux" : "%");

  function abrirEdicao() { setForm(faixasIniciais(estufa)); setErroForm(""); setEditando(true); }
  async function salvarFaixas(e) {
    e.preventDefault();
    const lido = lerFaixas(form);
    if (lido.erro) { setErroForm(lido.erro); return; }
    setSalvando(true);
    try {
      await api(`/estufas/${estufa.id}`, { method: "PUT", token, body: { nome: estufa.nome, cultura: estufa.cultura, area: estufa.area, localizacao: estufa.localizacao, faixas: lido.faixas, regaMinutos: lido.regaMinutos } });
      toast.ok("Condições ideais atualizadas. O colaborador já vê os novos valores.");
      setEditando(false);
      recarregar();
    } catch (err) { setErroForm(err.message); }
    setSalvando(false);
  }

  return (
    <>
      <Link href="/admin/estufas" className="inline-flex items-center gap-2 text-sm font-extrabold text-brand hover:underline"><ArrowLeft size={16} /> Voltar para as estufas</Link>
      <AdminBanner variante="estufas" titulo={estufa.nome} texto={`Responsável: ${estufa.responsaveis.join(", ") || "—"} · ${estufa.area} m² · ${STATUS_GERAL[dados.status]}.`}>
        <span className="flex items-center gap-3 rounded-2xl bg-cream/10 px-4 py-2"><FruitArt nome={estufa.cultura} size={36} /><StatusPill status={dados.status}>{STATUS_GERAL[dados.status]}</StatusPill></span>
      </AdminBanner>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(dados.sensores).map(([k, v]) => <MetricCard key={k} chave={k} sensor={v} historico={dados.historico} destaque={false} />)}
      </div>

      <WavePanel historico={dados.historico} titulo={`Histórico — ${estufa.nome}`} />

      <Secao icone={SlidersHorizontal} tom="sand" titulo="Condições ideais" sub="Definidas no cadastro — o colaborador vê os mesmos valores." acao={<Button variant="ghost" onClick={abrirEdicao}><Pencil size={16} /> Ajustar</Button>}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {SENSORES_FAIXA.map((x) => (
            <div key={x.chave} className="rounded-2xl border border-line bg-surface-2 p-5">
              <p className="text-sm font-bold text-ink-2">{x.rotulo}</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{fmt(estufa.faixas[x.chave].min)} a {fmt(estufa.faixas[x.chave].max)}<span className="text-sm font-bold text-ink-2">{unid(x.chave)}</span></p>
            </div>
          ))}
          <div className="rounded-2xl border border-line bg-surface-2 p-5">
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink-2"><Timer size={14} /> Tempo de rega</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{estufa.regaMinutos}<span className="text-sm font-bold text-ink-2"> min/dia</span></p>
            <p className="mt-1 text-xs font-semibold text-ink-2">Hoje: {dados.rega.hoje} min</p>
          </div>
        </div>
      </Secao>

      <Modal aberto={editando} onClose={() => setEditando(false)} titulo="Ajustar condições ideais" largo>
        {form && (
          <form onSubmit={salvarFaixas} noValidate className="space-y-5">
            <FaixasForm valor={form} onChange={setForm} />
            {erroForm && <p role="alert" className="text-sm font-bold text-bad">{erroForm}</p>}
            <div className="flex gap-3"><Button type="submit" loading={salvando}>Salvar alterações</Button><Button type="button" variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button></div>
          </form>
        )}
      </Modal>

      {/* alerta gerado pela IA (sem animação, para poupar a vista) */}
      <Modal aberto={!!s && !dispensado && !editando} onClose={() => setDispensado(true)} titulo="Alerta da Inteligência Artificial">
        {s && (
          <div>
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-bad/15 text-bad"><AlertTriangle size={28} /></span>
              <div>
                <h4 className="text-2xl font-extrabold text-ink">{problema === "umidadeSolo" && s.valor < s.min ? "Falta de água" : `${s.nome} fora do ideal`}</h4>
                <p className="mt-2 text-sm font-medium leading-relaxed text-ink-2">{s.nome} da <b>{estufa.nome}</b> está em <b>{s.valor}{s.unidade}</b> (ideal: {s.min}–{s.max}{s.unidade}). Verifique se o sistema está funcionando corretamente.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => router.push(`/admin/notificacoes?estufa=${estufa.id}&acao=${encodeURIComponent(ACAO[problema])}`)}><Send size={16} /> Enviar aviso ao colaborador</Button>
              <Button variant="ghost" onClick={() => setDispensado(true)}>Dispensar</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
