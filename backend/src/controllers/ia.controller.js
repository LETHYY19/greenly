const repo = require('../repo');
const ia = require('../services/ia.service');

// Situação da IA (qual provedor, se está ligada, última análise...)
function status(req, res) {
  res.json(ia.status());
}

// Testa se a chave/modelo configurados no .env funcionam
async function testar(req, res) {
  res.json(await ia.testarConexao());
}

// Roda a análise agora (sem esperar o próximo minuto)
async function analisar(req, res) {
  const novos = await ia.analisarEstufas();
  res.json({ alertasGerados: novos.length, alertas: novos });
}

// O que a IA guardou sobre as condições ideais de uma estufa
async function perfil(req, res) {
  const p = await repo.buscarPerfilIA(Number(req.params.id));
  if (!p) return res.status(404).json({ message: 'A IA ainda não guardou as informações desta estufa.' });
  res.json(p);
}

module.exports = { status, testar, analisar, perfil };
