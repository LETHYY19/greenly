const { hash } = require('../store');
const repo = require('../repo');
const { publico } = require('./auth.controller');
const { ok, emailValido } = require('../utils/validacao');

function validarColab(b, criando) {
  if (!ok(b.nome) || b.nome.trim().length < 3) return 'Informe o nome completo.';
  if (!ok(b.email) || !emailValido(b.email)) return 'Informe um e-mail válido.';
  if (criando && (!ok(b.senha) || b.senha.length < 6)) return 'A senha provisória precisa ter ao menos 6 caracteres.';
  if (b.estufaIds !== undefined && !Array.isArray(b.estufaIds)) return 'Estufas inválidas.';
  return null;
}

async function listar(req, res) {
  res.json((await repo.listarColaboradores()).map(publico));
}

async function criar(req, res) {
  const b = req.body || {};
  const erro = validarColab(b, true);
  if (erro) return res.status(400).json({ message: erro });
  if (await repo.emailEmUso(b.email.trim())) return res.status(409).json({ message: 'Já existe um colaborador com esse e-mail.' });
  const u = await repo.criarColaborador({
    nome: b.nome.trim(), email: b.email.trim(), senhaHash: hash(b.senha), cargo: b.cargo || 'Colaborador da produção', telefone: b.telefone || '',
    estufaIds: await repo.idsDeEstufasValidos(b.estufaIds || []),
  });
  res.status(201).json(publico(u));
}

async function atualizar(req, res) {
  const atual = await repo.buscarColaborador(Number(req.params.id));
  if (!atual) return res.status(404).json({ message: 'Colaborador não encontrado.' });
  const b = req.body || {};
  const erro = validarColab(b, false);
  if (erro) return res.status(400).json({ message: erro });
  if (await repo.emailEmUso(b.email.trim(), atual.id)) return res.status(409).json({ message: 'Já existe um colaborador com esse e-mail.' });
  const u = await repo.atualizarColaborador(atual.id, {
    nome: b.nome.trim(), email: b.email.trim(), cargo: b.cargo || atual.cargo, telefone: b.telefone !== undefined ? b.telefone : atual.telefone,
    senhaHash: ok(b.senha) ? hash(b.senha) : null, estufaIds: Array.isArray(b.estufaIds) ? await repo.idsDeEstufasValidos(b.estufaIds) : null,
  });
  res.json(publico(u));
}

async function remover(req, res) {
  const u = await repo.buscarColaborador(Number(req.params.id));
  if (!u) return res.status(404).json({ message: 'Colaborador não encontrado.' });
  await repo.removerColaborador(u.id);
  res.status(204).send();
}

module.exports = { listar, criar, atualizar, remover };
