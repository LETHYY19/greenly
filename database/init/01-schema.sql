-- ============================================================
-- GREENLY — RECRIAR O BANCO DO ZERO (MySQL 8)
-- APAGA as tabelas antigas e cria de novo: PARTE 1 (tabelas) + PARTE 2 (dados)
-- Como usar no Workbench: File > Open SQL Script > escolha este arquivo
-- > clique no raio (Execute All). Depois atualize a lista de Schemas.
-- ============================================================
 
-- PARTE 1 — TABELAS
CREATE DATABASE IF NOT EXISTS greenly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE greenly;
 
-- ------------------------------------------------------------
-- LIMPEZA: apaga as tabelas antigas do banco greenly (as do script
-- anterior e as deste), para que tudo fique na estrutura que o site usa.
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notificacao_leitura;
DROP TABLE IF EXISTS sessoes;
DROP TABLE IF EXISTS usuario_estufa;
DROP TABLE IF EXISTS colaboradores;
DROP TABLE IF EXISTS lotes;
DROP TABLE IF EXISTS notificacoes;
DROP TABLE IF EXISTS empresas;
DROP TABLE IF EXISTS estufas;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;
 
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
 
 
-- ============================================================
-- PARTE 2 — DADOS DE EXEMPLO (os mesmos que o backend cria sozinho)
-- Como a limpeza acima já apagou tudo, pode rodar o arquivo inteiro.
-- Logins:  admin@greenly.com / admin123   |   isabelly@greenly.com / 123456
-- ============================================================
SET NAMES utf8mb4;
-- Estufas (com as condições ideais e o tempo de rega)
INSERT INTO estufas (id, nome, cultura, icone, area, localizacao, etapa, rega_minutos, temp_min, temp_max, ar_min, ar_max, solo_min, solo_max, lux_min, lux_max, base_temp, base_ar, base_solo, base_lux) VALUES
  (1, 'Estufa de Morango', 'Morango', 'morango', 120, 'Setor A', 2, 20, 16, 26, 60, 80, 50, 75, 6000, 12000, 22.0, 70, 62, 9000),
  (2, 'Estufa de Uva', 'Uva', 'uva', 200, 'Setor B', 3, 15, 20, 30, 50, 70, 40, 65, 8000, 15000, 25.0, 60, 52, 11000),
  (3, 'Estufa de Tomate', 'Tomate', 'tomate', 150, 'Setor C', 2, 25, 20, 28, 60, 80, 50, 75, 8000, 14000, 24.5, 66, 31, 9500),
  (4, 'Estufa de Alface', 'Alface', 'alface', 90, 'Setor D', 2, 15, 18, 28, 50, 80, 40, 70, 5000, 12000, 24.8, 68, 52, 8200),
  (5, 'Estufa de Ervas', 'Ervas', 'ervas', 60, 'Setor E', 1, 10, 18, 26, 50, 75, 45, 70, 5000, 11000, 21.5, 60, 55, 7000),
  (6, 'Estufa de Laranja', 'Laranja', 'laranja', 300, 'Setor F', 4, 30, 20, 30, 50, 70, 40, 65, 9000, 15000, 25.2, 58, 49, 10400);
-- Usuários (senhas guardadas com hash SHA-256)
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, cargo, telefone) VALUES
  (1, 'Administrador', 'admin@greenly.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Administrador', ''),
  (2, 'Isabelly Gliber', 'isabelly@greenly.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'usuario', 'Colaborador da produção', '(11) 98888-0000'),
  (3, 'Leticia Carvalho', 'leticia@greenly.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'usuario', 'Colaborador da produção', '(11) 97777-1111'),
  (4, 'Verônica Bezerra', 'veronica@greenly.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'usuario', 'Colaborador da produção', '(11) 96666-2222'),
  (5, 'Juliana Campos', 'juliana@greenly.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'usuario', 'Colaborador da produção', '(11) 95555-3333');
-- Estufas liberadas para cada colaborador
INSERT INTO usuario_estufa (usuario_id, estufa_id) VALUES
  (2, 4),
  (2, 3),
  (2, 1),
  (3, 2),
  (4, 3),
  (5, 4);
-- Notificações (mensagens do administrador e alertas da IA)
INSERT INTO notificacoes (id, tipo, titulo, mensagem, prioridade, estufa_id, destino, destinatario_id, remetente, criada_em) VALUES
  (1, 'adm', 'Nova informação disponível', 'O administrador adicionou um novo caso de plantação.', 'info', NULL, 'todos', NULL, 'Administrador', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 120 MINUTE)),
  (2, 'adm', 'Atenção: umidade do solo baixa', 'Verifique se a irrigação está funcionando corretamente.', 'urgente', 3, 'usuario', 2, 'Administrador', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 300 MINUTE)),
  (3, 'adm', 'Atualização do sistema', 'O sistema foi atualizado com novos recursos.', 'info', NULL, 'todos', NULL, 'Administrador', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1560 MINUTE)),
  (4, 'adm', 'Nova plantação cadastrada', 'Tomate foi adicionada ao seu painel.', 'ok', 3, 'usuario', 2, 'Administrador', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3000 MINUTE)),
  (5, 'ia', 'Falta de água — Tomate', 'A umidade do solo da Estufa de Tomate está abaixo do necessário.', 'urgente', 3, 'admin', NULL, 'Inteligência Artificial', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 MINUTE)),
  (6, 'ia', 'Temperatura elevada — Morango', 'Acima da faixa recomendada por 20 min.', 'atencao', 1, 'admin', NULL, 'Inteligência Artificial', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 360 MINUTE)),
  (7, 'ia', 'Colheita prevista — Uva', 'Estimativa de colheita em 2 dias.', 'ok', 2, 'admin', NULL, 'Inteligência Artificial', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1320 MINUTE));
