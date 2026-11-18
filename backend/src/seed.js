// Dados de exemplo (inseridos só quando o banco está vazio)
const { hash } = require('./store');

const dt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
const horasAtras = (h) => dt(new Date(Date.now() - h * 3600 * 1000));

// [nome, cultura, icone, area, localizacao, etapa, rega, [tempMin,tempMax], [arMin,arMax], [soloMin,soloMax], [luxMin,luxMax], [baseTemp, baseAr, baseSolo, baseLux]]
const ESTUFAS = [
  ['Estufa de Morango', 'Morango', 'morango', 120, 'Setor A', 2, 20, [16, 26], [60, 80], [50, 75], [6000, 12000], [22.0, 70, 62, 9000]],
  ['Estufa de Uva', 'Uva', 'uva', 200, 'Setor B', 3, 15, [20, 30], [50, 70], [40, 65], [8000, 15000], [25.0, 60, 52, 11000]],
  ['Estufa de Tomate', 'Tomate', 'tomate', 150, 'Setor C', 2, 25, [20, 28], [60, 80], [50, 75], [8000, 14000], [24.5, 66, 31, 9500]],
  ['Estufa de Alface', 'Alface', 'alface', 90, 'Setor D', 2, 15, [18, 28], [50, 80], [40, 70], [5000, 12000], [24.8, 68, 52, 8200]],
  ['Estufa de Ervas', 'Ervas', 'ervas', 60, 'Setor E', 1, 10, [18, 26], [50, 75], [45, 70], [5000, 11000], [21.5, 60, 55, 7000]],
  ['Estufa de Laranja', 'Laranja', 'laranja', 300, 'Setor F', 4, 30, [20, 30], [50, 70], [40, 65], [9000, 15000], [25.2, 58, 49, 10400]],
];

async function seed(pool) {
  const q = (sql, p = []) => pool.query(sql, p);

  for (const e of ESTUFAS) {
    await q(
      `INSERT INTO estufas (nome, cultura, icone, area, localizacao, etapa, rega_minutos, temp_min, temp_max, ar_min, ar_max, solo_min, solo_max, lux_min, lux_max, base_temp, base_ar, base_solo, base_lux)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [e[0], e[1], e[2], e[3], e[4], e[5], e[6], ...e[7], ...e[8], ...e[9], ...e[10], ...e[11]]
    );
  }

  const usuarios = [
    ['Administrador', 'admin@greenly.com', 'admin123', 'admin', 'Administrador', ''],
    ['Isabelly Gliber', 'isabelly@greenly.com', '123456', 'usuario', 'Colaborador da produção', '(11) 98888-0000'],
    ['Leticia Carvalho', 'leticia@greenly.com', '123456', 'usuario', 'Colaborador da produção', '(11) 97777-1111'],
    ['Verônica Bezerra', 'veronica@greenly.com', '123456', 'usuario', 'Colaborador da produção', '(11) 96666-2222'],
    ['Juliana Campos', 'juliana@greenly.com', '123456', 'usuario', 'Colaborador da produção', '(11) 95555-3333'],
  ];
  for (const u of usuarios) {
    await q('INSERT INTO usuarios (nome, email, senha_hash, perfil, cargo, telefone) VALUES (?,?,?,?,?,?)', [u[0], u[1], hash(u[2]), u[3], u[4], u[5]]);
  }
  // estufas liberadas para cada colaborador (usuário id → estufas)
  const liberadas = { 2: [4, 3, 1], 3: [2], 4: [3], 5: [4] };
  for (const [uid, ids] of Object.entries(liberadas)) for (const eid of ids) await q('INSERT INTO usuario_estufa (usuario_id, estufa_id) VALUES (?,?)', [Number(uid), eid]);

  // [tipo, titulo, mensagem, prioridade, estufa, destino, destinatario, remetente, horasAtras]
  const notifs = [
    ['adm', 'Nova informação disponível', 'O administrador adicionou um novo caso de plantação.', 'info', null, 'todos', null, 'Administrador', 2],
    ['adm', 'Atenção: umidade do solo baixa', 'Verifique se a irrigação está funcionando corretamente.', 'urgente', 3, 'usuario', 2, 'Administrador', 5],
    ['adm', 'Atualização do sistema', 'O sistema foi atualizado com novos recursos.', 'info', null, 'todos', null, 'Administrador', 26],
    ['adm', 'Nova plantação cadastrada', 'Tomate foi adicionada ao seu painel.', 'ok', 3, 'usuario', 2, 'Administrador', 50],
    ['ia', 'Falta de água — Tomate', 'A umidade do solo da Estufa de Tomate está abaixo do necessário.', 'urgente', 3, 'admin', null, 'Inteligência Artificial', 0.4],
    ['ia', 'Temperatura elevada — Morango', 'Acima da faixa recomendada por 20 min.', 'atencao', 1, 'admin', null, 'Inteligência Artificial', 6],
    ['ia', 'Colheita prevista — Uva', 'Estimativa de colheita em 2 dias.', 'ok', 2, 'admin', null, 'Inteligência Artificial', 22],
  ];
  for (const n of notifs) {
    await q('INSERT INTO notificacoes (tipo, titulo, mensagem, prioridade, estufa_id, destino, destinatario_id, remetente, criada_em) VALUES (?,?,?,?,?,?,?,?,?)', [n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], horasAtras(n[8])]);
  }
  // já lidas: a nº 4 pela Isabelly; as nº 6 e 7 pelo administrador
  for (const [nid, uid] of [[4, 2], [6, 1], [7, 1]]) await q('INSERT INTO notificacao_leitura (notificacao_id, usuario_id) VALUES (?,?)', [nid, uid]);

  const empresas = [
    ['Del Valle', 'Indústria de sucos', 'compras@delvalle.com'],
    ['Doces da Serra', 'Geleias e doces', 'contato@docesdaserra.com'],
    ['Polpas Vale Verde', 'Polpas de fruta', 'vendas@valeverde.com'],
  ];
  for (const e of empresas) await q('INSERT INTO empresas (nome, segmento, contato) VALUES (?,?,?)', e);

  const lotes = [
    ['Laranja', 800, 'A', 'Lote 025', 'Disponível', 1],
    ['Laranja', 500, 'A', 'Lote 024', 'Reservado', 1],
    ['Uva', 600, 'A', 'Lote 026', 'Disponível', 2],
    ['Morango', 420, 'A', 'Lote 027', 'Disponível', null],
    ['Tomate', 350, 'B', 'Lote 028', 'Em análise', null],
  ];
  for (const l of lotes) await q('INSERT INTO lotes (produto, quantidade, qualidade, codigo, disponibilidade, empresa_id) VALUES (?,?,?,?,?,?)', l);
}

module.exports = { seed };
