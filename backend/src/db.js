// ============================================================
// Conexão com o MySQL (mysql2). Configure no arquivo .env
// ============================================================
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = () => ({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'greenly',
});

let pool = null;

function getPool() {
  if (!pool) throw new Error('Banco de dados não iniciado. Chame initDb() primeiro.');
  return pool;
}

// lê o schema.sql e devolve os comandos (sem CREATE DATABASE / USE: o nome do banco vem do .env)
function comandosDoSchema() {
  const sql = fs.readFileSync(path.join('../..', 'database', 'init', '01-schema.sql'), 'utf8');
  return sql
    .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n')
    .split(';').map((s) => s.trim()).filter(Boolean)
    .filter((s) => !/^(CREATE DATABASE|USE)\b/i.test(s));
}

// ordem segura para apagar (filhos primeiro)
const TABELAS = ['ia_perfis', 'notificacao_leitura', 'sessoes', 'usuario_estufa', 'lotes', 'notificacoes', 'empresas', 'estufas', 'usuarios'];

async function initDb({ reset = false } = {}) {
  const c = config();
  // 1) cria o banco se ainda não existir
  const conexao = await mysql.createConnection({ host: c.host, port: c.port, user: c.user, password: c.password });
  await conexao.query(`CREATE DATABASE IF NOT EXISTS \`${c.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conexao.end();

  // 2) abre o pool de conexões
  if (pool) await pool.end();
  pool = mysql.createPool({ ...c, waitForConnections: true, connectionLimit: 10, timezone: 'Z', decimalNumbers: true });

  // 3) cria as tabelas (e apaga antes, se reset = true)
  if (reset) for (const t of TABELAS) await pool.query(`DROP TABLE IF EXISTS ${t}`);
  for (const cmd of comandosDoSchema()) await pool.query(cmd);

  // 4) dados de exemplo na primeira execução
  const [linhas] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
  if (Number(linhas[0].total) === 0) await require('./seed').seed(pool);
  return pool;
}

async function closeDb() {
  if (pool) { await pool.end(); pool = null; }
}

module.exports = { getPool, initDb, closeDb };
