const { app } = require('./app');
const { initDb } = require('./db');
const ia = require('./services/ia.service');

const PORT = process.env.PORT || 8080;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Greenly API rodando em http://localhost:${PORT}`);
      console.log('Admin:   admin@greenly.com / admin123');
      console.log('Usuário: isabelly@greenly.com / 123456');
      ia.iniciarMonitor(); // IA: aprende as estufas e confere os sensores a cada 1 minuto
    });
  })
  .catch((err) => {
    console.error('\nNão foi possível conectar ao MySQL:', err.message);
    console.error('Confira se o MySQL está rodando e se o arquivo .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) está correto.\n');
    process.exit(1);
  });
