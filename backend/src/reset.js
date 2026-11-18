// Recria as tabelas e os dados de exemplo:  npm run db:reset
const { initDb, closeDb } = require('./db');
initDb({ reset: true })
  .then(() => { console.log('Banco recriado com os dados de exemplo.'); return closeDb(); })
  .catch((e) => { console.error('Erro:', e.message); process.exit(1); });
