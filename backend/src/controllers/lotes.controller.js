const repo = require('../repo');
const { ok, num } = require('../utils/validacao');

async function listar(req, res) {
  res.json(await repo.listarLotes());
}

async function criar(req, res) {
  const b = req.body || {};
  if (!ok(b.produto)) return res.status(400).json({ message: 'Informe o produto.' });
  if (!num(b.quantidade) || b.quantidade <= 0) return res.status(400).json({ message: 'A quantidade (kg) deve ser maior que zero.' });
  if (!['A', 'B', 'C'].includes(b.qualidade)) return res.status(400).json({ message: 'Qualidade deve ser A, B ou C.' });
  if (b.empresaId && !(await repo.empresaExiste(b.empresaId))) return res.status(400).json({ message: 'Empresa não encontrada.' });
  res.status(201).json(await repo.criarLote({ produto: b.produto.trim(), quantidade: Math.round(b.quantidade), qualidade: b.qualidade, empresaId: b.empresaId || null }));
}

async function remover(req, res) {
  if (!(await repo.removerLote(Number(req.params.id)))) return res.status(404).json({ message: 'Lote não encontrado.' });
  res.status(204).send();
}

module.exports = { listar, criar, remover };
