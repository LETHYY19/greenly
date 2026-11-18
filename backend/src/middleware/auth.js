// Middlewares de autenticação (token guardado na tabela "sessoes")
const repo = require('../repo');

// Exige login: lê "Authorization: Bearer <token>" e coloca o usuário em req.user
async function autenticar(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = token ? await repo.buscarUsuarioPorToken(token) : null;
  if (!user) return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
  req.user = user;
  next();
}

// Só o administrador passa
function soAdmin(req, res, next) {
  if (req.user.perfil !== 'admin') return res.status(403).json({ message: 'Apenas o administrador pode fazer isso.' });
  next();
}

module.exports = { autenticar, soAdmin };