-- Notificações já lidas
INSERT INTO notificacao_leitura (notificacao_id, usuario_id) VALUES
  (4, 2),
  (6, 1),
  (7, 1);
-- Empresas compradoras
INSERT INTO empresas (id, nome, segmento, contato) VALUES
  (1, 'Del Valle', 'Indústria de sucos', 'compras@delvalle.com'),
  (2, 'Doces da Serra', 'Geleias e doces', 'contato@docesdaserra.com'),
  (3, 'Polpas Vale Verde', 'Polpas de fruta', 'vendas@valeverde.com');
-- Lotes para comercialização
INSERT INTO lotes (id, produto, quantidade, qualidade, codigo, disponibilidade, empresa_id) VALUES
  (1, 'Laranja', 800, 'A', 'Lote 025', 'Disponível', 1),
  (2, 'Laranja', 500, 'A', 'Lote 024', 'Reservado', 1),
  (3, 'Uva', 600, 'A', 'Lote 026', 'Disponível', 2),
  (4, 'Morango', 420, 'A', 'Lote 027', 'Disponível', NULL),
  (5, 'Tomate', 350, 'B', 'Lote 028', 'Em análise', NULL);
-- Conferir (esperado: usuarios 5, estufas 6, usuario_estufa 6, notificacoes 7, empresas 3, lotes 5)
SELECT 'usuarios' AS tabela, COUNT(*) AS linhas FROM usuarios
UNION ALL SELECT 'estufas', COUNT(*) FROM estufas
UNION ALL SELECT 'usuario_estufa', COUNT(*) FROM usuario_estufa
UNION ALL SELECT 'notificacoes', COUNT(*) FROM notificacoes
UNION ALL SELECT 'empresas', COUNT(*) FROM empresas
UNION ALL SELECT 'lotes', COUNT(*) FROM lotes;

 USE greenly;
SELECT id, email, perfil, ativo, LENGTH(senha_hash) AS tamanho, LEFT(senha_hash, 8) AS inicio
FROM usuarios;

USE greenly;
UPDATE usuarios
SET senha_hash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    perfil = 'usuario',
    ativo = 1
WHERE email IN ('isabelly@greenly.com','leticia@greenly.com','veronica@greenly.com','juliana@greenly.com');

-- ============================================================
-- AJUSTE DOS VALORES DOS SENSORES (mude só os números)
-- ============================================================
USE greenly;

UPDATE estufas SET base_temp = 22.0, base_ar = 70, base_solo = 62, base_lux = 9000  WHERE id = 1; -- Morango
UPDATE estufas SET base_temp = 25.0, base_ar = 60, base_solo = 52, base_lux = 11000 WHERE id = 2; -- Uva
UPDATE estufas SET base_temp = 24.5, base_ar = 66, base_solo = 31, base_lux = 9500  WHERE id = 3; -- Tomate
UPDATE estufas SET base_temp = 30,   base_ar = 68, base_solo = 52, base_lux = 8200  WHERE id = 4; -- Alface
UPDATE estufas SET base_temp = 21.5, base_ar = 60, base_solo = 55, base_lux = 7000  WHERE id = 5; -- Ervas
UPDATE estufas SET base_temp = 25.2, base_ar = 58, base_solo = 49, base_lux = 10400 WHERE id = 6; -- Laranja

SELECT id, email, perfil, ativo, LENGTH(senha_hash) AS tamanho, LEFT(senha_hash, 8) AS inicio FROM usuarios;

CREATE TABLE `ia_perfis` (
  `estufa_id` int(11) NOT NULL,
  `resumo` text NOT NULL,
  `orientacoes` text NOT NULL,
  `fonte` varchar(20) NOT NULL DEFAULT 'padrao',
  `modelo` varchar(60) NOT NULL DEFAULT '',
  `atualizado_em` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`estufa_id`),
  CONSTRAINT `ia_perfis_ibfk_1` FOREIGN KEY (`estufa_id`) REFERENCES `estufas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
