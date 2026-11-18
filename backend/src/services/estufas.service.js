// Regras de negócio das estufas (validações e montagem da resposta)
const { leituras } = require('../store');
const { ok, num } = require('../utils/validacao');

// Monta a estufa para a resposta da API, com o status atual dos sensores
function comResumo(e, responsaveis) {
  const l = leituras(e);
  const { base, ...dados } = e; // 'base' é só da simulação dos sensores
  return { ...dados, responsaveis: responsaveis.get(e.id) || [], status: l.status, problemas: l.problemas, temperatura: l.sensores.temperatura.valor, umidadeSolo: l.sensores.umidadeSolo.valor };
}

function validarEstufa(b) {
  if (!ok(b.nome)) return 'Informe o nome da estufa.';
  if (!ok(b.cultura)) return 'Informe a cultura (ex.: Tomate).';
  if (!num(b.area) || b.area <= 0) return 'A área deve ser um número maior que zero.';
  return null;
}

// Faixas ideais (definidas pelo administrador) — o usuário vê exatamente os mesmos valores
const LIMITES = { temperatura: [-10, 60, 'Temperatura'], umidadeAr: [0, 100, 'Umidade do ar'], umidadeSolo: [0, 100, 'Umidade do solo'], luminosidade: [0, 200000, 'Luminosidade'] };

function validarFaixas(faixas, regaMinutos) {
  if (faixas !== undefined) {
    if (typeof faixas !== 'object' || faixas === null) return 'Faixas ideais inválidas.';
    for (const [k, [lo, hi, nome]] of Object.entries(LIMITES)) {
      const f = faixas[k];
      if (!f || !num(f.min) || !num(f.max)) return `Informe o mínimo e o máximo ideal de ${nome.toLowerCase()}.`;
      if (f.min >= f.max) return `Em ${nome.toLowerCase()}, o mínimo precisa ser menor que o máximo.`;
      if (f.min < lo || f.max > hi) return `${nome}: use valores entre ${lo} e ${hi}.`;
    }
  }
  if (regaMinutos !== undefined && (!num(regaMinutos) || regaMinutos < 1 || regaMinutos > 240)) return 'O tempo de rega deve ficar entre 1 e 240 minutos por dia.';
  return null;
}

const FAIXAS_PADRAO = () => ({ temperatura: { min: 18, max: 28 }, umidadeAr: { min: 50, max: 80 }, umidadeSolo: { min: 40, max: 70 }, luminosidade: { min: 5000, max: 12000 } });

module.exports = { comResumo, validarEstufa, validarFaixas, FAIXAS_PADRAO };
