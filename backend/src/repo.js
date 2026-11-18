// ============================================================
// Acesso ao MySQL (consultas SQL). Tudo aqui é assíncrono.
// ============================================================
const { getPool } = require('./db');

const q = async (sql, params = []) => { const [rows] = await getPool().query(sql, params); return rows; };
const marcas = (lista) => lista.map(() => '?').join(',');
const num = (v) => (v === null || v === undefined ? v : Number(v));
const agora = () => new Date().toISOString().slice(0, 19).replace('T', ' '); // UTC, formato DATETIME
const iso = (v) => {
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  return new Date(s.includes('T') ? s : `${s.replace(' ', 'T')}Z`).toISOString();
};

/* ------------------------- usuários ------------------------- */
async function estufaIdsDe(ids) {
  const mapa = new Map(ids.map((id) => [id, []]));
  if (!ids.length) return mapa;
  const rows = await q(`SELECT usuario_id, estufa_id FROM usuario_estufa WHERE usuario_id IN (${marcas(ids)}) ORDER BY estufa_id`, ids);
  rows.forEach((r) => mapa.get(r.usuario_id)?.push(r.estufa_id));
  return mapa;
}
const mapUsuario = (r, estufaIds) => ({ id: r.id, nome: r.nome, email: r.email, senhaHash: r.senha_hash, perfil: r.perfil, cargo: r.cargo, telefone: r.telefone, ativo: !!r.ativo, estufaIds: estufaIds || [] });

async function comEstufas(rows) {
  const mapa = await estufaIdsDe(rows.map((r) => r.id));
  return rows.map((r) => mapUsuario(r, mapa.get(r.id)));
}
async function umUsuario(rows) { return rows.length ? (await comEstufas(rows))[0] : null; }

const buscarUsuarioPorEmail = async (email) => umUsuario(await q('SELECT * FROM usuarios WHERE LOWER(email) = LOWER(?)', [email]));
const buscarUsuarioPorId = async (id) => umUsuario(await q('SELECT * FROM usuarios WHERE id = ?', [id]));
const buscarUsuarioPorToken = async (token) => umUsuario(await q('SELECT u.* FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ?', [token]));
const listarColaboradores = async () => comEstufas(await q("SELECT * FROM usuarios WHERE perfil = 'usuario' ORDER BY id"));
async function buscarColaborador(id) { return umUsuario(await q("SELECT * FROM usuarios WHERE id = ? AND perfil = 'usuario'", [id])); }

async function emailEmUso(email, ignorarId = 0) {
  const rows = await q('SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?) AND id <> ?', [email, ignorarId]);
  return rows.length > 0;
}
async function idsDeEstufasValidos(ids) {
  if (!ids.length) return [];
  const rows = await q(`SELECT id FROM estufas WHERE id IN (${marcas(ids)})`, ids);
  return rows.map((r) => r.id);
}
async function definirEstufasDoUsuario(usuarioId, estufaIds) {
  await q('DELETE FROM usuario_estufa WHERE usuario_id = ?', [usuarioId]);
  for (const eid of estufaIds) await q('INSERT INTO usuario_estufa (usuario_id, estufa_id) VALUES (?,?)', [usuarioId, eid]);
}
async function liberarEstufa(usuarioId, estufaId) {
  const ja = await q('SELECT 1 AS x FROM usuario_estufa WHERE usuario_id = ? AND estufa_id = ?', [usuarioId, estufaId]);
  if (!ja.length) await q('INSERT INTO usuario_estufa (usuario_id, estufa_id) VALUES (?,?)', [usuarioId, estufaId]);
}

