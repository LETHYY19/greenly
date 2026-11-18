// ============================================================
// Greenly — regras dos sensores (simulados) e utilitários
// Os dados (usuários, estufas, notificações...) ficam no MySQL.
// Aqui só ficam as funções que simulam as leituras de IoT.
// ============================================================
const crypto = require('crypto');

const hash = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

// Nomes, unidades e faixas padrão (cada estufa tem as suas faixas, definidas pelo administrador)
const FAIXAS = {
  temperatura: { min: 18, max: 28, unidade: '°C', nome: 'Temperatura' },
  umidadeAr: { min: 50, max: 80, unidade: '%', nome: 'Umidade do ar' },
  umidadeSolo: { min: 40, max: 70, unidade: '%', nome: 'Umidade do solo' },
  luminosidade: { min: 5000, max: 12000, unidade: ' lux', nome: 'Luminosidade' },
};

// ---------- leituras simuladas dos sensores (IoT) ----------
function ruido(seedNum, i) {
  const x = Math.sin(seedNum * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x); // 0..1 determinístico
}

function statusDe(chave, valor, faixa) {
  const f = faixa || FAIXAS[chave];
  if (valor >= f.min && valor <= f.max) return 'ideal';
  const margem = (f.max - f.min) * 0.15;
  if (valor >= f.min - margem && valor <= f.max + margem) return 'atencao';
  return 'critico';
}

const arred = (n, c = 1) => Math.round(n * 10 ** c) / 10 ** c;

function leituraEm(estufa, indice) {
  const out = {};
  for (const k of Object.keys(FAIXAS)) {
    const amp = k === 'luminosidade' ? 900 : k === 'temperatura' ? 1.6 : 4;
    const onda = Math.sin(indice / 2.2 + estufa.id) * amp * 0.7 + (ruido(estufa.id * 7 + k.length, indice) - 0.5) * amp;
    const v = estufa.base[k] + onda;
    out[k] = k === 'luminosidade' ? Math.round(v / 10) * 10 : arred(v, k === 'temperatura' ? 1 : 0);
  }
  return out;
}

function leituras(estufa) {
  const agoraIdx = Math.floor(Date.now() / 60000); // muda a cada minuto
  const atual = leituraEm(estufa, agoraIdx);
  const sensores = {};
  for (const k of Object.keys(FAIXAS)) {
    const faixa = (estufa.faixas && estufa.faixas[k]) || FAIXAS[k];
    sensores[k] = { valor: atual[k], status: statusDe(k, atual[k], faixa), ...FAIXAS[k], min: faixa.min, max: faixa.max };
  }
  const problemas = Object.entries(sensores).filter(([, s]) => s.status !== 'ideal').map(([k]) => k);
  const geral = problemas.some((k) => sensores[k].status === 'critico') ? 'critico' : problemas.length ? 'atencao' : 'ideal';

  // histórico: 12 pontos (de 2 em 2 horas nas últimas 24h)
  const base = Math.floor(Date.now() / 3600000);
  const historico = Array.from({ length: 12 }, (_, i) => {
    const horaIdx = base - (11 - i) * 2;
    const r = leituraEm(estufa, horaIdx * 7);
    const d = new Date((base - (11 - i) * 2) * 3600000);
    return { hora: `${String(d.getHours()).padStart(2, '0')}h`, ...r };
  });
  const agua = { valor: Math.round(estufa.area * (0.8 + ruido(estufa.id, new Date().getDate()) * 0.5)), unidade: 'L', nome: 'Água utilizada hoje' };
  // tempo de rega: ideal definido pelo administrador x o que já foi regado hoje (simulado)
  const ideal = estufa.regaMinutos || 20;
  const hoje = Math.round(ideal * (0.7 + ruido(estufa.id + 3, new Date().getDate()) * 0.4));
  const rega = { ideal, hoje, unidade: 'min', status: hoje >= ideal * 0.8 ? 'ideal' : 'atencao' };
  return { estufaId: estufa.id, atualizadoEm: new Date().toISOString(), sensores, status: geral, problemas, historico, agua, rega };
}

module.exports = { hash, FAIXAS, leituras, statusDe };
