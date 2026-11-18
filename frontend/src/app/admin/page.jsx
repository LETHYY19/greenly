"use client";
import { useRef, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Droplet, LayoutGrid, Timer, Activity } from "lucide-react";
import { useAuth } from "../../components/Providers";
import { Carregando, StatusPill, Vazio } from "../../components/ui";
import { AdminBanner } from "../../components/AdminBanner";
import { Aviso, Secao } from "../../components/AdminUI";
import { FruitArt } from "../../components/FruitArt";
import { MetricCard } from "../../components/Metrics";
import { useFetch } from "../../components/useFetch";
import { useLeituras } from "../../components/useLeituras";
import { useNotificacoes } from "../../components/Notifications";
import { montarProblemas } from "../../lib/alertas";
import { STATUS_GERAL } from "../../lib/constants";
import { cn, tempoRelativo } from "../../lib/format";

export default function AdminInicio() {
  const { token } = useAuth();
  const { dados: estufas, carregando } = useFetch("/estufas");
  const { lista } = useNotificacoes();
  const [sel, setSel] = useState(null);
  const { dados } = useLeituras(sel, token, 15000);
  const painel = useRef(null);
  const estufa = estufas?.find((e) => e.id === sel) || null;
  const problemas = montarProblemas(dados);
  const alertasIA = lista.filter((n) => n.tipo === "ia").slice(0, 4);

  // a visão geral NÃO muda de página: o detalhe abre aqui mesmo, no Início
  function escolher(id) {
    setSel((atual) => (atual === id ? null : id));
    setTimeout(() => painel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
  }

  return (
    <>
      <AdminBanner
        variante="inicio"
        tag="GREENLY"
        titulo="Tecnologia e natureza trabalhando juntas"
        texto="Gerencie suas plantações de forma inteligente, sustentável e eficiente."
      />

      <Secao centro icone={LayoutGrid} titulo="Visão geral das estufas" sub="Toque em uma estufa para ver os sensores aqui mesmo." tom="olive">
        {carregando ? <Carregando /> : !estufas?.length ? (
          <Vazio icone={LayoutGrid} titulo="Nenhuma estufa cadastrada" texto="Cadastre uma estufa no menu Estufas para acompanhá-la por aqui." />
        ) : (
          <div className="mx-auto grid max-w-[1000px] gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {estufas.map((e) => {
              const ativo = sel === e.id;
              const fora = e.problemas.length;
              return (
                <button
                  key={e.id}
                  onClick={() => escolher(e.id)}
                  aria-pressed={ativo}
                  className={cn("flex flex-col items-center rounded-3xl border-2 bg-surface-2 p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand", ativo ? "border-brand bg-soft shadow-lg" : "border-transparent")}
                >
                  <FruitArt nome={e.cultura} size={96} />
                  <p className="mt-4 text-2xl font-extrabold text-ink">{e.cultura}</p>
                  <div className="mt-2"><StatusPill status={e.status} /></div>
                  <p className="mt-3 text-sm font-semibold text-ink-2">{e.temperatura.toLocaleString("pt-BR")}°C · {e.umidadeSolo}% de umidade do solo</p>
                  <p className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold", fora ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok")}>
                    {fora ? <><AlertTriangle size={14} /> {fora} {fora === 1 ? "fator fora do ideal" : "fatores fora do ideal"}</> : <><CheckCircle2 size={14} /> Tudo no ideal</>}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </Secao>

      <div ref={painel} className="scroll-mt-24">
        {estufa && (
          <Secao icone={Activity} tom="leaf" titulo={estufa.nome} sub="Leituras dos sensores em tempo real." acao={dados && <StatusPill status={dados.status} className="px-4 py-2 text-sm">{STATUS_GERAL[dados.status]}</StatusPill>} className="anim-fade-up">
            {!dados ? <Carregando texto="Lendo os sensores..." /> : (
              <div className="space-y-6">
                {problemas.length > 0 ? (
                  <Aviso tipo={dados.status === "critico" ? "critico" : "atencao"} titulo={problemas.length === 1 ? "Um fator está fora do ideal" : `${problemas.length} fatores estão fora do ideal`}>
                    <ul className="space-y-2">
                      {problemas.map((p) => (
                        <li key={p.chave}>
                          <b className="text-ink">{p.sensor.nome} {p.dir === "baixo" ? "abaixo" : "acima"} do ideal:</b> {p.sensor.valor}{p.sensor.unidade} (ideal {p.sensor.min}–{p.sensor.max}{p.sensor.unidade}). {p.dica}
                        </li>
                      ))}
                    </ul>
                  </Aviso>
                ) : (
                  <Aviso tipo="ok" titulo="Tudo dentro do ideal">Temperatura, umidades e luminosidade estão nas faixas definidas no cadastro da estufa.</Aviso>
                )}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(dados.sensores).map(([k, s]) => <MetricCard key={k} chave={k} sensor={s} historico={dados.historico} destaque={false} />)}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand/25 text-[#9A5F12] dark:text-sand"><Timer size={24} /></span>
                    <div><p className="text-sm font-bold text-ink-2">Tempo de rega hoje</p><p className="text-2xl font-extrabold text-ink">{dados.rega.hoje} min <span className="text-sm font-bold text-ink-2">de {dados.rega.ideal} min ideais</span></p></div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4FA3A5]/15 text-[#2F7F81] dark:text-[#6CC4C6]"><Droplet size={24} /></span>
                    <div><p className="text-sm font-bold text-ink-2">Água utilizada hoje</p><p className="text-2xl font-extrabold text-ink">{dados.agua.valor} L</p></div>
                  </div>
                </div>
              </div>
            )}
          </Secao>
        )}
      </div>

      <Secao icone={Bot} tom="sand" titulo="Alertas da IA" sub="Gerados a partir da análise dos sensores.">
        <ul className="grid gap-4 md:grid-cols-2">
          {alertasIA.length === 0 && <li className="flex items-center gap-2 text-sm font-semibold text-ink-2"><CheckCircle2 size={18} className="text-ok" /> Nenhum alerta no momento.</li>}
          {alertasIA.map((n) => (
            <li key={n.id} className="flex items-start gap-4 rounded-2xl border border-line bg-surface-2 p-5">
              <AlertTriangle size={22} className={n.prioridade === "urgente" ? "mt-0.5 shrink-0 text-bad" : n.prioridade === "atencao" ? "mt-0.5 shrink-0 text-warn" : "mt-0.5 shrink-0 text-ok"} />
              <div className="min-w-0 flex-1"><p className="font-extrabold text-ink">{n.titulo}</p><p className="mt-0.5 text-sm font-medium text-ink-2">{n.mensagem}</p></div>
              <span className="shrink-0 text-xs font-bold text-ink-2">{tempoRelativo(n.criadaEm)}</span>
            </li>
          ))}
        </ul>
      </Secao>
    </>
  );
}