async function criarColaborador(d) {
  const r = await getPool().query('INSERT INTO usuarios (nome, email, senha_hash, perfil, cargo, telefone) VALUES (?,?,?,?,?,?)', [d.nome, d.email, d.senhaHash, 'usuario', d.cargo, d.telefone]);
  const id = r[0].insertId;
  await definirEstufasDoUsuario(id, d.estufaIds);
  return buscarUsuarioPorId(id);
}
async function atualizarColaborador(id, d) {
  await q('UPDATE usuarios SET nome = ?, email = ?, cargo = ?, telefone = ? WHERE id = ?', [d.nome, d.email, d.cargo, d.telefone, id]);
  if (d.senhaHash) await q('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [d.senhaHash, id]);
  if (d.estufaIds) await definirEstufasDoUsuario(id, d.estufaIds);
  return buscarUsuarioPorId(id);
}
const removerColaborador = (id) => q('DELETE FROM usuarios WHERE id = ?', [id]);

/* ------------------------- sessões ------------------------- */
const criarSessao = (token, usuarioId) => q('INSERT INTO sessoes (token, usuario_id) VALUES (?,?)', [token, usuarioId]);
const removerSessao = (token) => q('DELETE FROM sessoes WHERE token = ?', [token]);

/* ------------------------- estufas ------------------------- */
function mapEstufa(r) {
  return {
    id: r.id, nome: r.nome, cultura: r.cultura, icone: r.icone, area: num(r.area), localizacao: r.localizacao, etapa: r.etapa, regaMinutos: r.rega_minutos,
    faixas: {
      temperatura: { min: num(r.temp_min), max: num(r.temp_max) },
      umidadeAr: { min: num(r.ar_min), max: num(r.ar_max) },
      umidadeSolo: { min: num(r.solo_min), max: num(r.solo_max) },
      luminosidade: { min: num(r.lux_min), max: num(r.lux_max) },
    },
    base: { temperatura: num(r.base_temp), umidadeAr: num(r.base_ar), umidadeSolo: num(r.base_solo), luminosidade: num(r.base_lux) },
  };
}

async function listarEstufas(usuario) {
  const rows = usuario.perfil === 'admin'
    ? await q('SELECT * FROM estufas ORDER BY id')
    : await q('SELECT e.* FROM estufas e JOIN usuario_estufa ue ON ue.estufa_id = e.id WHERE ue.usuario_id = ? ORDER BY e.id', [usuario.id]);
  return rows.map(mapEstufa);
}
async function buscarEstufa(id) {
  const rows = await q('SELECT * FROM estufas WHERE id = ?', [id]);
  return rows.length ? mapEstufa(rows[0]) : null;
}
async function usuarioVeEstufa(usuario, estufaId) {
  if (usuario.perfil === 'admin') return true;
  return (await q('SELECT 1 AS x FROM usuario_estufa WHERE usuario_id = ? AND estufa_id = ?', [usuario.id, estufaId])).length > 0;
}
async function responsaveisPorEstufa() {
  const rows = await q("SELECT ue.estufa_id, u.nome FROM usuario_estufa ue JOIN usuarios u ON u.id = ue.usuario_id WHERE u.perfil = 'usuario' ORDER BY u.nome");
  const mapa = new Map();
  rows.forEach((r) => mapa.set(r.estufa_id, [...(mapa.get(r.estufa_id) || []), r.nome]));
  return mapa;
}

const COLUNAS_ESTUFA = 'nome, cultura, icone, area, localizacao, etapa, rega_minutos, temp_min, temp_max, ar_min, ar_max, solo_min, solo_max, lux_min, lux_max, base_temp, base_ar, base_solo, base_lux';
async function criarEstufa(e) {
  const f = e.faixas, b = e.base;
  const r = await getPool().query(
    `INSERT INTO estufas (${COLUNAS_ESTUFA}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [e.nome, e.cultura, e.icone, e.area, e.localizacao, 0, e.regaMinutos, f.temperatura.min, f.temperatura.max, f.umidadeAr.min, f.umidadeAr.max, f.umidadeSolo.min, f.umidadeSolo.max, f.luminosidade.min, f.luminosidade.max, b.temperatura, b.umidadeAr, b.umidadeSolo, b.luminosidade]
  );
  return buscarEstufa(r[0].insertId);
}
async function atualizarEstufa(id, e) {
  await q('UPDATE estufas SET nome = ?, cultura = ?, area = ?, localizacao = ?, rega_minutos = ? WHERE id = ?', [e.nome, e.cultura, e.area, e.localizacao, e.regaMinutos, id]);
  if (e.faixas) {
    const f = e.faixas;
    await q('UPDATE estufas SET temp_min = ?, temp_max = ?, ar_min = ?, ar_max = ?, solo_min = ?, solo_max = ?, lux_min = ?, lux_max = ? WHERE id = ?',
      [f.temperatura.min, f.temperatura.max, f.umidadeAr.min, f.umidadeAr.max, f.umidadeSolo.min, f.umidadeSolo.max, f.luminosidade.min, f.luminosidade.max, id]);
  }
  return buscarEstufa(id);
}
const removerEstufa = (id) => q('DELETE FROM estufas WHERE id = ?', [id]);

/* ------------------------- notificações ------------------------- */
const VISIVEL_USUARIO = "n.tipo = 'adm' AND (n.destino = 'todos' OR (n.destino = 'usuario' AND n.destinatario_id = ?))";
const SELECT_NOTIF = `SELECT n.*, (nl.usuario_id IS NOT NULL) AS lida, e.cultura AS estufa_cultura, d.nome AS destinatario_nome
  FROM notificacoes n
  LEFT JOIN notificacao_leitura nl ON nl.notificacao_id = n.id AND nl.usuario_id = ?
  LEFT JOIN estufas e ON e.id = n.estufa_id
  LEFT JOIN usuarios d ON d.id = n.destinatario_id`;

function mapNotif(r) {
  const destinatarioId = r.destino === 'todos' ? null : r.destino === 'admin' ? 'admin' : r.destinatario_id;
  const destinatario = r.destino === 'todos' ? 'Todos os colaboradores' : r.destino === 'admin' ? 'Administrador' : r.destinatario_nome;
  return { id: r.id, tipo: r.tipo, titulo: r.titulo, mensagem: r.mensagem, prioridade: r.prioridade, estufaId: r.estufa_id, destinatarioId, remetente: r.remetente, criadaEm: iso(r.criada_em), lida: !!r.lida, estufa: r.estufa_cultura || null, destinatario };
}

async function listarNotificacoes(usuario) {
  const rows = usuario.perfil === 'admin'
    ? await q(`${SELECT_NOTIF} ORDER BY n.criada_em DESC, n.id DESC`, [usuario.id])
    : await q(`${SELECT_NOTIF} WHERE ${VISIVEL_USUARIO} ORDER BY n.criada_em DESC, n.id DESC`, [usuario.id, usuario.id]);
  return rows.map(mapNotif);
}
async function buscarNotificacaoVisivel(usuario, id) {
  const rows = usuario.perfil === 'admin'
    ? await q(`${SELECT_NOTIF} WHERE n.id = ?`, [usuario.id, id])
    : await q(`${SELECT_NOTIF} WHERE n.id = ? AND ${VISIVEL_USUARIO}`, [usuario.id, id, usuario.id]);
  return rows.length ? mapNotif(rows[0]) : null;
}
async function marcarLida(usuarioId, notificacaoId) {
  const ja = await q('SELECT 1 AS x FROM notificacao_leitura WHERE notificacao_id = ? AND usuario_id = ?', [notificacaoId, usuarioId]);
  if (!ja.length) await q('INSERT INTO notificacao_leitura (notificacao_id, usuario_id) VALUES (?,?)', [notificacaoId, usuarioId]);
}
async function marcarTodasLidas(usuario) {
  for (const n of await listarNotificacoes(usuario)) if (!n.lida) await marcarLida(usuario.id, n.id);
}
async function criarNotificacao(n, autorId) {
  const r = await getPool().query(
    'INSERT INTO notificacoes (tipo, titulo, mensagem, prioridade, estufa_id, destino, destinatario_id, remetente, criada_em) VALUES (?,?,?,?,?,?,?,?,?)',
    ['adm', n.titulo, n.mensagem, n.prioridade, n.estufaId, n.destinatarioId === null ? 'todos' : 'usuario', n.destinatarioId, 'Administrador', agora()]
  );
  const id = r[0].insertId;
  await marcarLida(autorId, id);
  return id;
}
const removerNotificacao = (id) => q('DELETE FROM notificacoes WHERE id = ?', [id]);
async function existeNotificacao(id) { return (await q('SELECT id FROM notificacoes WHERE id = ?', [id])).length > 0; }

/* ------------------------- empresas e lotes ------------------------- */
async function listarEmpresas() {
  const rows = await q('SELECT e.*, (SELECT COUNT(*) FROM lotes l WHERE l.empresa_id = e.id) AS total_lotes FROM empresas e ORDER BY e.id');
  return rows.map((r) => ({ id: r.id, nome: r.nome, segmento: r.segmento, contato: r.contato, totalLotes: Number(r.total_lotes) }));
}
async function empresaExiste(id) { return (await q('SELECT id FROM empresas WHERE id = ?', [id])).length > 0; }
async function criarEmpresa(e) {
  const r = await getPool().query('INSERT INTO empresas (nome, segmento, contato) VALUES (?,?,?)', [e.nome, e.segmento, e.contato]);
  return { id: r[0].insertId, nome: e.nome, segmento: e.segmento, contato: e.contato, totalLotes: 0 };
}
async function removerEmpresa(id) {
  await q("UPDATE lotes SET empresa_id = NULL, disponibilidade = 'Disponível' WHERE empresa_id = ?", [id]);
  await q('DELETE FROM empresas WHERE id = ?', [id]);
}

const mapLote = (r) => ({ id: r.id, produto: r.produto, quantidade: Number(r.quantidade), qualidade: r.qualidade, lote: r.codigo, disponibilidade: r.disponibilidade, empresaId: r.empresa_id, destino: r.empresa_nome || null });
async function listarLotes() {
  return (await q('SELECT l.*, e.nome AS empresa_nome FROM lotes l LEFT JOIN empresas e ON e.id = l.empresa_id ORDER BY l.id')).map(mapLote);
}
async function criarLote(l) {
  const r = await getPool().query('INSERT INTO lotes (produto, quantidade, qualidade, codigo, disponibilidade, empresa_id) VALUES (?,?,?,?,?,?)',
    [l.produto, l.quantidade, l.qualidade, '', l.empresaId ? 'Reservado' : 'Disponível', l.empresaId || null]);
  const id = r[0].insertId;
  await q('UPDATE lotes SET codigo = ? WHERE id = ?', [`Lote ${String(100 + id).padStart(3, '0')}`, id]);
  return (await q('SELECT l.*, e.nome AS empresa_nome FROM lotes l LEFT JOIN empresas e ON e.id = l.empresa_id WHERE l.id = ?', [id])).map(mapLote)[0];
}
async function removerLote(id) {
  const r = await getPool().query('DELETE FROM lotes WHERE id = ?', [id]);
  return r[0].affectedRows > 0;
}
async function contarLotesDisponiveis() { return Number((await q("SELECT COUNT(*) AS total FROM lotes WHERE disponibilidade = 'Disponível'"))[0].total); }
async function contarColaboradores() { return Number((await q("SELECT COUNT(*) AS total FROM usuarios WHERE perfil = 'usuario'"))[0].total); }


/* ------------------------- IA (condições ideais guardadas + alertas) ------------------------- */
async function salvarPerfilIA(estufaId, p) {
  const orient = JSON.stringify(p.orientacoes);
  const existe = await q('SELECT estufa_id FROM ia_perfis WHERE estufa_id = ?', [estufaId]);
  if (existe.length) {
    await q('UPDATE ia_perfis SET resumo = ?, orientacoes = ?, fonte = ?, modelo = ?, atualizado_em = ? WHERE estufa_id = ?', [p.resumo, orient, p.fonte, p.modelo || '', agora(), estufaId]);
  } else {
    await q('INSERT INTO ia_perfis (estufa_id, resumo, orientacoes, fonte, modelo, atualizado_em) VALUES (?,?,?,?,?,?)', [estufaId, p.resumo, orient, p.fonte, p.modelo || '', agora()]);
  }
}
async function buscarPerfilIA(estufaId) {
  const rows = await q('SELECT * FROM ia_perfis WHERE estufa_id = ?', [estufaId]);
  if (!rows.length) return null;
  const r = rows[0];
  return { estufaId: r.estufa_id, resumo: r.resumo, orientacoes: JSON.parse(r.orientacoes), fonte: r.fonte, modelo: r.modelo, atualizadoEm: iso(r.atualizado_em) };
}
async function estufaIdsComPerfilIA() { return (await q('SELECT estufa_id FROM ia_perfis')).map((r) => r.estufa_id); }

// alerta gerado pela IA: aparece só para o administrador (card "Alertas da IA")
async function criarAlertaIA({ estufaId, titulo, mensagem, prioridade }) {
  const r = await getPool().query(
    'INSERT INTO notificacoes (tipo, titulo, mensagem, prioridade, estufa_id, destino, destinatario_id, remetente, criada_em) VALUES (?,?,?,?,?,?,?,?,?)',
    ['ia', titulo, mensagem, prioridade, estufaId, 'admin', null, 'Inteligência Artificial', agora()]
  );
  return r[0].insertId;
}
// já existe um alerta igual (mesma estufa e mesmo assunto) criado há menos de X minutos?
async function existeAlertaIARecente(estufaId, titulo, minutos) {
  const corte = new Date(Date.now() - minutos * 60000).toISOString().slice(0, 19).replace('T', ' ');
  return (await q("SELECT id FROM notificacoes WHERE tipo = 'ia' AND estufa_id = ? AND titulo = ? AND criada_em >= ?", [estufaId, titulo, corte])).length > 0;
}

module.exports = {
  buscarUsuarioPorEmail, buscarUsuarioPorId, buscarUsuarioPorToken, listarColaboradores, buscarColaborador, emailEmUso, idsDeEstufasValidos,
  liberarEstufa, criarColaborador, atualizarColaborador, removerColaborador, criarSessao, removerSessao,
  listarEstufas, buscarEstufa, usuarioVeEstufa, responsaveisPorEstufa, criarEstufa, atualizarEstufa, removerEstufa,
  listarNotificacoes, buscarNotificacaoVisivel, marcarLida, marcarTodasLidas, criarNotificacao, removerNotificacao, existeNotificacao,
  salvarPerfilIA, buscarPerfilIA, estufaIdsComPerfilIA, criarAlertaIA, existeAlertaIARecente,
  listarEmpresas, empresaExiste, criarEmpresa, removerEmpresa, listarLotes, criarLote, removerLote, contarLotesDisponiveis, contarColaboradores,
};
