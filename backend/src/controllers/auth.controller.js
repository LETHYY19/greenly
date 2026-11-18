const crypto = require('crypto');
const { hash } = require('../store');
const repo = require('../repo');
const { ok, emailValido } = require('../utils/validacao');

const publico = (u) => ({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, cargo: u.cargo, telefone: u.telefone, estufaIds: u.estufaIds, ativo: u.ativo });

async function login(req, res) {
  const { email, senha, perfil } = req.body || {};
  if (!ok(email) || !ok(senha)) return res.status(400).json({ message: 'Informe e-mail e senha.' });
  if (!emailValido(email)) return res.status(400).json({ message: 'E-mail inválido.' });
  const user = await repo.buscarUsuarioPorEmail(email.trim());
  if (!user || user.senhaHash !== hash(senha)) return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  if (!user.ativo) return res.status(403).json({ message: 'Este acesso está desativado.' });
  if (perfil && perfil !== user.perfil) {
    return res.status(403).json({ message: perfil === 'admin' ? 'Esta conta não é de administrador.' : 'Esta conta é de administrador. Use o acesso de Administrador.' });
  }
  const token = crypto.randomBytes(24).toString('hex');
  await repo.criarSessao(token, user.id);
  res.json({ token, usuario: publico(user) });
}

async function logout(req, res) {
  await repo.removerSessao((req.headers.authorization || '').replace('Bearer ', ''));
  res.status(204).send();
}

function me(req, res) {
  res.json(publico(req.user));
}

module.exports = { login, logout, me, publico };
