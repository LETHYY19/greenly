const repo = require('../repo');
const { leituras } = require('../store');

// Números do painel inicial do administrador
async function resumo(req, res) {
  const [estufas, colaboradores, lotesDisponiveis] = await Promise.all([repo.listarEstufas(req.user), repo.contarColaboradores(), repo.contarLotesDisponiveis()]);
  res.json({ estufas: estufas.length, colaboradores, alertas: estufas.filter((e) => leituras(e).status !== 'ideal').length, lotesDisponiveis });
}

module.exports = { resumo };
