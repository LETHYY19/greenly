// ============================================================
// Conexão MQTT com a ESP32 da estufa
// Tópicos enviados pelo estufa.js:
//   estufa/temp       -> temperatura (°C)
//   estufa/umid_ar    -> umidade do ar (%)
//   estufa/umid_solo  -> umidade do solo (%)
//   estufa/luz        -> luminosidade (0..100%, convertida para lux)
// ============================================================
const mqtt = require('mqtt');
const { getPool } = require('./db');

const TOPICOS = {
  'estufa/temp': 'temperatura',
  'estufa/umid_ar': 'umidadeAr',
  'estufa/umid_solo': 'umidadeSolo',
  'estufa/luz': 'luminosidade',
};

const estado = {
  ativo: false,
  conectado: false,
  broker: null,
  estufaId: 1,
  ultimaLeituraEm: null,
  ultimoErro: '',
  valores: {},
  historico: [],
};

let client = null;
let ultimoSalvamentoDb = 0;

function montarBrokerUrl() {
  const host = (process.env.MQTT_HOST || '').trim();
  if (!host) return null;
  if (/^(mqtts?|wss?):\/\//i.test(host)) return host;
  const port = Number(process.env.MQTT_PORT) || 1883;
  return `mqtt://${host}:${port}`;
}

function normalizarValor(chave, bruto) {
  const texto = String(bruto ?? '').trim().replace(',', '.');
  if (!texto) return null;
  const n = Number(texto);
  if (!Number.isFinite(n)) return null;
  if (chave === 'luminosidade') {
    if (n < 0) return null;
    const fator = Number(process.env.MQTT_LUZ_FATOR) || 150;
    // O LDR da ESP32 envia 0..100%; converte para a escala 0..15000 lux do Greenly
    return n <= 100 ? Math.round(n * fator) : Math.round(n);
  }
  if (chave === 'temperatura') return Math.round(n * 10) / 10;
  if (n < 0 || n > 100) return null;
  return Math.round(n);
}

function registrarPontoHistorico(agora) {
  const v = estado.valores;
  if (
    v.temperatura === undefined &&
    v.umidadeAr === undefined &&
    v.umidadeSolo === undefined &&
    v.luminosidade === undefined
  ) {
    return;
  }
  const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  const ponto = { hora, ...v };
  const ultimo = estado.historico[estado.historico.length - 1];
  if (ultimo && ultimo.hora === hora) {
    estado.historico[estado.historico.length - 1] = ponto;
  } else {
    estado.historico.push(ponto);
    if (estado.historico.length > 12) estado.historico.shift();
  }
}

async function salvarNoBancoSeNecessario() {
  const agora = Date.now();
  if (agora - ultimoSalvamentoDb < 30000) return;
  const v = estado.valores;
  const campos = [];
  const params = [];
  if (v.temperatura !== undefined) { campos.push('base_temp = ?'); params.push(v.temperatura); }
  if (v.umidadeAr !== undefined) { campos.push('base_ar = ?'); params.push(v.umidadeAr); }
  if (v.umidadeSolo !== undefined) { campos.push('base_solo = ?'); params.push(v.umidadeSolo); }
  if (v.luminosidade !== undefined) { campos.push('base_lux = ?'); params.push(v.luminosidade); }
  if (!campos.length) return;

  ultimoSalvamentoDb = agora;
  params.push(estado.estufaId);
  try {
    await getPool().query(`UPDATE estufas SET ${campos.join(', ')} WHERE id = ?`, params);
  } catch (err) {
    console.warn('[MQTT] não foi possível salvar leitura no MySQL:', err.message);
  }
}

function processarMensagem(topic, message) {
  const chave = TOPICOS[topic];
  if (!chave) return;
  const valor = normalizarValor(chave, message.toString());
  if (valor === null) return;

  const agora = new Date();
  estado.valores[chave] = valor;
  estado.ultimaLeituraEm = agora.toISOString();
  registrarPontoHistorico(agora);
  salvarNoBancoSeNecessario();
}

function iniciarMqtt() {
  if (client) return client;
  const url = montarBrokerUrl();
  estado.estufaId = Number(process.env.MQTT_ESTUFA_ID) || 1;

  if (!url) {
    console.log('[MQTT] MQTT_HOST não definido: usando leituras simuladas.');
    return null;
  }

  estado.ativo = true;
  estado.broker = url;

  const opts = {
    clientId: `greenly-backend-${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  };
  if (process.env.MQTT_USER) opts.username = process.env.MQTT_USER;
  if (process.env.MQTT_PASSWORD) opts.password = process.env.MQTT_PASSWORD;

  client = mqtt.connect(url, opts);

  client.on('connect', () => {
    estado.conectado = true;
    estado.ultimoErro = '';
    console.log(`[MQTT] Conectado a ${url} (estufa #${estado.estufaId}).`);
    client.subscribe(Object.keys(TOPICOS), (err) => {
      if (err) {
        estado.ultimoErro = err.message;
        console.error('[MQTT] Erro ao assinar tópicos:', err.message);
      } else {
        console.log('[MQTT] Inscrito nos tópicos:', Object.keys(TOPICOS).join(', '));
      }
    });
  });

  client.on('message', (topic, message) => {
    processarMensagem(topic, message);
  });

  client.on('reconnect', () => {
    estado.conectado = false;
  });

  client.on('close', () => {
    estado.conectado = false;
  });

  client.on('error', (err) => {
    estado.conectado = false;
    if (estado.ultimoErro !== err.message) {
      console.warn('[MQTT] Erro de conexão:', err.message);
    }
    estado.ultimoErro = err.message;
  });

  return client;
}

function leituraMqttPara(estufaId) {
  if (!estado.ativo || Number(estufaId) !== estado.estufaId) return null;
  if (!estado.ultimaLeituraEm || !Object.keys(estado.valores).length) return null;
  return {
    valores: { ...estado.valores },
    atualizadoEm: estado.ultimaLeituraEm,
    historico: estado.historico.map((p) => ({ ...p })),
  };
}

function statusMqtt() {
  return {
    ativo: estado.ativo,
    conectado: estado.conectado,
    broker: estado.broker,
    estufaId: estado.estufaId,
    topicos: Object.keys(TOPICOS),
    ultimaLeituraEm: estado.ultimaLeituraEm,
    ultimoErro: estado.ultimoErro || null,
    valores: { ...estado.valores },
  };
}

module.exports = { iniciarMqtt, leituraMqttPara, statusMqtt, processarMensagem, normalizarValor };
