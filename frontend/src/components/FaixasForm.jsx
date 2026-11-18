"use client";
import { Timer } from "lucide-react";
import { Field, inputCls } from "./ui";

export const SENSORES_FAIXA = [
  { chave: "umidadeSolo", rotulo: "Umidade do solo", unidade: "%", passo: 1 },
  { chave: "temperatura", rotulo: "Temperatura", unidade: "°C", passo: 0.5 },
  { chave: "umidadeAr", rotulo: "Umidade do ar", unidade: "%", passo: 1 },
  { chave: "luminosidade", rotulo: "Luminosidade", unidade: "lux", passo: 100 },
];

const PADRAO = { umidadeSolo: ["40", "70"], temperatura: ["18", "28"], umidadeAr: ["50", "80"], luminosidade: ["5000", "12000"] };

// monta o estado do formulário (tudo em texto) a partir de uma estufa — ou do padrão
export function faixasIniciais(estufa) {
  const f = {};
  for (const { chave } of SENSORES_FAIXA) {
    f[chave] = estufa?.faixas?.[chave] ? { min: String(estufa.faixas[chave].min), max: String(estufa.faixas[chave].max) } : { min: PADRAO[chave][0], max: PADRAO[chave][1] };
  }
  return { faixas: f, rega: String(estufa?.regaMinutos ?? 20) };
}

// valida no navegador e devolve números prontos para a API
export function lerFaixas(form) {
  const faixas = {};
  for (const { chave, rotulo } of SENSORES_FAIXA) {
    const min = Number(form.faixas[chave].min), max = Number(form.faixas[chave].max);
    if (form.faixas[chave].min === "" || form.faixas[chave].max === "" || Number.isNaN(min) || Number.isNaN(max)) return { erro: `Informe o mínimo e o máximo ideal de ${rotulo.toLowerCase()}.` };
    if (min >= max) return { erro: `Em ${rotulo.toLowerCase()}, o mínimo precisa ser menor que o máximo.` };
    faixas[chave] = { min, max };
  }
  const regaMinutos = Number(form.rega);
  if (!(regaMinutos >= 1 && regaMinutos <= 240)) return { erro: "O tempo de rega deve ficar entre 1 e 240 minutos por dia." };
  return { faixas, regaMinutos };
}

export function FaixasForm({ valor, onChange }) {
  const setFaixa = (chave, lado) => (e) => onChange({ ...valor, faixas: { ...valor.faixas, [chave]: { ...valor.faixas[chave], [lado]: e.target.value } } });
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {SENSORES_FAIXA.map((s) => (
          <fieldset key={s.chave} className="rounded-2xl border border-line bg-surface-2 p-4">
            <legend className="px-1 text-sm font-extrabold text-ink">{s.rotulo} ideal ({s.unidade})</legend>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Field label="Mínimo"><input type="number" step={s.passo} className={inputCls} value={valor.faixas[s.chave].min} onChange={setFaixa(s.chave, "min")} /></Field>
              <Field label="Máximo"><input type="number" step={s.passo} className={inputCls} value={valor.faixas[s.chave].max} onChange={setFaixa(s.chave, "max")} /></Field>
            </div>
          </fieldset>
        ))}
      </div>
      <fieldset className="rounded-2xl border border-line bg-surface-2 p-4">
        <legend className="flex items-center gap-2 px-1 text-sm font-extrabold text-ink"><Timer size={16} /> Tempo de rega</legend>
        <Field label="Minutos de rega por dia" hint="O colaborador vê esse tempo ideal e o quanto já foi regado hoje.">
          <input type="number" min="1" max="240" className={inputCls} value={valor.rega} onChange={(e) => onChange({ ...valor, rega: e.target.value })} />
        </Field>
      </fieldset>
      <p className="rounded-xl bg-soft px-4 py-3 text-sm font-bold text-ink">O usuário verá: umidade do solo ideal de {valor.faixas.umidadeSolo.min || "—"}% a {valor.faixas.umidadeSolo.max || "—"}%, temperatura de {valor.faixas.temperatura.min || "—"} a {valor.faixas.temperatura.max || "—"} °C, umidade do ar de {valor.faixas.umidadeAr.min || "—"}% a {valor.faixas.umidadeAr.max || "—"}%, luminosidade de {valor.faixas.luminosidade.min || "—"} a {valor.faixas.luminosidade.max || "—"} lux e rega de {valor.rega || "—"} min por dia.</p>
    </div>
  );
}
