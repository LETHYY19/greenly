"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, BarChart3, Bell, CheckCircle2, Droplet, FileText, Home, Leaf, LayoutDashboard, Users, Sprout, Timer, Cpu, ShieldCheck, Handshake, ChevronDown, Wifi, Recycle, Zap } from "lucide-react";
import { useAuth } from "../../components/Providers";
import { Shell } from "../../components/Shell";
import { Carousel } from "../../components/Carousel";
import { FruitPicker } from "../../components/FruitPicker";
import { FruitArt } from "../../components/FruitArt";
import { Stepper } from "../../components/Stepper";
import { MetricCard } from "../../components/Metrics";
import { WavePanel } from "../../components/WaveChart";
import { NotificationCards } from "../../components/NotificationCards";
import { useLeituras } from "../../components/useLeituras";
import { Card, Carregando, StatusPill, Vazio } from "../../components/ui";
import { api } from "../../lib/api";
import { montarProblemas } from "../../lib/alertas";
import { cn } from "../../lib/format";
import { ETAPAS, STATUS_GERAL, STATUS } from "../../lib/constants";

const ITENS = [
  { id: "inicio", rotulo: "Início", icone: Home },
  { id: "graficos", rotulo: "Gráficos", icone: BarChart3 },
  { id: "informacoes", rotulo: "Informações", icone: FileText },
  { id: "sobre", rotulo: "Sobre Nós", icone: Users },
  { id: "notificacoes", rotulo: "Notificações", icone: Bell },
];

const EQUIPE = [
  { nome: "Isabelly Gliber", area: "Frontend" }, { nome: "Leticia Carvalho", area: "Frontend" }, { nome: "Verônica Bezerra", area: "Frontend" },
  { nome: "Juliana Campos", area: "Backend" }, { nome: "Maria Stefanato", area: "Backend" }, { nome: "Vitória Bezerra", area: "Backend" },
];

function Secao({ id, children, className }) {
  return <section id={id} className={cn("scroll-mt-24", className)}>{children}</section>;
}

