"use client";
import Link from "next/link";
import { Plus, Sprout, Trash2, Timer } from "lucide-react";
import { useAuth, useToast } from "../../../components/Providers";
import { Carregando, StatusPill, Vazio } from "../../../components/ui";
import { AdminBanner } from "../../../components/AdminBanner";
import { FruitArt, tomCultura } from "../../../components/FruitArt";
import { useFetch } from "../../../components/useFetch";
import { api } from "../../../lib/api";
import { fmt } from "../../../lib/format";

export default function Estufas() {
  const { token } = useAuth();
  const toast = useToast();
  const { dados, carregando, erro, recarregar } = useFetch("/estufas");

  async function excluir(e) {
    if (!confirm(`Excluir a ${e.nome}? Essa ação não pode ser desfeita.`)) return;
    try { await api(`/estufas/${e.id}`, { method: "DELETE", token }); toast.ok("Estufa excluída."); recarregar(); }
    catch (err) { toast.erro(err.message); }
  }

  return (
    <>
      <AdminBanner
        variante="estufas"
        tag="ESTUFAS"
        titulo="Gerencie suas estufas com facilidade"
        texto="Monitore, controle e acompanhe o desenvolvimento das suas plantações."
      />
      <div className="flex justify-end">
        <Link href="/admin/estufas/nova" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-brand-ink transition hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-lg"><Plus size={16} /> Nova estufa</Link>
      </div>

      {erro && <p role="alert" className="rounded-xl bg-bad/10 p-4 text-sm font-bold text-bad">{erro}</p>}
      {carregando ? <Carregando /> : dados?.length === 0 ? <Vazio icone={Sprout} titulo="Nenhuma estufa cadastrada" texto="Clique em “Nova estufa” para começar." /> : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {dados?.map((e) => {
            const t = tomCultura(e.cultura);
            return (
              <article key={e.id} className="group overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow)] transition hover:-translate-y-1">
                <div className="flex h-40 items-center justify-center" style={{ background: `linear-gradient(135deg, ${t.fundo}, ${t.borda})` }}><FruitArt nome={e.cultura} size={104} fundo={false} className="transition-transform duration-300 group-hover:scale-110" /></div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2"><h3 className="text-2xl font-extrabold text-ink">{e.cultura}</h3><StatusPill status={e.status} /></div>
                  <p className="mt-1 text-sm font-semibold text-ink-2">Responsável: {e.responsaveis.length ? e.responsaveis.join(", ") : "—"}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 rounded-2xl bg-surface-2 p-4 text-sm">
                    <dt className="font-semibold text-ink-2">Umidade do solo</dt><dd className="text-right font-extrabold text-ink">{e.faixas.umidadeSolo.min}–{e.faixas.umidadeSolo.max}%</dd>
                    <dt className="font-semibold text-ink-2">Temperatura</dt><dd className="text-right font-extrabold text-ink">{e.faixas.temperatura.min}–{e.faixas.temperatura.max} °C</dd>
                    <dt className="font-semibold text-ink-2">Umidade do ar</dt><dd className="text-right font-extrabold text-ink">{e.faixas.umidadeAr.min}–{e.faixas.umidadeAr.max}%</dd>
                    <dt className="font-semibold text-ink-2">Luminosidade</dt><dd className="text-right font-extrabold text-ink">{fmt(e.faixas.luminosidade.min)}–{fmt(e.faixas.luminosidade.max)} lux</dd>
                    <dt className="flex items-center gap-1.5 font-semibold text-ink-2"><Timer size={14} /> Rega</dt><dd className="text-right font-extrabold text-ink">{e.regaMinutos} min/dia</dd>
                  </dl>
                  <div className="mt-5 flex items-center justify-between">
                    <Link href={`/admin/estufas/${e.id}`} className="text-sm font-extrabold text-brand hover:underline">Ver estufa ›</Link>
                    <button onClick={() => excluir(e)} className="rounded-xl p-2.5 text-ink-2 transition hover:bg-bad/10 hover:text-bad" aria-label={`Excluir ${e.nome}`}><Trash2 size={18} /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
