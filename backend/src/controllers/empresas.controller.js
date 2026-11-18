const repo = require('../repo');
const { ok, emailValido } = require('../utils/validacao');

async function listar(req, res) {
  res.json(await repo.listarEmpresas());
}

async function criar(req, res) {
  const b = req.body || {};
  if (!ok(b.nome) || b.nome.trim().length < 2) return res.status(400).json({ message: 'Informe o nome da empresa.' });
  if (!ok(b.segmento)) return res.status(400).json({ message: 'Informe o segmento (ex.: Indústria de sucos).' });
  if (ok(b.contato) && !emailValido(b.contato)) return res.status(400).json({ message: 'E-mail de contato inválido.' });
  res.status(201).json(await repo.criarEmpresa({ nome: b.nome.trim(), segmento: b.segmento.trim(), contato: ok(b.contato) ? b.contato.trim() : '' }));
}

async function remover(req, res) {
  const id = Number(req.params.id);
  if (!(await repo.empresaExiste(id))) return res.status(404).json({ message: 'Empresa não encontrada.' });
  await repo.removerEmpresa(id);
  res.status(204).send();
}

module.exports = { listar, criar, remover };
