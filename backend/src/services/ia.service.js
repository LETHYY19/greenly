// ============================================================
// IA do Greenly
//
// 1) APRENDER: quando o admin cadastra (ou altera) uma estufa, a IA recebe as
//    "Condições ideais" dela, gera orientações para cada situação e GUARDA tudo
//    no banco (tabela ia_perfis).
// 2) MONITORAR: a cada 1 minuto compara as leituras dos sensores (IoT) com as
//    condições ideais. Se algum valor ficar ABAIXO do mínimo ou ACIMA do máximo,
//    a IA escreve um alerta e ele aparece em Notificações do admin, no card
//    "Alertas da IA". O admin então envia a orientação ao colaborador.
//
// A IA "de verdade" (Gemini, Claude ou ChatGPT) é ligada no arquivo .env
// (IA_PROVEDOR e IA_API_KEY). Sem chave, o sistema continua funcionando com
// textos prontos, sem chamar nenhuma IA externa.
// ============================================================
const repo = require('../repo');
const { leituras } = require('../store');

const NOME_REMETENTE = 'Inteligência Artificial';

// ---------- configuração (lida do .env a cada uso) ----------
const cfg = () => {
  const provedor = (process.env.IA_PROVEDOR || '').trim().toLowerCase();
  const modelos = { gemini: 'gemini-4-hydrogen', claude: 'claude-haiku-5-5', openai: 'gpt-5-mini' };
  return {
    provedor: modelos[provedor] ? provedor : '',
    chave: (process.env.IA_API_KEY || '').trim(),
    modelo: (process.env.IA_MODELO || '').trim() || modelos[provedor] || '',
    intervaloSeg: Math.max(10, Number(process.env.IA_INTERVALO_SEGUNDOS) || 60),
    repetirMin: Math.max(1, Number(process.env.IA_REPETIR_MINUTOS) || 60),
  };
};
const iaExternaAtiva = () => { const c = cfg(); return !!(c.provedor && c.chave); };

// ---------- textos padrão (usados quando a IA externa não está ligada ou falha) ----------
const ORIENTACOES_PADRAO = {
  temperatura: { baixo: 'Verifique o fechamento da estufa e o aquecimento.', alto: 'Abra a ventilação ou acione o ventilador para renovar o ar.' },
  umidadeAr: { baixo: 'Aumente a umidificação do ambiente.', alto: 'Melhore a ventilação para evitar fungos.' },
  umidadeSolo: { baixo: 'Verifique se a irrigação está funcionando corretamente e adicione água.', alto: 'Reduza a irrigação para evitar encharcamento.' },
  luminosidade: { baixo: 'Verifique sombreamento excessivo ou use iluminação complementar.', alto: 'Considere usar tela de sombreamento.' },
};
const CHAVES = Object.keys(ORIENTACOES_PADRAO);

// ---------- estado do monitor (para o /ia/status) ----------
const estado = { rodando: false, analisando: false, ultimaAnalise: null, ultimosAlertas: 0, ultimoErro: '', ultimoErroEm: null };

