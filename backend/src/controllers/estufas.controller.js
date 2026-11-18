const repo = require('../repo');
const { leituras } = require('../store');
const ia = require('../services/ia.service');
const { comResumo, validarEstufa, validarFaixas, FAIXAS_PADRAO } = require('../services/estufas.service');
const { ok, num } = require('../utils/validacao');

// estufa que o usuário logado pode ver (admin vê todas)
async function umaEstufaVisivel(req) {
  const e = await repo.buscarEstufa(Number(req.params.id));
  return e && (await repo.usuarioVeEstufa(req.user, e.id)) ? e : null;
}

// a IA aprende as condições ideais em segundo plano (não atrasa a resposta)
const aprender = (estufa) => ia.aprenderEstufa(estufa).catch((e) => console.error('[IA] erro ao aprender estufa:', e.message));

async function listar(req, res) {
  const [lista, resp] = await Promise.all([repo.listarEstufas(req.user), repo.responsaveisPorEstufa()]);
  res.json(lista.map((e) => comResumo(e, resp)));
}

async function buscar(req, res) {
  const e = await umaEstufaVisivel(req);
  if (!e) return res.status(404).json({ message: 'Estufa não encontrada.' });
  res.json(comResumo(e, await repo.responsaveisPorEstufa()));
}

async function lerSensores(req, res) {
  const e = await umaEstufaVisivel(req);
  if (!e) return res.status(404).json({ message: 'Estufa não encontrada.' });
  res.json(leituras(e));
}

async function criar(req, res) {
  const b = req.body || {};
  const erro = validarEstufa(b) || validarFaixas(b.faixas, b.regaMinutos);
  if (erro) return res.status(400).json({ message: erro });
  const faixas = b.faixas || FAIXAS_PADRAO();
  const meio = (k) => (faixas[k].min + faixas[k].max) / 2;
  const e = await repo.criarEstufa({
    nome: b.nome.trim(), cultura: b.cultura.trim(), icone: b.icone || b.cultura.trim().toLowerCase(), area: b.area,
    localizacao: ok(b.localizacao) ? b.localizacao.trim() : 'Setor —', faixas, regaMinutos: b.regaMinutos || 20,
    base: { temperatura: meio('temperatura'), umidadeAr: meio('umidadeAr'), umidadeSolo: meio('umidadeSolo'), luminosidade: meio('luminosidade') },
  });
  if (num(b.colaboradorId) && (await repo.buscarColaborador(b.colaboradorId))) await repo.liberarEstufa(b.colaboradorId, e.id);
  aprender(e); // a IA pega as "Condições ideais" desta nova estufa e guarda
  res.status(201).json(comResumo(e, await repo.responsaveisPorEstufa()));
}

async function atualizar(req, res) {
  const atual = await repo.buscarEstufa(Number(req.params.id));
  if (!atual) return res.status(404).json({ message: 'Estufa não encontrada.' });
  const b = req.body || {};
  const erro = validarEstufa(b) || validarFaixas(b.faixas, b.regaMinutos);
  if (erro) return res.status(400).json({ message: erro });
  const e = await repo.atualizarEstufa(atual.id, { nome: b.nome.trim(), cultura: b.cultura.trim(), area: b.area, localizacao: b.localizacao || atual.localizacao, regaMinutos: b.regaMinutos || atual.regaMinutos, faixas: b.faixas });
  if (b.faixas || b.regaMinutos || b.cultura.trim() !== atual.cultura) aprender(e); // condições mudaram: a IA atualiza o que guardou
  res.json(comResumo(e, await repo.responsaveisPorEstufa()));
}

async function remover(req, res) {
  const e = await repo.buscarEstufa(Number(req.params.id));
  if (!e) return res.status(404).json({ message: 'Estufa não encontrada.' });
  await repo.removerEstufa(e.id);
  res.status(204).send();
}

module.exports = { listar, buscar, lerSensores, criar, atualizar, remover };
