-- ============================================================
-- GREENLY — Estrutura das tabelas (MySQL 8)
-- Executado automaticamente pelo backend na inicialização (db.js)
-- ============================================================

-- Administrador e colaboradores (usuários do sistema)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash CHAR(64) NOT NULL,
  perfil ENUM('admin','usuario') NOT NULL DEFAULT 'usuario',
  cargo VARCHAR(80) NOT NULL DEFAULT 'Colaborador da produção',
  telefone VARCHAR(30) NOT NULL DEFAULT '',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estufas, com as condições ideais definidas pelo administrador
CREATE TABLE IF NOT EXISTS estufas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cultura VARCHAR(60) NOT NULL,
  icone VARCHAR(60) NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  localizacao VARCHAR(80) NOT NULL DEFAULT 'Setor —',
  etapa TINYINT NOT NULL DEFAULT 0,
  rega_minutos INT NOT NULL DEFAULT 20,
  temp_min DECIMAL(6,2) NOT NULL,
  temp_max DECIMAL(6,2) NOT NULL,
  ar_min DECIMAL(6,2) NOT NULL,
  ar_max DECIMAL(6,2) NOT NULL,
  solo_min DECIMAL(6,2) NOT NULL,
  solo_max DECIMAL(6,2) NOT NULL,
  lux_min INT NOT NULL,
  lux_max INT NOT NULL,
  base_temp DECIMAL(6,2) NOT NULL,
  base_ar DECIMAL(6,2) NOT NULL,
  base_solo DECIMAL(6,2) NOT NULL,
  base_lux INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Quais estufas cada colaborador pode acompanhar (liberadas pelo administrador)
CREATE TABLE IF NOT EXISTS usuario_estufa (
  usuario_id INT NOT NULL,
  estufa_id INT NOT NULL,
  PRIMARY KEY (usuario_id, estufa_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (estufa_id) REFERENCES estufas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mensagens do administrador (tipo 'adm') e alertas da IA (tipo 'ia')
CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('adm','ia') NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  mensagem TEXT NOT NULL,
  prioridade ENUM('urgente','atencao','info','ok') NOT NULL DEFAULT 'info',
  estufa_id INT NULL,
  destino ENUM('todos','usuario','admin') NOT NULL DEFAULT 'todos',
  destinatario_id INT NULL,
  remetente VARCHAR(80) NOT NULL DEFAULT 'Administrador',
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estufa_id) REFERENCES estufas(id) ON DELETE SET NULL,
  FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Quem já leu cada notificação
CREATE TABLE IF NOT EXISTS notificacao_leitura (
  notificacao_id INT NOT NULL,
  usuario_id INT NOT NULL,
  PRIMARY KEY (notificacao_id, usuario_id),
  FOREIGN KEY (notificacao_id) REFERENCES notificacoes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Empresas compradoras e lotes para comercialização
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  segmento VARCHAR(120) NOT NULL,
  contato VARCHAR(160) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto VARCHAR(60) NOT NULL,
  quantidade INT NOT NULL,
  qualidade CHAR(1) NOT NULL,
  codigo VARCHAR(20) NOT NULL DEFAULT '',
  disponibilidade ENUM('Disponível','Reservado','Em análise') NOT NULL DEFAULT 'Disponível',
  empresa_id INT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sessões de login (token enviado no cabeçalho Authorization)
CREATE TABLE IF NOT EXISTS sessoes (
  token CHAR(48) PRIMARY KEY,
  usuario_id INT NOT NULL,
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Perfis aprendidos pela IA para cada estufa
CREATE TABLE IF NOT EXISTS ia_perfis (
  estufa_id INT NOT NULL PRIMARY KEY,
  resumo TEXT NOT NULL,
  orientacoes TEXT NOT NULL,
  fonte VARCHAR(20) NOT NULL DEFAULT 'padrao',
  modelo VARCHAR(60) NOT NULL DEFAULT '',
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estufa_id) REFERENCES estufas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