// ============================================================
// Conversa com a IA externa (usa o fetch do próprio Node)
// ============================================================
async function chamarIA(prompt, { json = false } = {}) {
  const { provedor, chave, modelo } = cfg();
  if (!provedor || !chave) throw new Error('IA externa não configurada (defina IA_PROVEDOR e IA_API_KEY no .env).');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    let url, headers, body, extrair;
    if (provedor === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;
      headers = { 'Content-Type': 'application/json', 'x-goog-api-key': chave };
      body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: 'application/json' } : {}) } };
      extrair = (d) => (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    } else if (provedor === 'claude') {
      url = 'https://api.anthropic.com/v1/messages';
      headers = { 'Content-Type': 'application/json', 'x-api-key': chave, 'anthropic-version': '2023-06-01' };
      body = { model: modelo, max_tokens: 900, temperature: 0.2, messages: [{ role: 'user', content: prompt }] };
      extrair = (d) => (d.content || []).map((p) => p.text || '').join('');
    } else {
      url = 'https://api.openai.com/v1/chat/completions';
      headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${chave}` };
      body = { model: modelo, messages: [{ role: 'user', content: prompt }], ...(json ? { response_format: { type: 'json_object' } } : {}) };
      extrair = (d) => d.choices?.[0]?.message?.content || '';
    }
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: ctrl.signal });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok) {
      const motivo = dados.error?.message || dados.message || `HTTP ${res.status}`;
      throw new Error(`${provedor}: ${motivo}${res.status === 404 ? ' (confira o nome do modelo em IA_MODELO)' : ''}`);
    }
    const texto = String(extrair(dados) || '').trim();
    if (!texto) throw new Error(`${provedor}: resposta vazia`);
    return texto;
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'A IA demorou demais para responder.' : e.message);
  } finally {
    clearTimeout(timer);
  }
}

function registrarErro(e) {
  if (estado.ultimoErro !== e.message) console.warn(`[IA] ${e.message} — usando o texto padrão.`);
  estado.ultimoErro = e.message;
  estado.ultimoErroEm = new Date().toISOString();
}

// Extrai o JSON da resposta (a IA às vezes devolve dentro de ```json ... ```)
function lerJSON(texto) {
  const limpo = texto.replace(/```json|```/gi, '');
  const i = limpo.indexOf('{'), f = limpo.lastIndexOf('}');
  if (i === -1 || f === -1) throw new Error('A IA não devolveu um JSON válido.');
  return JSON.parse(limpo.slice(i, f + 1));
}

const un = (s) => s.unidade.trim();
const fmtFaixa = (f, u) => `${f.min} a ${f.max}${u}`;

// ============================================================
// 1) APRENDER as condições ideais de uma estufa
// ============================================================
async function aprenderEstufa(estufa) {
  const f = estufa.faixas;
  let perfil = { resumo: `Monitorar ${estufa.cultura} mantendo todos os sensores dentro das faixas ideais.`, orientacoes: ORIENTACOES_PADRAO, fonte: 'padrao', modelo: '' };

  if (iaExternaAtiva()) {
    const prompt = `Você é um engenheiro agrônomo especialista em cultivo protegido (estufas).
Cultura: ${estufa.cultura}. Estufa: ${estufa.nome}.
Condições ideais definidas pelo administrador:
- Temperatura: ${fmtFaixa(f.temperatura, ' °C')}
- Umidade do ar: ${fmtFaixa(f.umidadeAr, '%')}
- Umidade do solo: ${fmtFaixa(f.umidadeSolo, '%')}
- Luminosidade: ${fmtFaixa(f.luminosidade, ' lux')}
- Tempo de rega: ${estufa.regaMinutos} minutos por dia
Responda APENAS com um JSON válido (sem texto antes ou depois) neste formato:
{"resumo":"uma frase sobre o que mais importa monitorar nessa cultura","orientacoes":{"temperatura":{"baixo":"...","alto":"..."},"umidadeAr":{"baixo":"...","alto":"..."},"umidadeSolo":{"baixo":"...","alto":"..."},"luminosidade":{"baixo":"...","alto":"..."}}}
Cada orientação: português do Brasil, prática, objetiva, no máximo 140 caracteres, dizendo o que fazer quando o valor ficar abaixo do mínimo ("baixo") ou acima do máximo ("alto").`;
    try {
      const dados = lerJSON(await chamarIA(prompt, { json: true }));
      const orient = {};
      for (const k of CHAVES) {
        orient[k] = {
          baixo: String(dados.orientacoes?.[k]?.baixo || ORIENTACOES_PADRAO[k].baixo).slice(0, 220),
          alto: String(dados.orientacoes?.[k]?.alto || ORIENTACOES_PADRAO[k].alto).slice(0, 220),
        };
      }
      perfil = { resumo: String(dados.resumo || perfil.resumo).slice(0, 300), orientacoes: orient, fonte: cfg().provedor, modelo: cfg().modelo };
      estado.ultimoErro = '';
    } catch (e) {
      registrarErro(e);
    }
  }
  await repo.salvarPerfilIA(estufa.id, perfil);
  return perfil;
}

// Estufas que ainda não têm perfil guardado (ex.: as de exemplo, na primeira execução)
async function aprenderPendentes() {
  const estufas = await repo.listarEstufas({ perfil: 'admin' });
  const jaTem = new Set(await repo.estufaIdsComPerfilIA());
  for (const e of estufas) if (!jaTem.has(e.id)) await aprenderEstufa(e);
}

// ============================================================
// 2) MONITORAR: compara sensores x condições ideais e gera alertas
// ============================================================
async function escreverAlerta({ estufa, sensor, dir, orientacao }) {
  const padrao = `${sensor.nome} da ${estufa.nome} está em ${sensor.valor}${sensor.unidade}, ${dir === 'baixo' ? 'abaixo do mínimo' : 'acima do máximo'} (ideal: ${sensor.min} a ${sensor.max}${sensor.unidade}). ${orientacao}`;
  if (!iaExternaAtiva()) return padrao;
  const prompt = `Você é a IA de monitoramento do Greenly, um sistema de estufas inteligentes.
Escreva um alerta curto para o ADMINISTRADOR: no máximo 2 frases, português do Brasil, tom profissional e direto, sem emojis e sem markdown.
Dados: estufa "${estufa.nome}" (cultura: ${estufa.cultura}); sensor: ${sensor.nome}; valor atual: ${sensor.valor}${sensor.unidade}; faixa ideal: ${sensor.min} a ${sensor.max}${sensor.unidade} (valor ${dir === 'baixo' ? 'ABAIXO do mínimo' : 'ACIMA do máximo'}).
Orientação já conhecida para este caso: ${orientacao}
O alerta deve citar o valor atual, a faixa ideal e a ação recomendada.`;
  try {
    const texto = (await chamarIA(prompt)).replace(/\s+/g, ' ').trim();
    estado.ultimoErro = '';
    return texto.slice(0, 380);
  } catch (e) {
    registrarErro(e);
    return padrao;
  }
}

async function analisarEstufas() {
  if (estado.analisando) return [];
  estado.analisando = true;
  const novos = [];
  try {
    const { repetirMin } = cfg();
    const estufas = await repo.listarEstufas({ perfil: 'admin' });
    for (const e of estufas) {
      const leitura = leituras(e); // ← aqui entram as leituras do IoT (hoje simuladas pelo backend)
      for (const chave of leitura.problemas) {
        const s = leitura.sensores[chave];
        const dir = s.valor < s.min ? 'baixo' : 'alto';
        const titulo = `${s.nome} ${dir === 'baixo' ? 'abaixo' : 'acima'} do ideal — ${e.cultura}`;
        if (await repo.existeAlertaIARecente(e.id, titulo, repetirMin)) continue; // já avisado há pouco
        const perfil = await repo.buscarPerfilIA(e.id);
        const orientacao = perfil?.orientacoes?.[chave]?.[dir] || ORIENTACOES_PADRAO[chave][dir];
        const mensagem = await escreverAlerta({ estufa: e, sensor: s, dir, orientacao });
        const id = await repo.criarAlertaIA({ estufaId: e.id, titulo, mensagem, prioridade: s.status === 'critico' ? 'urgente' : 'atencao' });
        novos.push({ id, estufa: e.cultura, sensor: chave, titulo, mensagem });
      }
    }
    estado.ultimosAlertas = novos.length;
    estado.ultimaAnalise = new Date().toISOString();
  } finally {
    estado.analisando = false;
  }
  return novos;
}

// Liga o monitor (chamado pelo server.js): analisa já e depois a cada 1 minuto
function iniciarMonitor() {
  if (estado.rodando) return;
  estado.rodando = true;
  const { intervaloSeg } = cfg();
  console.log(iaExternaAtiva() ? `[IA] Ativa: ${cfg().provedor} (${cfg().modelo}). Analisando as estufas a cada ${intervaloSeg}s.` : `[IA] Sem chave de IA no .env: usando textos padrão. Analisando as estufas a cada ${intervaloSeg}s.`);
  const rodar = () => analisarEstufas().catch((e) => console.error('[IA] erro ao analisar:', e.message));
  aprenderPendentes().catch((e) => console.error('[IA] erro ao aprender estufas:', e.message)).finally(rodar);
  setInterval(rodar, intervaloSeg * 1000).unref();
}

// ---------- usados pelo controller ----------
function status() {
  const c = cfg();
  return { iaExterna: iaExternaAtiva(), provedor: c.provedor || null, modelo: c.modelo || null, intervaloSegundos: c.intervaloSeg, repetirAlertaMinutos: c.repetirMin, ...estado };
}
async function testarConexao() {
  if (!iaExternaAtiva()) return { ok: false, mensagem: 'Nenhuma IA externa configurada. Defina IA_PROVEDOR e IA_API_KEY no .env e reinicie o backend.' };
  try {
    const resposta = await chamarIA('Responda apenas com a palavra OK.');
    return { ok: true, provedor: cfg().provedor, modelo: cfg().modelo, resposta: resposta.slice(0, 80) };
  } catch (e) {
    return { ok: false, provedor: cfg().provedor, modelo: cfg().modelo, mensagem: e.message };
  }
}

module.exports = { aprenderEstufa, aprenderPendentes, analisarEstufas, iniciarMonitor, status, testarConexao, iaExternaAtiva, NOME_REMETENTE };