function Titulo({ icone: Icone, titulo, sub, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-brand"><Icone size={22} /></span>
        <div>
          <h2 className="text-2xl font-extrabold text-ink md:text-3xl">{titulo}</h2>
          {sub && <p className="mt-0.5 text-sm font-medium text-ink-2 md:text-base">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// banners do carrossel (imagens prontas em public/images)
const SLIDES = [
  { imagem: "/images/carrossel-1.jpg", alt: "Greenly — Estufas que impulsionam o seu cultivo" },
  { imagem: "/images/carrossel-2.jpg", alt: "Greenly — Do plantio à colheita, sempre um passo à frente" },
  { imagem: "/images/carrossel-3.jpg", alt: "Greenly — Estufas inteligentes para uma produção mais eficiente" },
];

function Pagina() {
  const { token } = useAuth();
  const [estufas, setEstufas] = useState(null);
  const [erro, setErro] = useState("");
  const [selecionada, setSelecionada] = useState(null);
  const [resumoAberto, setResumoAberto] = useState(false);
  const [ativo, setAtivo] = useState("inicio");
  const resumoRef = useRef(null);

  useEffect(() => {
    if (!token) return; // espera o login ser lido do navegador
    api("/estufas", { token })
      .then((lista) => { setEstufas(lista); setErro(""); })
      .catch((e) => setErro(e.message));
  }, [token]);

  const { dados, erro: erroLeitura } = useLeituras(selecionada, token);
  const estufa = estufas?.find((e) => e.id === selecionada) || null;

  const navegar = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // destaca no menu a seção que está na tela
  useEffect(() => {
    const els = ITENS.map((i) => document.getElementById(i.id)).filter(Boolean);
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => e.isIntersecting && setAtivo(e.target.id));
    }, { rootMargin: "-35% 0px -55% 0px" });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [estufas]);

  function escolher(id) {
    setSelecionada(id);
  }
  function abrirResumo() {
    const novo = !resumoAberto;
    setResumoAberto(novo);
    if (novo) setTimeout(() => resumoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  const problemas = montarProblemas(dados);
  const gravidade = problemas.some((p) => p.sensor.status === "critico") ? "critico" : "atencao";

  return (
    <Shell perfil="usuario" itens={ITENS} ativo={ativo} onNavegar={navegar} verTodas={() => navegar("notificacoes")}>
      <div className="overflow-x-clip"><div className="mx-auto max-w-[1240px] space-y-24 px-4 py-8 md:px-8 md:py-10">

        {/* ================= INÍCIO ================= */}
        <Secao id="inicio" className="space-y-10">
          <Carousel slides={SLIDES} />

          {/* Etapas da plantação (vem ANTES do resumo) */}
          <Card id="plantacoes" className="scroll-mt-24 !p-7 md:!p-9">
            <Titulo icone={Sprout} titulo="Etapas da sua plantação" sub="Escolha uma plantação e acompanhe o progresso do cultivo." />

            {erro && <p role="alert" className="rounded-xl bg-bad/10 p-4 text-sm font-bold text-bad">{erro}</p>}
            {!estufas && !erro && <Carregando texto="Carregando suas plantações..." />}
            {estufas && estufas.length === 0 && (
              <Vazio icone={Sprout} titulo="Nenhuma plantação liberada ainda" texto="O administrador define quais plantações você pode acompanhar. Assim que liberar, elas aparecem aqui." />
            )}
            {estufas && estufas.length > 0 && (
              <>
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-2">Plantações liberadas para você</p>
                  <FruitPicker estufas={estufas} selecionada={selecionada} onSelecionar={escolher} />
                </div>

                {!estufa ? (
                  <div className="mt-8 flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface-2 p-6 text-ink-2">
                    <Sprout size={28} className="shrink-0 text-brand" />
                    <p className="text-sm font-semibold md:text-base">Selecione uma plantação acima para ver as etapas do cultivo e abrir o resumo da estufa.</p>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-3 text-lg font-extrabold text-ink"><FruitArt nome={estufa.cultura} size={40} /> {estufa.cultura} — etapa {estufa.etapa + 1} de {ETAPAS.length}: <span className="text-brand">{ETAPAS[estufa.etapa]}</span></p>
                    </div>
                    <Stepper key={estufa.id} etapa={estufa.etapa} />

                    {/* botão bonito e clean que revela o resumo da estufa */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={abrirResumo}
                        aria-expanded={resumoAberto}
                        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-olive to-[#7E9A3E] px-8 py-4 text-base font-extrabold text-cream shadow-lg shadow-olive/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-olive/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf/50"
                      >
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,.28)_50%,transparent_70%)] bg-[length:200%_100%]" style={{ animation: "shimmer 3.4s linear infinite" }} />
                        <LayoutDashboard size={20} className="relative" />
                        <span className="relative">{resumoAberto ? "Ocultar resumo da estufa" : "Ver resumo da estufa"}</span>
                        <ChevronDown size={20} className={cn("relative transition-transform duration-300", resumoAberto && "rotate-180")} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Resumo da estufa (só aparece depois de selecionar a fruta e clicar no botão) */}
          {estufa && resumoAberto && (
            <div ref={resumoRef} className="anim-fade-up scroll-mt-24">
              <Card className="!p-7 md:!p-10">
                <Titulo icone={Leaf} titulo="Resumo da sua estufa" sub="Acompanhe as principais informações em tempo real.">
                  {dados && (
                    <span className={cn("inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-extrabold", STATUS[dados.status].classe)}>
                      <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: STATUS[dados.status].cor }} /><span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: STATUS[dados.status].cor }} /></span>
                      {STATUS_GERAL[dados.status]}
                    </span>
                  )}
                </Titulo>
                {!dados && !erroLeitura && <Carregando texto="Lendo os sensores..." />}
                {erroLeitura && <p role="alert" className="rounded-xl bg-bad/10 p-4 text-sm font-bold text-bad">{erroLeitura}</p>}
                {dados && (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                      {Object.entries(dados.sensores).map(([k, s]) => <MetricCard key={k} chave={k} sensor={s} historico={dados.historico} destaque={false} />)}
                    </div>
                    <p className="mt-5 text-right text-xs font-semibold text-ink-2">Atualizado às {new Date(dados.atualizadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · atualiza sozinho a cada 30 segundos</p>
                  </>
                )}
              </Card>
            </div>
          )}
        </Secao>

        {/* ================= GRÁFICOS ================= */}
        <Secao id="graficos">
          <Titulo icone={BarChart3} titulo="Gráficos" sub={estufa ? `Evolução dos sensores da plantação de ${estufa.cultura}.` : "Veja a evolução dos sensores da sua plantação."} />
          {!estufa ? (
            <SemSelecao estufas={estufas} selecionada={selecionada} onSelecionar={escolher} />
          ) : !dados ? <Carregando texto="Montando o gráfico..." /> : <WavePanel key={estufa.id} historico={dados.historico} />}
        </Secao>

        {/* ================= INFORMAÇÕES ================= */}
        <Secao id="informacoes">
          <Titulo icone={FileText} titulo="Informações das plantações" sub="Dados completos da plantação que você selecionou." />
          {!estufa ? (
            <SemSelecao estufas={estufas} selecionada={selecionada} onSelecionar={escolher} />
          ) : !dados ? <Carregando texto="Carregando informações..." /> : (
            <div className="space-y-6">
              <Card className="flex flex-wrap items-center gap-5 !p-6">
                <FruitArt nome={estufa.cultura} size={72} />
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-ink">{estufa.cultura}</h3>
                  <p className="text-sm font-semibold text-ink-2">Etapa atual: {ETAPAS[estufa.etapa]}</p>
                </div>
                <StatusPill status={dados.status} className="px-4 py-2 text-sm">{STATUS_GERAL[dados.status]}</StatusPill>
              </Card>

              {problemas.length > 0 ? (
                <div role="alert" className={cn("blink-alert rounded-3xl p-6 md:p-8", gravidade === "critico" ? "blink-critical" : "blink-warning")}>
                  <div className="flex items-start gap-4">
                    <span className="wiggle flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-cream" style={{ background: gravidade === "critico" ? "#D8362B" : "#E07A1F" }}><AlertTriangle size={30} /></span>
                    <div className="flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-[.2em]" style={{ color: gravidade === "critico" ? "#D8362B" : "#C2620F" }}>Aviso de atenção</p>
                      <h3 className="text-xl font-extrabold text-ink md:text-2xl">{problemas.length === 1 ? "Um item da sua estufa não está ideal" : `${problemas.length} itens da sua estufa não estão ideais`}</h3>
                      <ul className="mt-4 space-y-3">
                        {problemas.map((p) => (
                          <li key={p.chave} className="rounded-2xl bg-surface/80 p-4">
                            <p className="font-extrabold text-ink">{p.sensor.nome} {p.dir === "baixo" ? "abaixo" : "acima"} do ideal — {p.sensor.valor}{p.sensor.unidade} <span className="font-semibold text-ink-2">(ideal: {p.sensor.min}–{p.sensor.max}{p.sensor.unidade})</span></p>
                            <p className="mt-1 text-sm font-semibold text-ink-2">{p.dica}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-3xl border border-ok/40 bg-ok/10 p-6">
                  <CheckCircle2 size={34} className="shrink-0 text-ok" />
                  <div><p className="text-lg font-extrabold text-ink">Tudo dentro do ideal</p><p className="text-sm font-semibold text-ink-2">Temperatura, umidades e luminosidade estão nas faixas recomendadas.</p></div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Object.entries(dados.sensores).map(([k, s]) => <MetricCard key={k} chave={k} sensor={s} />)}
                <Card className="relative flex flex-col justify-between overflow-hidden !p-6">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4FA3A5]/15 text-[#3C8E90] dark:text-[#6CC4C6]"><Droplet size={24} /></span>
                  <div>
                    <p className="text-sm font-bold text-ink-2">Água utilizada hoje</p>
                    <p className="mt-1 text-4xl font-extrabold text-ink">{dados.agua.valor}<span className="ml-1 text-lg font-bold text-ink-2">L</span></p>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink-2">Total da irrigação registrada no dia.</p>
                </Card>
                <Card className="relative flex flex-col justify-between overflow-hidden !p-6">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sand/25 text-[#B9741F] dark:text-sand"><Timer size={24} /></span>
                  <div>
                    <p className="text-sm font-bold text-ink-2">Tempo de rega hoje</p>
                    <p className="mt-1 text-4xl font-extrabold text-ink">{dados.rega.hoje}<span className="ml-1 text-lg font-bold text-ink-2">min</span></p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill status={dados.rega.status} />
                    <span className="text-xs font-semibold text-ink-2">Ideal: {dados.rega.ideal} min por dia</span>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Secao>

        {/* ================= SOBRE NÓS (a seção mais chamativa) ================= */}
        <Secao id="sobre" className="relative left-1/2 w-screen -translate-x-1/2 lg:w-[calc(100vw-256px)]">
          <div className="relative overflow-hidden bg-forest py-16 md:py-24">
            <div aria-hidden className="absolute inset-0 scale-110 bg-cover bg-center" style={{ backgroundImage: "url(/images/sobre-estufa.jpg)", filter: "blur(2px) brightness(.55)" }} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/40 to-forest/90" />
            <div className="relative mx-auto max-w-[1240px] px-4 md:px-8">
              <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-[.3em] text-leaf">Quem somos</p>
              <h2 className="mx-auto mb-10 max-w-3xl text-center text-4xl font-extrabold text-cream md:text-5xl">Sobre nós</h2>

              <div className="mx-auto grid min-h-[560px] overflow-hidden rounded-[36px] bg-surface shadow-2xl shadow-black/40 lg:grid-cols-2">
                <div className="relative min-h-[320px]">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/images/sobre-estufa.jpg)" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-6 bottom-6 flex flex-wrap gap-3">
                    {[[Wifi, "IoT"], [Cpu, "Inteligência Artificial"], [Recycle, "Sustentabilidade"]].map(([I, t]) => (
                      <span key={t} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-cream"><I size={16} className="text-leaf" /> {t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <img src="/images/logo-color.png" alt="Greenly" className="mb-6 h-24 w-fit dark:hidden" />
                  <img src="/images/logo-light.png" alt="Greenly" className="mb-6 hidden h-24 w-fit dark:block" />
                  <h3 className="text-2xl font-extrabold text-ink md:text-3xl">A evolução do cultivo começa aqui</h3>
                  <p className="mt-4 text-base leading-relaxed text-ink-2 md:text-lg">
                    A GREENLY é uma plataforma inteligente de gerenciamento de estufas, que une tecnologia, sustentabilidade e praticidade para facilitar o cultivo de alimentos e plantas. Sensores instalados na estufa coletam temperatura, umidade do solo, umidade do ar e luminosidade e enviam tudo para o site, em gráficos e alertas.
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-ink-2 md:text-lg">Nosso objetivo é tornar a agricultura mais eficiente, organizada e acessível para todos.</p>

                  <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-extrabold">
                    {["IoT", "Inteligência Artificial", "Administrador", "Colaborador"].map((p, i, a) => (
                      <span key={p} className="flex items-center gap-2"><span className="rounded-full bg-soft px-3 py-1.5 text-brand">{p}</span>{i < a.length - 1 && <span className="text-ink-2">→</span>}</span>
                    ))}
                  </div>

                  <div className="mt-8">
                    <p className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-ink-2"><Handshake size={16} /> Equipe do projeto</p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {EQUIPE.map((m) => (
                        <li key={m.nome} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-4 py-2.5">
                          <span className="text-sm font-bold text-ink">{m.nome}</span>
                          <span className="text-[11px] font-extrabold uppercase text-brand">{m.area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-8 grid max-w-[1000px] gap-4 sm:grid-cols-3">
                {[[Zap, "Tecnologia", "Dados dos sensores em tempo real."], [Leaf, "Sustentabilidade", "Uso consciente de água e recursos."], [ShieldCheck, "Praticidade", "Tudo organizado em uma só plataforma."]].map(([I, t, d]) => (
                  <div key={t} className="glass rounded-3xl p-6 text-cream"><I size={26} className="text-leaf" /><p className="mt-3 text-lg font-extrabold">{t}</p><p className="text-sm text-cream/75">{d}</p></div>
                ))}
              </div>
            </div>
          </div>
        </Secao>

        {/* ================= NOTIFICAÇÕES ================= */}
        <Secao id="notificacoes" className="pb-10">
          <div className="mb-8 rounded-3xl bg-forest p-8 text-cream md:p-12">
            <p className="text-sm font-extrabold uppercase tracking-[.25em] text-leaf">Central de notificações</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Mensagens do Administrador</h2>
            <p className="mt-3 max-w-3xl text-base font-bold text-cream/90 md:text-lg">Todas as mensagens desta página são enviadas pelo administrador da estufa. Leia com atenção e siga as orientações.</p>
          </div>
          <NotificationCards />
          <p className="mt-8 rounded-2xl bg-soft p-5 text-center text-base font-bold text-ink">Em caso de dúvida sobre alguma orientação, fale diretamente com o administrador responsável pela sua estufa.</p>
        </Secao>
      </div></div>
    </Shell>
  );
}

function SemSelecao({ estufas, selecionada, onSelecionar }) {
  if (!estufas) return <Carregando />;
  if (estufas.length === 0) return <Vazio icone={Sprout} titulo="Nenhuma plantação liberada" texto="Quando o administrador liberar uma plantação para você, ela aparece aqui." />;
  return (
    <Vazio icone={Sprout} titulo="Escolha uma plantação" texto="Selecione abaixo a plantação que você quer visualizar.">
      <FruitPicker estufas={estufas} selecionada={selecionada} onSelecionar={onSelecionar} />
    </Vazio>
  );
}

export default Pagina;
