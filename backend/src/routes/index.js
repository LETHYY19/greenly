// Junta todas as rotas da API (os endereços continuam os mesmos de sempre)
const { Router } = require('express');

const router = Router();
router.use('/auth', require('./auth.routes'));
router.use('/estufas', require('./estufas.routes'));
router.use('/colaboradores', require('./colaboradores.routes'));
router.use('/notificacoes', require('./notificacoes.routes'));
router.use('/empresas', require('./empresas.routes'));
router.use('/lotes', require('./lotes.routes'));
router.use('/resumo', require('./resumo.routes'));
router.use('/ia', require('./ia.routes'));

module.exports = router;
