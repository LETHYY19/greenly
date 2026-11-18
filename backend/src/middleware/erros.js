// Rota não encontrada e tratamento de erros (sempre responde em JSON)
function naoEncontrada(req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}

// eslint-disable-next-line no-unused-vars
function tratarErros(err, req, res, next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Os dados enviados estão em um formato inválido.' });
  console.error(err);
  res.status(500).json({ message: 'Erro interno no servidor. Tente novamente em instantes.' });
}

module.exports = { naoEncontrada, tratarErros };
