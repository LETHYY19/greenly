const repo = require('../repo');
const { ok, num } = require('../utils/validacao');

async function listar(req, res) {
  res.json(await repo.listarNotificacoes(req.user));
}

// O administrador envia uma orientação para um colaborador (ou para todos)
async function criar(req, res) {
  const b = req.body || {};
  if (!ok(b.titulo)) return res.status(400).json({ message: 'Informe o assunto da mensagem.' });
  if (!ok(b.mensagem) || b.mensagem.trim().length < 5) return res.status(400).json({ message: 'Escreva a mensagem para o colaborador.' });
  if (!['urgente', 'atencao', 'info', 'ok'].includes(b.prioridade || 'info')) return res.status(400).json({ message: 'Prioridade inválida.' });
  let dest = null;
  if (b.destinatarioId !== undefined && b.destinatarioId !== null && b.destinatarioId !== 'todos') {
    const u = await repo.buscarColaborador(Number(b.destinatarioId));
    if (!u) return res.status(400).json({ message: 'Colaborador não encontrado.' });
    dest = u.id;
  }
  const estufaId = num(b.estufaId) && (await repo.buscarEstufa(b.estufaId)) ? b.estufaId : null;
  const id = await repo.criarNotificacao({ titulo: b.titulo.trim(), mensagem: b.mensagem.trim(), prioridade: b.prioridade || 'info', estufaId, destinatarioId: dest }, req.user.id);
  res.status(201).json(await repo.buscarNotificacaoVisivel(req.user, id));
}

async function marcarTodasLidas(req, res) {
  await repo.marcarTodasLidas(req.user);
  res.status(204).send();
}

async function marcarLida(req, res) {
  const n = await repo.buscarNotificacaoVisivel(req.user, Number(req.params.id));
  if (!n) return res.status(404).json({ message: 'Notificação não encontrada.' });
  await repo.marcarLida(req.user.id, n.id);
  res.json({ ...n, lida: true });
}

async function remover(req, res) {
  const id = Number(req.params.id);
  if (!(await repo.existeNotificacao(id))) return res.status(404).json({ message: 'Notificação não encontrada.' });
  await repo.removerNotificacao(id);
  res.status(204).send();
}

module.exports = { listar, criar, marcarTodasLidas, marcarLida, remover };
